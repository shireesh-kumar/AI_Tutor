from fastapi import APIRouter
from services.youtube_transcript import get_yt_transcript
from fastapi.responses import JSONResponse

transcript_router = APIRouter()

@transcript_router.get("/")
def get_transcript(url:str) ->dict:
    """
    Endpoint to fetch the transcript of a YouTube video.
    Args:
        url (str): The YouTube video URL.
    """
    response = get_yt_transcript(url)
    return JSONResponse(
        content=response.to_dict(),
        status_code=response.status_code
    )

