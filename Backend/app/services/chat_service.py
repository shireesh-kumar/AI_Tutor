"""
Chat service with RAG (Retrieval-Augmented Generation).
Searches Qdrant for relevant transcript chunks and generates responses using Gemini.
"""
import os
from google import genai
from qdrant_client import QdrantClient
from dotenv import load_dotenv
from app.utils.logger import get_logger
from app.utils.youtube_utils import fetch_youtube_video_id

load_dotenv()

logger = get_logger(__name__)

# Initialize clients
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
QDRANT_API_KEY = os.getenv('QDRANT_API_KEY')
QDRANT_URL = os.getenv('QDRANT_URL')

client = genai.Client(api_key=GEMINI_API_KEY)
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

EMBEDDING_MODEL = "gemini-embedding-001"
CHAT_MODEL = "gemini-2.5-flash"


def search_relevant_chunks(video_id: str, query: str, limit: int = 5) -> list:
    """
    Search Qdrant for relevant transcript chunks based on user query.
    
    Args:
        video_id: YouTube video ID (collection name)
        query: User's question
        limit: Number of chunks to retrieve
    
    Returns:
        List of relevant transcript chunks with their text
    """
    try:
        # Embed the query
        query_embedding = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=[query]
        ).embeddings[0].values
        
        # Search Qdrant for similar vectors (using query_points method)
        results = qdrant_client.query_points(
            collection_name=video_id,
            query=query_embedding,
            limit=limit
        )
        
        # Extract text from results
        chunks = [point.payload['text'] for point in results.points]
        logger.info(f"Retrieved {len(chunks)} relevant chunks for query")
        return chunks
        
    except Exception as e:
        logger.error(f"Error searching Qdrant: {str(e)}", exc_info=True)
        return []


def generate_chat_response(
    video_id: str,
    user_message: str,
    conversation_history: list,
    relevant_chunks: list
) -> str:
    """
    Generate chat response using Gemini with RAG context.
    
    Args:
        video_id: YouTube video ID
        user_message: Current user message
        conversation_history: List of previous messages
        relevant_chunks: Relevant transcript chunks from RAG
    
    Returns:
        Generated response text
    """
    try:
        # Build context from relevant chunks
        context = "\n\n".join(relevant_chunks) if relevant_chunks else "No relevant context found."
        
        # Build system prompt
        system_prompt = f"""You are a helpful tutor answering questions about a YouTube video transcript.

            Video Transcript Context:
            {context}

            Instructions:
            - Answer based ONLY on the transcript context provided
            - If the answer isn't in the context, say so
            - Be concise and helpful
            - Reference timestamps when relevant (they appear in [MM:SS] format in the context)
            """
        
        # Build conversation content
        # Start with system context
        full_prompt = f"{system_prompt}\n\n"
        
        # Add conversation history (last 5 messages)
        for msg in conversation_history[-5:]:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role == 'user':
                full_prompt += f"User: {content}\n\n"
            elif role == 'assistant':
                full_prompt += f"Assistant: {content}\n\n"
        
        # Add current user message
        full_prompt += f"User: {user_message}\n\nAssistant:"
        
        # Generate response
        response = client.models.generate_content(
            model=CHAT_MODEL,
            contents=full_prompt
        )
        
        # Extract text from response
        if hasattr(response, 'text'):
            return response.text
        elif hasattr(response, 'candidates') and response.candidates:
            return response.candidates[0].content.parts[0].text
        else:
            return str(response)
        
    except Exception as e:
        logger.error(f"Error generating chat response: {str(e)}", exc_info=True)
        raise


def chat_with_rag(url: str, message: str, conversation_history: list) -> dict:
    """
    Main chat function with RAG pipeline.
    
    Args:
        url: YouTube video URL
        message: Current user message
        conversation_history: List of previous messages
    
    Returns:
        Response dict with result and data
    """
    try:
        # Extract video ID
        video_id = fetch_youtube_video_id(url)
        if not video_id:
            return {
                "result": False,
                "status_code": 400,
                "message": "Could not extract video ID from URL"
            }
        
        # Step 1: Search for relevant chunks (RAG)
        relevant_chunks = search_relevant_chunks(video_id, message, limit=5)
        
        if not relevant_chunks:
            return {
                "result": False,
                "status_code": 404,
                "message": "No embeddings found for this video. Please create embeddings first."
            }
        
        # Step 2: Generate response with context
        response_text = generate_chat_response(
            video_id=video_id,
            user_message=message,
            conversation_history=conversation_history,
            relevant_chunks=relevant_chunks
        )
        
        return {
            "result": True,
            "status_code": 200,
            "data": {
                "response": response_text
            }
        }
        
    except Exception as e:
        logger.error(f"Error in chat_with_rag: {str(e)}", exc_info=True)
        return {
            "result": False,
            "status_code": 500,
            "message": f"Chat error: {str(e)}"
        }

