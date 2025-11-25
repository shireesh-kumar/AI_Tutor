import re
import requests
from models.response import Response

def fetch_youtube_video_id(url:str) -> str:
    """
    Extracts the YouTube video ID from a given URL.
    Args:
        url (str): The YouTube video URL.
    """
    #https://www.youtube.com/watch?v=AscAUW0ZVo0&t=1130s
    
    value = re.search(r'v=([^&]+)', url)
    if value:
        return value.group(1)
    return ""

def validate_youtube_url(url: str) -> Response:
    """
    Validates if the given URL is a proper YouTube video URL.
    Args:
        url (str): The YouTube video URL.
    """

    # Check URL pattern first
    youtube_regex = re.compile(
        r'^(https?://)?(www\.)?'
        r'(youtube\.com/watch\?v=|youtu\.be/)'
        r'[\w-]{11}(&\S*)?$'
    )
    if not youtube_regex.match(url):
        return Response.failure(message="Invalid YouTube URL format.", status_code=400)
    try:
        response = requests.get(url, timeout=10)
        return Response.success() if response.status_code == 200 else Response.failure(message="Invalid YouTube URL.", status_code=response.status_code)
    except Exception as e:
        return Response.failure(message=f"Error accessing the URL: {str(e)}", status_code=response.status_code)
        
