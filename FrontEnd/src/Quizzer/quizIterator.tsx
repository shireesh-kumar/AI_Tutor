import React from "react";


interface QuizQuestion {
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  timestamp: string;
  timestamp_seconds: number;
  transcript_reference: string;
}

interface Quiz {
  onReturnBack: () => void;
  data: QuizQuestion[];
}



const QuizIterator: React.FC<Quiz> = ({ onReturnBack, data }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<(string | null)[]>(Array(data.length).fill(null));
  const [showResult, setShowResult] = React.useState(false);
  

  const handleOptionSelect = (key: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = key;
    setUserAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const calculateScore = () => {
    return data.reduce((score, question, index) => {
      return score + (userAnswers[index] === question.correct_answer ? 1 : 0);
    }, 0);
  };

  return (
    <>
      {data && data.length > 0 ? (
        showResult ? (
        <div className="w-full max-w-[700px] h-[80vh] bg-slate-900/40 rounded-2xl p-4 shadow-xl backdrop-blur-md text-white flex flex-col overflow-hidden" style={{ height: '380px' }}> 
          <h2 className="text-xl font-semibold mb-2">Quiz Result</h2>
          <p className="mb-4">You scored {calculateScore()} out of {data.length}</p>

          {/* Scrollable question list */}
          <div className="space-y-6 overflow-auto pr-2 flex-1">
            {data.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div
                  key={index}
                  className="border border-slate-700 rounded-lg p-4 bg-black/30 space-y-2 overflow-x-auto"
                >
                  <p className="font-medium">{index + 1}. {question.question}</p>

                  <p className="text-sm">
                    <span className="font-semibold text-slate-400">Your Answer:</span>{" "}
                    <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                      {userAnswer ? `${userAnswer}. ${question.options[userAnswer]}` : "No answer"}
                    </span>
                  </p>

                  {!isCorrect && (
                    <p className="text-sm">
                      <span className="font-semibold text-slate-400">Correct Answer:</span>{" "}
                      <span className="text-green-400">
                        {question.correct_answer}. {question.options[question.correct_answer]}
                      </span>
                    </p>
                  )}

                  <button
                    onClick={() => {
                      const iframe = document.getElementById("quiz-video") as HTMLIFrameElement;
                      if (!iframe) return;

                      const srcUrl = new URL(iframe.src);
                      const videoId = srcUrl.pathname.split("/embed/")[1]?.split("?")[0];

                      if (videoId) {
                        iframe.src = `https://www.youtube.com/embed/${videoId}?start=${question.timestamp_seconds}&autoplay=1&modestbranding=1&rel=0&showinfo=0`;
                      }
                    }}
                    className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-1 rounded-lg font-semibold"
                  >
                    Hint
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mt-4 shrink-0">
            <button
              onClick={() => {
                setShowResult(false);
                setUserAnswers(Array(data.length).fill(null));
                setCurrentIndex(0);
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded-xl font-semibold"
            >
              Try Again
            </button>
            <button
              onClick={onReturnBack}
              className="flex-1 bg-slate-700 hover:bg-slate-800 py-2 rounded-xl font-semibold"
            >
              Exit
            </button>
          </div>
        </div>
        ) : (
          (() => {
            const currentQuestion = data[currentIndex];

            return (
              <div className="flex-1 max-w-[700px] bg-slate-900/40 rounded-2xl p-4 shadow-xl backdrop-blur-md text-white space-y-4">
                <h2 className="text-lg font-semibold">
                  Question {currentIndex + 1} of {data.length}
                </h2>

                <p className="mb-2">{currentQuestion.question}</p>

                <div className="space-y-2">
                  {Object.entries(currentQuestion.options).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleOptionSelect(key)}
                      className={`w-full text-left p-2 rounded-lg border transition-colors duration-200 ${
                        userAnswers[currentIndex] === key
                          ? "bg-emerald-600 border-emerald-600"
                          : "bg-black/40 border-slate-600 hover:bg-emerald-700"
                      }`}
                    >
                      {key}. {value}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap justify-between mt-4 gap-3">
                  <button
                    onClick={onReturnBack}
                    className="flex-1 bg-slate-700 hover:bg-slate-800 py-2 px-4 rounded-xl font-semibold min-w-[100px]"
                  >
                    Exit
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                    disabled={currentIndex === 0}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 py-2 px-4 rounded-xl font-semibold disabled:opacity-50 min-w-[100px]"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      const iframe = document.getElementById("quiz-video") as HTMLIFrameElement;
                      if (!iframe) return;

                      const srcUrl = new URL(iframe.src);
                      const videoId = srcUrl.pathname.split("/embed/")[1]?.split("?")[0];

                      if (videoId) {
                        iframe.src = `https://www.youtube.com/embed/${videoId}?start=${currentQuestion.timestamp_seconds}&autoplay=1&modestbranding=1&rel=0&showinfo=0`;
                      }
                    }}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 px-4 rounded-xl font-semibold min-w-[100px]"
                  >
                    Hint
                  </button>
                  {currentIndex === data.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={userAnswers[currentIndex] == null}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-xl font-semibold disabled:opacity-50 min-w-[100px]"
                    >
                      Submit
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          Math.min(prev + 1, data.length - 1)
                        )
                      }
                      disabled={userAnswers[currentIndex] == null}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 px-4 rounded-xl font-semibold disabled:opacity-50 min-w-[100px]"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            );
          })()
        )
      ) : (
      <div className="flex-1 max-w-[700px] bg-slate-900/40 rounded-2xl p-4 shadow-xl backdrop-blur-md text-white space-y-4">
        <h2 className="text-lg font-semibold">Preparing your quiz...</h2>
        <p className="text-slate-300">Please wait while we generate questions based on the video content.</p>
        
        <div className="space-y-2">
          {[...'ABCD'].map((key) => (
            <div
              key={key}
              className="w-full h-10 bg-black/40 border border-slate-600 rounded-lg animate-pulse"
            />
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onReturnBack}
            className="bg-slate-700 hover:bg-slate-800 py-2 px-6 rounded-xl font-semibold"
          >
            Exit
          </button>
        </div>
      </div>
      )}
    </>
  );
};

export default QuizIterator;
