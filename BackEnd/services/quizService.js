const { fetchTranscript, generateQuiz , checkYoutubeLink} = require("../utils/utils.js");

async function generateQuizFromVideo(videoUrl, numQuestions, numOptions) {
    try{
        //originally code
        const transcriptData = await fetchTranscript(videoUrl);
        const quiz = await generateQuiz(transcriptData, numQuestions, numOptions);
        return JSON.parse(quiz.content);
        
        //Testing code
        // return {
        //         questions: [
        //         {
        //             question: "When working with TypeScript in React components, what is the recommended way to handle props typing?",
        //             options: {
        //             A: "Use React.FC with arrow functions to type components",
        //             B: "Type only the props parameter and let TypeScript infer the return value",
        //             C: "Always explicitly type both props and return values of components"
        //             },
        //             correct_answer: "B",
        //             explanation: "The video explains that you typically only want to type the props in React components and don't need to type the return values as TypeScript can infer JSX elements.",
        //             timestamp: "03:10",
        //             timestamp_seconds: 190,
        //             transcript_reference: "with react components typically the only thing you want to type are the props now in the past people often did the following to type components so if you had some component function and then to type it people would use colon react. FC [...] but there are some issues with this FC and therefore it has gotten out of fashion"
        //         },
        //         {
        //             question: "2When working with TypeScript in React components, what is the recommended way to handle props typing?",
        //             options: {
        //             A: "2Use React.FC with arrow functions to type components",
        //             B: "Type only the props parameter and let TypeScript infer the return value",
        //             C: "Always explicitly type both props and return values of components"
        //             },
        //             correct_answer: "B",
        //             explanation: "The video explains that you typically only want to type the props in React components and don't need to type the return values as TypeScript can infer JSX elements.",
        //             timestamp: "03:10",
        //             timestamp_seconds: 190,
        //             transcript_reference: "with react components typically the only thing you want to type are the props now in the past people often did the following to type components so if you had some component function and then to type it people would use colon react. FC [...] but there are some issues with this FC and therefore it has gotten out of fashion"
        //         },
        //         {
        //             question: "3When working with TypeScript in React components, what is the recommended way to handle props typing?",
        //             options: {
        //             A: "33Use React.FC with arrow functions to type components",
        //             B: "Type only the props parameter and let TypeScript infer the return value",
        //             C: "Always explicitly type both props and return values of components"
        //             },
        //             correct_answer: "B",
        //             explanation: "The video explains that you typically only want to type the props in React components and don't need to type the return values as TypeScript can infer JSX elements.",
        //             timestamp: "03:10",
        //             timestamp_seconds: 190,
        //             transcript_reference: "with react components typically the only thing you want to type are the props now in the past people often did the following to type components so if you had some component function and then to type it people would use colon react. FC [...] but there are some issues with this FC and therefore it has gotten out of fashion"
        //         }
        //         ]
        //     }
    }
    catch (error) {
        throw error;
    }
}

module.exports = {
    generateQuizFromVideo
};

