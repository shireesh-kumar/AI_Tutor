from youtube_transcript_api import YouTubeTranscriptApi
import json
import sys
import requests

def get_free_proxies():
    try:
        response = requests.get("https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=US&ssl=all&anonymity=all&format=textplain", timeout=10)
        if response.status_code == 200:
            proxies = response.text.strip().split('\n')
            return [{'http': f'http://{p.strip()}', 'https': f'http://{p.strip()}'} for p in proxies[:10] if ':' in p]
    except:
        pass
    return []


# def extract_transcript_details(youtube_video_url):
#     try:
#         video_id = youtube_video_url.split("=")[1]
#         transcript_text = YouTubeTranscriptApi.get_transcript(video_id)
#         print(json.dumps(transcript_text))
        
#     except Exception as e:
#         raise e

def extract_transcript_details(youtube_video_url):
    try:
        video_id = youtube_video_url.split("=")[1]
        
        # Try with proxies first
        proxies = get_free_proxies()
        for proxy in proxies:
            try:
                transcript_text = YouTubeTranscriptApi.get_transcript(video_id, proxies=proxy)
                print(json.dumps(transcript_text))
                return
            except:
                continue
        
        # If proxies fail, try without proxy
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
    
    