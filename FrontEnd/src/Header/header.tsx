const Header: React.FC = () => {
    return (
        <div className="">
            <div className="mt-16 mb-2 text-center">
                <h1 className="text-5xl font-bold text-white mb-1 tracking-tight">
                    Welcome to <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent font-extrabold">YT Quizzer</span>
                </h1>
                <p className="text-slate-300 text-lg leading-relaxed">
                    Transform educational YouTube tutorials into interactive quiz experiences
                </p>
            </div>      
        </div>
    );
};

export default Header;
