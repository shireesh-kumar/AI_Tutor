import axios from 'axios';

const isProd = import.meta.env.PROD;
const API_BASE_DEV = import.meta.env.VITE_API_BASE_DEV ;
const API_BASE = import.meta.env.VITE_API_BASE;

export const apiUrl = (path: string) =>
  isProd ? `${API_BASE}${path}` : `${API_BASE_DEV}${path}`;

// API functions
export async function validateVideoUrl(url: string) {
  const response = await axios.get(apiUrl('/validate'), {
    params: { url }
  });
  return response.data;
}

export async function getQuiz(videoUrl: string, numQuestions: number, difficulty: number) {
  const response = await axios.get(apiUrl('/quiz'), {
    params: { 
      url: videoUrl,
      num_ques: numQuestions,
      difficulty: difficulty
    }
  });
  return response.data;
}

export async function createEmbeddings(videoUrl: string) {
  const response = await axios.post(apiUrl('/embedding'), null, {
    params: { url: videoUrl }
  });
  return response.data;
}

export async function sendChatMessage(videoUrl: string, message: string, conversationHistory: Array<{role: string, content: string}>) {
  const response = await axios.post(apiUrl('/chat'), {
    url: videoUrl,
    message: message,
    conversation_history: conversationHistory
  });
  return response.data;
}

