from fastapi import APIRouter
from app.services.youtube_transcript import get_yt_transcript
from app.utils.youtube_utils import fetch_youtube_video_id
from app.services.embedding_service import embed_and_store_transcript
from app.models.response import Response
from fastapi.responses import JSONResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

embedding_router = APIRouter()

@embedding_router.post("")
@embedding_router.post("/")
def create_embeddings(url: str) -> dict:
    """
    Endpoint to fetch transcript and create embeddings for a YouTube video.
    Runs synchronously and returns when embedding is complete.
    Args:
        url (str): The YouTube video URL.
    """
    try:
        # Fetch transcript
        transcript_response = get_yt_transcript(url)
        
        if transcript_response.status_code != 200 or not transcript_response.data:
            logger.error(f"Failed to fetch transcript for URL: {url}")
            return JSONResponse(
                content=transcript_response.to_dict(),
                status_code=transcript_response.status_code
            )
        
        # Extract video ID
        video_id = fetch_youtube_video_id(url)
        if not video_id:
            logger.error(f"Could not extract video ID from URL: {url}")
            return JSONResponse(
                content=Response.failure(message="Could not extract video ID from URL.", status_code=400).to_dict(),
                status_code=400
            )
        
        # Get transcript data
        transcript_data = transcript_response.data
        
        # Run embedding synchronously
        logger.info(f"Starting embedding process for video: {video_id}")
        success = embed_and_store_transcript(video_id=video_id, transcript_data=transcript_data)
        
        if success:
            logger.info(f"Successfully completed embedding for video: {video_id}")
            return JSONResponse(
                content=Response.success(
                    message=f"Embeddings created successfully for video: {video_id}",
                    data={"video_id": video_id}
                ).to_dict(),
                status_code=200
            )
        else:
            logger.error(f"Failed to create embeddings for video: {video_id}")
            return JSONResponse(
                content=Response.failure(
                    message=f"Failed to create embeddings for video: {video_id}",
                    status_code=500
                ).to_dict(),
                status_code=500
            )
        
    except Exception as e:
        logger.error(f"Error creating embeddings for URL {url}: {str(e)}", exc_info=True)
        return JSONResponse(
            content=Response.failure(
                message=f"Failed to create embeddings: {str(e)}",
                status_code=500
            ).to_dict(),
            status_code=500
        )

