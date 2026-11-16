"""
Chat service with RAG (Retrieval-Augmented Generation).

- Gemini: query embeddings only (must match stored vectors)
- Claude: chat answers
- Qdrant: vector search
"""
import os
from anthropic import Anthropic
from google import genai
from qdrant_client import QdrantClient
from dotenv import load_dotenv
from app.utils.logger import get_logger
from app.utils.youtube_utils import fetch_youtube_video_id

load_dotenv()

logger = get_logger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
CHAT_MODEL = os.getenv("MODEL_NAME", "claude-sonnet-4-5-20250929")

embedding_client = genai.Client(api_key=GEMINI_API_KEY)
chat_client = Anthropic(api_key=ANTHROPIC_API_KEY)

_qdrant_kwargs = {"url": QDRANT_URL}
if QDRANT_API_KEY:
    _qdrant_kwargs["api_key"] = QDRANT_API_KEY
qdrant_client = QdrantClient(**_qdrant_kwargs)

EMBEDDING_MODEL = "gemini-embedding-001"


def search_relevant_chunks(video_id: str, query: str, limit: int = 5) -> list:
    """Embed the query with Gemini, then search Qdrant for similar chunks."""
    try:
        query_embedding = embedding_client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=[query],
        ).embeddings[0].values

        results = qdrant_client.query_points(
            collection_name=video_id,
            query=query_embedding,
            limit=limit,
        )

        chunks = [point.payload["text"] for point in results.points]
        logger.info(f"Retrieved {len(chunks)} relevant chunks for query")
        return chunks

    except Exception as e:
        logger.error(f"Error searching Qdrant: {str(e)}", exc_info=True)
        return []


def generate_chat_response(
    video_id: str,
    user_message: str,
    conversation_history: list,
    relevant_chunks: list,
) -> str:
    """Generate a chat answer with Claude using retrieved transcript context."""
    try:
        context = "\n\n".join(relevant_chunks) if relevant_chunks else "No relevant context found."

        system_prompt = f"""You are a helpful tutor answering questions about a YouTube video transcript.

Video Transcript Context:
{context}

Instructions:
- Answer based ONLY on the transcript context provided
- If the answer isn't in the context, say so
- Be concise and helpful
- Reference timestamps when relevant (they appear in [MM:SS] format in the context)
"""

        messages = []
        for msg in conversation_history[-5:]:
            role = msg.get("role", "user")
            content = (msg.get("content") or "").strip()
            if not content:
                continue
            if role in ("user", "assistant"):
                messages.append({"role": role, "content": content})

        # Anthropic requires the last message to be from the user
        if not messages or messages[-1]["role"] != "user":
            messages.append({"role": "user", "content": user_message})
        elif messages[-1]["content"] != user_message:
            messages.append({"role": "user", "content": user_message})

        response = chat_client.messages.create(
            model=CHAT_MODEL,
            max_tokens=1024,
            system=system_prompt,
            messages=messages,
        )

        parts = []
        for block in response.content:
            text = getattr(block, "text", None)
            if text:
                parts.append(text)
        return "\n".join(parts).strip() or str(response.content)

    except Exception as e:
        logger.error(f"Error generating chat response: {str(e)}", exc_info=True)
        raise


def chat_with_rag(url: str, message: str, conversation_history: list) -> dict:
    """Main chat function with RAG pipeline."""
    try:
        video_id = fetch_youtube_video_id(url)
        if not video_id:
            return {
                "result": False,
                "status_code": 400,
                "message": "Could not extract video ID from URL",
            }

        relevant_chunks = search_relevant_chunks(video_id, message, limit=5)
        if not relevant_chunks:
            return {
                "result": False,
                "status_code": 404,
                "message": "No embeddings found for this video. Please create embeddings first.",
            }

        response_text = generate_chat_response(
            video_id=video_id,
            user_message=message,
            conversation_history=conversation_history,
            relevant_chunks=relevant_chunks,
        )

        return {
            "result": True,
            "status_code": 200,
            "data": {"response": response_text},
        }

    except Exception as e:
        logger.error(f"Error in chat_with_rag: {str(e)}", exc_info=True)
        return {
            "result": False,
            "status_code": 500,
            "message": f"Chat error: {str(e)}",
        }
