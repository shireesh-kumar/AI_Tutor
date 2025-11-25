from pydantic import BaseModel, Field
from typing import List, Dict

class QuizQuestion(BaseModel):
    question: str = Field(description="The quiz question")
    options: Dict[str, str] = Field(description="Answer options (A, B, C, etc.)")
    correct_answer: str = Field(description="The correct option letter")
    explanation: str = Field(description="Explanation of the answer")
    timestamp: str = Field(description="Timestamp in MM:SS format")
    timestamp_seconds: int = Field(description="Timestamp in seconds")
    transcript_reference: str = Field(description="Quote from transcript")

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
