from fastapi import APIRouter
from services.youtube_quiz import generate_quiz
from fastapi.responses import JSONResponse

quiz_router = APIRouter()

@quiz_router.get("/")
def get_quiz(url:str,num_ques,difficulty):
    """
    Endpoint to generate a quiz based on the transcript.
    """
    response = generate_quiz(url, num_ques, difficulty)
    return JSONResponse(
        content= response.to_dict(),
        status_code=response.status_code
    )



