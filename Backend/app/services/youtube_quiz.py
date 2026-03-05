from app.services.youtube_transcript import get_yt_transcript
from app.prompts import SYSTEM_PROMPT
from app.models.quiz import QuizResponse
from app.models.response import Response

from langchain_anthropic import ChatAnthropic

from dotenv import load_dotenv
import os

load_dotenv()

def generate_quiz(url:str, num_questions:int, difficulty:int) -> dict:
    """
    Generates a quiz based on the transcript of a YouTube video.
    Args:
        url (str): The YouTube video URL.
    Returns:
        dict: A dictionary containing quiz questions and answers.
    """
    transcript = get_yt_transcript(url)
    if transcript.status_code != 200:
        return transcript
    
    # Convert transcript_data (list of dicts) to string for quiz generation
    transcript.data  # This is a list of dicts
    
    formatted_prompt = SYSTEM_PROMPT.format(
        transcript_data = str(transcript.data),
        difficulty=  difficulty,
        num_questions= num_questions
    )
    try: 
        agent = ChatAnthropic(
            model=os.getenv("MODEL_NAME"),
            temperature=float(os.getenv("TEMPERATURE")),
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        ).with_structured_output(QuizResponse)

        response = agent.invoke(formatted_prompt)
        return Response.success(data = response.model_dump())
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return Response.failure(message=f"Quiz generation failed: {str(e)}\nDetails: {error_details}", status_code=500)
    
