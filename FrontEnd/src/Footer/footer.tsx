const Footer:React.FC = () =>{
    const currentYear = new Date().getFullYear();
    
    return(
        <div className="relative bottom-0 left-0 right-0 bg-black p-6">
            <div className="text-center text-slate-500 text-sm">
                <p className="mb-2">
                    Created with ❤️ by <span className="text-emerald-400 font-medium">Shireesh</span>
                </p>
                <p className="text-xs">
                    © {currentYear} YT Quizzer. All rights reserved.
                </p>
            </div>
        </div>
    )
}

export default Footer;