from services.youtube_transcript import get_yt_transcript
from prompts import SYSTEM_PROMPT
from models.quiz import QuizResponse
from models.response import Response

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
    
    formatted_prompt = SYSTEM_PROMPT.format(
        transcript_data = transcript.data ,
        difficulty=  difficulty,
        num_questions= num_questions
    )
    try: 
        agent = ChatAnthropic(
            temperature= os.getenv("TEMPERATURE"),
            model_name= os.getenv("MODEL_NAME"),
        ).with_structured_output(QuizResponse)

        response = agent.invoke(formatted_prompt)
        return Response.success(data = response.model_dump())
    except Exception as e:
        return Response.failure(message=str(e), status_code=500)
    
