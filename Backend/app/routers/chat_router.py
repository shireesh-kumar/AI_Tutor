from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from app.services.chat_service import chat_with_rag
from fastapi.responses import JSONResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

chat_router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    url: str
    message: str
    conversation_history: List[ChatMessage]


@chat_router.post("")
@chat_router.post("/")
def chat(request: ChatRequest) -> dict:
    """
    Chat endpoint with RAG (Retrieval-Augmented Generation).
    
    Args:
        request: Chat request with URL, message, and conversation history
    
    Returns:
        Chat response with AI-generated answer
    """
    try:
        # Convert Pydantic models to dicts
        history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
        
        # Call chat service
        result = chat_with_rag(
            url=request.url,
            message=request.message,
            conversation_history=history
        )
        
        return JSONResponse(
            content=result,
            status_code=result.get("status_code", 200)
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        return JSONResponse(
            content={
                "result": False,
                "status_code": 500,
                "message": f"Chat endpoint error: {str(e)}"
            },
            status_code=500
        )

