from fastapi import APIRouter, BackgroundTasks
from app.services.youtube_transcript import get_yt_transcript
from app.utils.youtube_utils import fetch_youtube_video_id
from app.services.embedding_service import embed_and_store_transcript
from fastapi.responses import JSONResponse

transcript_router = APIRouter()

@transcript_router.get("")
def get_transcript(url: str, background_tasks: BackgroundTasks) -> dict:
    """
    Endpoint to fetch the transcript of a YouTube video.
    Triggers background embedding and storage in Qdrant.
    Args:
        url (str): The YouTube video URL.
        background_tasks: FastAPI background tasks for async processing.
    """
    response = get_yt_transcript(url)
        
    return JSONResponse(
        content=response.to_dict(),
        status_code=response.status_code
    )

