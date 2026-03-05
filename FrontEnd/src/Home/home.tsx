import { useState } from "react";
import Main  from "./main";
import Quizer from "../Quizzer/quizzer";
import Chat from "../Chat/chat";

const Home : React.FC = () =>{
    const [showQuizzer, setShowQuizzer] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [quizData, setQuizData] = useState<{ questions: any[], userAnswers: (string | null)[], score: number, total: number } | null>(null);

    const handleAskAI = (quizData: { questions: any[], userAnswers: (string | null)[], score: number, total: number }) => {
        setQuizData(quizData);
        setShowQuizzer(false);
        setShowChat(true);
    };

    return(
        <div className="flex flex-row justify-center items-center">
            {!showQuizzer && !showChat ? (
            <Main 
                onStartQuiz={() => { setShowQuizzer(true)}} 
                onStartChat={() => { setShowChat(true); setQuizData(null); }}
                setVideoUrl={setVideoUrl} 
            />
            ) : showQuizzer ? (
            <Quizer onReturnBack={() => setShowQuizzer(false)} onAskAI={handleAskAI} videoUrl={videoUrl} />
            ) : (
            <Chat onReturnBack={() => { setShowChat(false); setQuizData(null); }} videoUrl={videoUrl} quizData={quizData} />
            )}
        </div>
    );
}

export default Home;