from fastapi import APIRouter
from utils.youtube_utils import validate_youtube_url
from fastapi.responses import JSONResponse

validate_router = APIRouter()

@validate_router.get("/")
def validate_link(url:str):
    """
    Endpoint to validate a YouTube video link.
    Args:
        url (str): The YouTube video URL.
    """
    response = validate_youtube_url(url)
    return JSONResponse(
        content=response.to_dict(),
        status_code=response.status_code
    )

    