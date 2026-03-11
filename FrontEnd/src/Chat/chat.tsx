import React, { useState, useEffect } from 'react';
import { createEmbeddings, sendChatMessage } from '../api';

type ChatProps = {
    onReturnBack: () => void;
    videoUrl: string;
    quizData?: { questions: any[], userAnswers: (string | null)[], score: number, total: number } | null;
};

// Helper function to parse timestamp from text (e.g., "[00:11]" -> 11 seconds)
const parseTimestamp = (timestampStr: string): number | null => {
    // Match format [MM:SS] or [HH:MM:SS]
    const match = timestampStr.match(/\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/);
    if (!match) return null;
    
    const hours = match[3] ? parseInt(match[1], 10) : 0;
    const minutes = match[3] ? parseInt(match[2], 10) : parseInt(match[1], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10);
    
    return hours * 3600 + minutes * 60 + seconds;
};

// Helper function to render message with clickable timestamps
const renderMessageWithTimestamps = (content: string, onTimestampClick: (seconds: number) => void) => {
    // Split text by timestamp pattern
    const parts = content.split(/(\[\d{1,2}:\d{2}(?::\d{2})?\])/g);
    
    return parts.map((part, index) => {
        const timestamp = parseTimestamp(part);
        if (timestamp !== null) {
            return (
                <button
                    key={index}
                    onClick={() => onTimestampClick(timestamp)}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors"
                >
                    {part}
                </button>
            );
        }
        return <span key={index}>{part}</span>;
    });
};

// Helper function to jump video to timestamp
const jumpToTimestamp = (seconds: number, videoUrl: string) => {
    const iframe = document.getElementById("chat-video") as HTMLIFrameElement;
    if (!iframe) return;

    const videoId = new URL(videoUrl).searchParams.get('v');
    if (videoId) {
        iframe.src = `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1&enablejsapi=1&modestbranding=1&rel=0&showinfo=0`;
    }
};

// Helper function to format quiz data as context message
const formatQuizContext = (quizData: { questions: any[], userAnswers: (string | null)[], score: number, total: number }): string => {
    let context = `Quiz Results: Score ${quizData.score}/${quizData.total}\n\n`;
    
    quizData.questions.forEach((question, index) => {
        const userAnswer = quizData.userAnswers[index];
        const isCorrect = userAnswer === question.correct_answer;
        const userAnswerText = userAnswer ? `${userAnswer}. ${question.options[userAnswer]}` : 'No answer';
        const correctAnswerText = `${question.correct_answer}. ${question.options[question.correct_answer]}`;
        
        context += `Question ${index + 1}: ${question.question}\n`;
        context += `Your Answer: ${userAnswerText} ${isCorrect ? '✓' : '✗'}\n`;
        if (!isCorrect) {
            context += `Correct Answer: ${correctAnswerText}\n`;
        }
        if (question.explanation) {
            context += `Explanation: ${question.explanation}\n`;
        }
        context += `\n`;
    });
    
    return context;
};

const Chat: React.FC<ChatProps> = ({ onReturnBack, videoUrl, quizData }) => {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmbedding, setIsEmbedding] = useState(true);
    const [embeddingError, setEmbeddingError] = useState<string | null>(null);

    // Create embeddings when component mounts
    useEffect(() => {
        const initializeEmbeddings = async () => {
            setIsEmbedding(true);
            setEmbeddingError(null);
            
            try {
                const response = await createEmbeddings(videoUrl);
                if (response.result && response.status_code === 200) {
                    setIsEmbedding(false);
                } else {
                    setEmbeddingError(response.message || 'Failed to create embeddings');
                    setIsEmbedding(false);
                }
            } catch (error: any) {
                setEmbeddingError('Failed to initialize embeddings. Please try again.');
                setIsEmbedding(false);
                console.error('Error creating embeddings:', error);
            }
        };

        initializeEmbeddings();
    }, [videoUrl]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading || isEmbedding) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        
        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Prepare conversation history - only last 5 messages
            const recentMessages = messages.slice(-5);
            const conversationHistory = recentMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add quiz context if available (include in every conversation history)
            if (quizData) {
                const quizContext = formatQuizContext(quizData);
                conversationHistory.unshift({
                    role: 'assistant',
                    content: `Quiz Context:\n${quizContext}`
                });
            }

            // Add current user message to history
            conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            // Call chat API
            const response = await sendChatMessage(videoUrl, userMessage, conversationHistory);
            
            if (response.result && response.data) {
                // Add AI response to chat
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: response.data.response || response.data.message || 'No response received'
                }]);
            } else {
                // Handle error response
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: `Error: ${response.message || 'Failed to get response from AI'}`
                }]);
            }
        } catch (error: any) {
            console.error('Error sending chat message:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTimestampClick = (seconds: number) => {
        jumpToTimestamp(seconds, videoUrl);
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row gap-4 text-white">
            {/* Left: Chat Box */}
            <div className="flex-1 min-w-0 max-w-[700px] bg-slate-900/40 rounded-2xl shadow-xl backdrop-blur-md flex flex-col" style={{ height: '380px' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 shrink-0">
                    <h2 className="text-lg font-semibold">Chat with AI</h2>
                    <button
                        onClick={onReturnBack}
                        className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors duration-200"
                    >
                        Exit
                    </button>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isEmbedding ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                            <p>Preparing AI context... Please wait</p>
                        </div>
                    ) : embeddingError ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-400 text-sm space-y-2">
                            <p>{embeddingError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Retry
                            </button>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            <p>Start a conversation about the video...</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.role === 'user'
                                            ? 'bg-emerald-600/80 text-white'
                                            : 'bg-black/40 text-slate-200 border border-slate-700'
                                    }`}
                                >
                                    {message.role === 'assistant' ? (
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {renderMessageWithTimestamps(message.content, handleTimestampClick)}
                                        </p>
                                    ) : (
                                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    
                    {/* Loading indicator for AI response */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-black/40 text-slate-200 border border-slate-700 rounded-lg p-3 max-w-[80%]">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                                    <span>AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <div className="border-t border-slate-700/50 p-4 shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={isEmbedding ? "Preparing AI..." : "Ask a question about the video..."}
                            disabled={isEmbedding || isLoading}
                            className="flex-1 bg-black/40 border border-slate-600/50 text-white placeholder-slate-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading || isEmbedding}
                            className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Video Player */}
            <div className="flex-1 min-w-0 max-w-[700px] bg-black/30 rounded-2xl shadow-lg h-fit lg:h-[380px] flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <iframe
                        className="w-full h-full min-h-[220px] lg:h-full rounded-xl"
                        id="chat-video"
                        src={`https://www.youtube.com/embed/${new URL(videoUrl).searchParams.get('v')}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0`}
                        title="YouTube video"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Chat;
