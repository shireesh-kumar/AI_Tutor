import Alert from '../Alert/alert';
import { useState } from 'react';
import { validateVideoUrl } from '../api';

const Main: React.FC<{ onStartQuiz: () => void; onStartChat: () => void; setVideoUrl: (url: string) => void }> = ({ onStartQuiz, onStartChat, setVideoUrl }) => {
    const [showError, setShowError] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [ alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('warning');

    const handleSubmit = async () => {
        if (!inputValue.trim()) {
            setAlertMessage('Please enter a YouTube URL');
            setAlertType('warning');
            setShowError(true);
        return;
        }

        try {
            const response = await validateVideoUrl(inputValue);
            
            if (response.result === false) {
                setAlertMessage(response.message);
                setAlertType('error');
                setShowError(true);
            }
            else {
                setVideoUrl(inputValue);
                onStartQuiz();
            }

        } catch (error: any) {
            const errorMessage =
                'Validation process failed at UI level. Please contact support.' + error.message;
            setAlertMessage(errorMessage);
            setAlertType('warning');
            setShowError(true);
}
    };

    return (
        <div>
            <div className="bg-gradient-to-br from-black/80 via-slate-900/60 to-black/80 px-10 py-4 rounded-3xl shadow-2xl w-full max-w-2xl text-center backdrop-blur-lg">
                <div className="space-y-6">
                    <div className="relative">
                    <input
                        type="text"
                        placeholder="Paste an English tutorial or educational video link..."
                        className="w-full bg-black/40 border border-slate-600/50 text-white placeholder-slate-400 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all duration-200 backdrop-blur-sm hover:border-slate-500/70 text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />                        
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    
                    <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                        <span className="flex items-center justify-center gap-2">
                            Generate Quiz
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                    
                    <button 
                        onClick={async () => {
                            if (!inputValue.trim()) {
                                setAlertMessage('Please enter a YouTube URL');
                                setAlertType('warning');
                                setShowError(true);
                                return;
                            }

                            try {
                                const response = await validateVideoUrl(inputValue);
                                
                                if (response.result === false) {
                                    setAlertMessage(response.message);
                                    setAlertType('error');
                                    setShowError(true);
                                }
                                else {
                                    setVideoUrl(inputValue);
                                    onStartChat();
                                }

                            } catch (error: any) {
                                const errorMessage =
                                    'Validation process failed at UI level. Please contact support.' + error.message;
                                setAlertMessage(errorMessage);
                                setAlertType('warning');
                                setShowError(true);
                            }
                        }}
                        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Chat with AI
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </span>
                    </button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-slate-400 text-sm mb-0">
                        Best with educational content • tutorials, lectures, and how-to videos
                    </p>
                </div>
            </div>
                <Alert
                    type={alertType}
                    message={alertMessage}
                    isVisible={showError}
                    onClose={() => setShowError(false)}
                    autoClose={true}
                    autoCloseDelay={3000}
                />        
        </div>
    );
};

export default Main;
