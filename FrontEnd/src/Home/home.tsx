import { useState } from "react";
import Main  from "./main";
import Quizer from "../Quizzer/quizzer";
import Chat from "../Chat/chat";

const Home : React.FC = () =>{
    const [showQuizzer, setShowQuizzer] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    return(
        <div className="flex flex-row justify-center items-center">
            {!showQuizzer && !showChat ? (
            <Main 
                onStartQuiz={() => { setShowQuizzer(true)}} 
                onStartChat={() => { setShowChat(true)}}
                setVideoUrl={setVideoUrl} 
            />
            ) : showQuizzer ? (
            <Quizer onReturnBack={() => setShowQuizzer(false)} videoUrl={videoUrl} />
            ) : (
            <Chat onReturnBack={() => setShowChat(false)} videoUrl={videoUrl} />
            )}
        </div>
    );
}

export default Home;