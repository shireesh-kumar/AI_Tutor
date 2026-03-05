# 🎓 AI Tutor

AI Tutor is an AI-powered learning assistant that converts YouTube videos into interactive quizzes and allows users to chat with the video content using a Retrieval Augmented Generation (RAG) chatbot.

The application extracts the transcript from a YouTube video, generates quizzes with timestamp references, and enables users to ask questions about the video through an AI chatbot.

---

# 🚀 Live Deployment

Frontend: Deployed on **Vercel**  
Backend: Deployed on **Render**

**Note:**  
The backend runs on the Render free tier. On the first request it may take **30–60 seconds** to respond while the server wakes up.

---

# 🧠 Features

### 📺 YouTube Learning
- Accepts a YouTube video URL
- Extracts transcript from the video
- Processes transcript for AI analysis

### 📝 AI Quiz Generation
- Generates quizzes based on the video transcript
- Supports user-defined quiz requirements
- Each question includes a **timestamp reference**
- Users can jump directly to the exact video segment

### 💬 AI Chatbot with RAG
- Chat with the video content
- Retrieval Augmented Generation (RAG) used for contextual answers
- Relevant transcript segments are retrieved before generating responses
- Helps users clarify concepts explained in the video

---

# 🛠️ Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Deployed on Vercel

## Backend
- FastAPI
- Claude AI model for quiz generation and Gemini for chatbot responses
- Retrieval Augmented Generation (RAG) architecture
- YouTube Transcript API (third-party library)
- Deployed on Render

---

# ⚙️ How It Works

1. User enters a YouTube video URL.
2. Backend extracts the video transcript.
3. Transcript is processed and stored for retrieval.
4. AI generates quizzes based on the transcript.
5. Each quiz question includes a timestamp reference.
6. Users can also interact with the **AI chatbot** which retrieves relevant transcript segments before generating answers.

---

# 📂 Project Structure

```
AI-Tutor
│
├── backend
│   ├── main.py
│   ├── services
│   └── requirements.txt
│
├── frontend
│   ├── src
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# 📦 Local Setup

## Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at

```
http://localhost:8000
```

---

## Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# 🔮 Future Improvements

- User authentication and login
- Save quizzes to user profiles
- Learning history and progress tracking
- Personalized learning dashboard
- Support for multiple videos in a session

---

# 💡 Purpose

AI Tutor helps learners actively engage with YouTube educational content instead of passively watching videos.  

By combining **AI-generated quizzes** and a **RAG-based chatbot**, the platform transforms videos into an interactive learning experience.

---

# 👨‍💻 Author

Shireesh Kumar

Built as a learning project exploring:
- LLM applications
- Retrieval Augmented Generation (RAG)
- Full-stack AI applications