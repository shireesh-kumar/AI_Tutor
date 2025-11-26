from app.utils.youtube_utils import *
from app.models.response import Response
import yt_dlp
import requests
import pysrt

def extract_captions(captions,msg):
    for caption in captions:
        if caption.get('ext') == 'srt':
            try:
                transcript_response = requests.get(caption['url'])
                if transcript_response.status_code == 200:
                    subs = pysrt.from_string(transcript_response.text)
                    formatted_transcript = "\n".join([f"[{sub.start.minutes:02d}:{sub.start.seconds:02d}] {sub.text}" for sub in subs])
                    return Response.success(data= formatted_transcript, message=msg)
                else:
                    return Response.failure(message="Failed to fetch subtitles.", status_code=transcript_response.status_code)
            except Exception as e:
                return Response.failure(message=f"Error fetching subtitles: {str(e)}", status_code=500)
        
    return Response.failure(message="Subtitles found but not in SRT format.", status_code=415)
    
def get_yt_transcript(url:str) -> Response:
    """
    Fetches the transcript for a given YouTube video URL.
    Args:
        url (str): The YouTube video URL.   
    """
    ydl_opts = {
        'skip_download': True,
    }
    
    #Moved to UI for lower latency
    # res = validate_youtube_url(url)
    # if not res.result:
    #     return res
    
    video_id = fetch_youtube_video_id(url)
    if not video_id:
        return Response.failure(message="Could not extract video ID from URL.", status_code=400)
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Check manual subtitles first
            if 'subtitles' in info and 'en' in info['subtitles']:
                captions = info['subtitles']['en']
                return extract_captions(captions,"Manual substitles found")
            
            # Check auto-generated captions
            if 'automatic_captions' in info and 'en' in info['automatic_captions']:
                captions = info['automatic_captions']['en']
                return extract_captions(captions, "Auto-generated captions found")
            
            return Response.failure(message="No English subtitles found for this video.", status_code=404)
        
    except Exception as e:
        return Response.failure(message=f" Transcript Extraction Failed : {str(e)}", status_code=500)