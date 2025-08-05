import React from 'react';

interface QuizSettingsProps {
    onReturnBack: () => void;
    setStartQuiz: React.Dispatch<React.SetStateAction<boolean>>;
    setNumQuestions: React.Dispatch<React.SetStateAction<number>>;
    setNumChoices: React.Dispatch<React.SetStateAction<number>>;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({ onReturnBack, setStartQuiz, setNumQuestions, setNumChoices }) => {


    return (
      <div className="flex-1 bg-slate-900/40 rounded-2xl p-4 shadow-xl backdrop-blur-md h-fit lg:h-[380px] flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Quiz Settings</h2>
        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium mb-1">Number of Questions</label>
            <input
              type="number"
              className="w-full bg-black/40 border border-slate-600 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              min={2}
              max={10}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              placeholder="Enter a number (please enter between 2–10)"

            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Number of Choices</label>
            <input
              type="number"
              className="w-full bg-black/40 border border-slate-600 p-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              min={3}
              max={5}
              onChange={(e) => setNumChoices(Number(e.target.value))}
              placeholder="Enter a number (please enter between 2–10)"

            />
          </div>
        </div>
        <div className='flex flex-col sm:flex-row gap-3 mt-4'>
          <button onClick={() => setStartQuiz(true)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-semibold transition-colors duration-200">
              Start Quiz
          </button>
          <button
              onClick={onReturnBack}
              className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-2 rounded-xl font-semibold transition-colors duration-200">
              Exit
          </button>
        </div>
      </div>
    );
};

export default QuizSettings;
