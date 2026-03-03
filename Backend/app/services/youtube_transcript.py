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
        API_KEY = os.getenv('API_KEY', 'sk_JDb3IEh60vEw0zwOD9_MRvuwvTipPD9Q1mb1hfE7DEU')
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
        
        # Format transcript as string with timestamps (matching prompt expectations)
        # formatted_lines = []
        # for item in transcript_data:
        #     # Handle different timestamp field names (timestamp, start, start_time, time)
        #     timestamp = item.get('timestamp') or item.get('start') or item.get('start_time') or item.get('time') or 0
            
        #     # Convert to MM:SS format if it's a number (seconds)
        #     if isinstance(timestamp, (int, float)):
        #         minutes = int(timestamp // 60)
        #         seconds = int(timestamp % 60)
        #         timestamp_str = f"{minutes:02d}:{seconds:02d}"
        #     else:
        #         timestamp_str = str(timestamp) if timestamp else "00:00"
            
        #     text = item.get('text', '') or item.get('content', '')
        #     formatted_lines.append(f"[{timestamp_str}] {text}")
        
        # formatted_transcript = "\n".join(formatted_lines)
        
        return Response.success(data=str(transcript_data), message="Transcript found")
    
    except Exception as e:
        return Response.failure(message=f"Transcript extraction failed: {str(e)}", status_code=500)