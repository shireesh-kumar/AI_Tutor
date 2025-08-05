from youtube_transcript_api import YouTubeTranscriptApi
import json
import sys

def extract_transcript_details(youtube_video_url):
    try:
        video_id = youtube_video_url.split("=")[1]
        transcript_text = YouTubeTranscriptApi.get_transcript(video_id)
        print(json.dumps(transcript_text))
        
    except Exception as e:
        raise e
    
    
def main():
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: script.py <method_name> <url>"}))
        sys.exit(1)
    method = sys.argv[1]
    url = sys.argv[2]
    if method == "extract_transcript_details":
        extract_transcript_details(url)
        

if __name__ == "__main__":
    main()
    
    