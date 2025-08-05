import { useState } from "react";
import Main  from "./main";
import Quizer from "../Quizzer/quizzer";
const Home : React.FC = () =>{
    const [showQuizzer, setShowQuizzer] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    return(
        <div className="flex flex-row justify-center items-center">
            {!showQuizzer ? (
            <Main onStartQuiz={() => { setShowQuizzer(true)}} setVideoUrl={setVideoUrl} />
            ) : (
            <Quizer onReturnBack={() => setShowQuizzer(false)} videoUrl={videoUrl} />
            )}
        </div>
    );
}

export default Home;