const {generateQuizFromVideo} = require('../services/quizService.js');

async function getQuizController(req, res) {
    // Check if videoUrl is working or not : later
    url = req.query.url;
    numQuestions = req.query.num_ques || 2;
    numOptions = req.query.choices || 3;


    try{
        const quizData = await generateQuizFromVideo(url, numQuestions, numOptions);
        res.status(200).json({ success: true, data: quizData, message: "Quiz generated successfully", statusCode: 200 });
    }
    catch(error){
        res.status(500).json({success: false, data: null, message: error.message, statusCode: 500});
    }
}

module.exports = {
    getQuizController
};
