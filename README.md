# 🎓 AI Tutor

AI Tutor is a web application that takes a YouTube video URL, extracts
the transcript, and generates AI-powered quizzes with timestamps. Each
quiz question links to the exact part of the video where the concept is
explained.

------------------------------------------------------------------------

## 🚀 Live Deployment

Frontend: Deployed on Vercel\
Backend: Deployed on Render

**Note:** The backend runs on Render free tier.\
On initial use, it may take 30 to 60 seconds to respond while the server
wakes up.

------------------------------------------------------------------------

## 🧠 Current Features

-   Accepts a YouTube URL\
-   Extracts transcript using a third-party YouTube transcript library\
-   Generates quizzes based on user requirements\
-   Each quiz includes a timestamp reference\
-   Users can jump directly to the relevant part of the video

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React\
-   TypeScript\
-   Deployed on Vercel

### Backend

-   FastAPI\
-   Claude AI model for quiz generation\
-   YouTube Transcript API (third-party library)\
-   Deployed on Render

------------------------------------------------------------------------

## ⚙️ How It Works

1.  User enters a YouTube URL.\
2.  Backend extracts the transcript.\
3.  Transcript is processed by Claude AI.\
4.  AI generates quizzes based on user requirements.\
5.  Each quiz includes timestamp references.

------------------------------------------------------------------------

## 🔮 Planned Features

-   Chatbot integration to discuss video concepts\
-   User authentication and login\
-   Store quizzes in user profiles for later access\
-   Personalized learning dashboard

------------------------------------------------------------------------

## 📦 Local Setup

### Backend (FastAPI)

cd backend\
pip install -r requirements.txt\
uvicorn main:app --reload

### Frontend (React + TypeScript)

cd frontend\
npm install\
npm run dev

------------------------------------------------------------------------

## 💡 Purpose

AI Tutor helps users actively learn from YouTube videos by converting
video content into structured quizzes with direct timestamp references.
