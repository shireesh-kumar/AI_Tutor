from fastapi import FastAPI
from app.routers.transcript_router import transcript_router
from app.routers.quiz_router import quiz_router
from app.routers.validate_router import validate_router

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.include_router(transcript_router,prefix='/api/transcript')
app.include_router(quiz_router, prefix='/api/quiz')
app.include_router(validate_router,prefix='/api/validate')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     
    allow_credentials=False, 
    allow_methods=["*"],     
    allow_headers=["*"],     
)

handler = app

