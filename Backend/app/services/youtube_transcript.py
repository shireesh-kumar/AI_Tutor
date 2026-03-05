from app.utils.youtube_utils import fetch_youtube_video_id
from app.models.response import Response
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_yt_transcript(url: str) -> Response:
    video_id = fetch_youtube_video_id(url)
    if not video_id:
        return Response.failure(message="Could not extract video ID from URL.", status_code=400)
    
    try:
        API_KEY = os.getenv('API_KEY')
        api_url = 'https://transcriptapi.com/api/v2/youtube/transcript'
        params = {'video_url': video_id, 'format': 'json'}
        
        response = requests.get(
            api_url, 
            params=params, 
            headers={'Authorization': 'Bearer ' + API_KEY}, 
            timeout=30
        )
        response.raise_for_status()
        
        transcript_data = response.json()['transcript']
        
        # Return raw transcript_data (JSON/list format) for API response
        # Formatting will be done in quiz generation and embedding will process the raw data
        return Response.success(data=transcript_data, message="Transcript found")
    
    except Exception as e:
        return Response.failure(message=f"Transcript extraction failed: {str(e)}", status_code=500)