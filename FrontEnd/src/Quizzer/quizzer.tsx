import React, {useEffect } from 'react';
import QuizSettings from './quizSettings';
import QuizIterator from './quizIterator';
import { getQuiz } from '../api';


type QuizzerProps = {
    onReturnBack: () => void;
    onAskAI?: (quizData: { questions: any[], userAnswers: (string | null)[], score: number, total: number }) => void;
    videoUrl: string;
};

const Quizzer: React.FC<QuizzerProps> = ({ onReturnBack, onAskAI, videoUrl }) => {

    const [startQuiz, setStartQuiz] = React.useState<boolean>(false);
    const [quizData, setQuizData] = React.useState<any[]>([]);
    const [numQuestions, setNumQuestions] = React.useState<number>(2);
    const [numChoices, setNumChoices] = React.useState<number>(3);


    useEffect(() => {
        if (startQuiz) {
            getQuiz(videoUrl, numQuestions, numChoices)
                .then(response => {
                    setQuizData(Object.values(response.data.questions));
                    console.log('Quiz data fetched:', response);
                })
                .catch(error => {
                    console.error('Error fetching quiz data:', error);
                });
        }
    },[startQuiz]);

    return (
    <div className="w-full max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row gap-4 text-white">
      {/* Left: Quiz Controls */}
      {!startQuiz ? (
          <QuizSettings onReturnBack={onReturnBack} setStartQuiz={setStartQuiz} setNumQuestions={setNumQuestions} setNumChoices={setNumChoices}/>
      ) : (
          <QuizIterator onReturnBack={onReturnBack} onAskAI={onAskAI} data={quizData} />
      )}

      
      {/* Right: Clean YouTube Player */}
      <div className="flex-1 max-w-[700px] bg-black/30 rounded-2xl  shadow-lg h-fit lg:h-[380px] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <iframe
            className="w-full h-full min-h-[220px] lg:h-full rounded-xl"
            id="quiz-video"
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

export default Quizzer;