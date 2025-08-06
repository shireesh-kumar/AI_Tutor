const { ChatAnthropic } = require("@langchain/anthropic");
const { PromptTemplate } = require("@langchain/core/prompts");
const axios = require('axios');
const config = require('../config/config');
const { exec } = require('child_process');
const { promisify } = require('util'); 
const execAsync = promisify(exec);

llm = new ChatAnthropic({
    anthropicApiKey : config.anthropicApiKey,
    modelName: config.modelName,
    temperature : parseFloat(process.env.TEMPERATURE) || 0.7
})

quizTemplate = `
You are a quiz generator that creates questions based STRICTLY on the content from a YouTube video transcript.

VIDEO TRANSCRIPT DATA:
{transcript_data}

INSTRUCTIONS:
1. Generate quiz questions that can ONLY be answered from the provided transcript
2. Each question must have exactly {difficulty} multiple choice options (A, B, C etc..)
3. Make the wrong answers plausible but clearly incorrect based on the transcript
4. Include the timestamp where the answer can be found in the video
5. Focus on key concepts, facts, and important details mentioned in the video

RESPONSE FORMAT (JSON):
{{
  "questions": [
    {{
      "question": "What is the main concept discussed about X?",
      "options": {{
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text"
      }},
      "correct_answer": "A",
      "explanation": "Brief explanation of why this is correct based on transcript",
      "timestamp": "MM:SS",
      "timestamp_seconds": 123,
      "transcript_reference": "Exact quote from transcript that contains the answer"
    }}
  ]
}}

IMPORTANT: Return ONLY the JSON object, no additional text, no markdown formatting, no code blocks.
The response should start with {{ and end with }}

Generate {num_questions} important andprominent questions covering different topics from the video.
Ensure questions test understanding of concepts, not just memorization.
Make sure all {difficulty} options are realistic and closely related to confuse someone who didn't watch carefully.

Number of questions to generate: {num_questions}
`;


async function fetchTranscript(videoUrl) {
    try {
        const { stdout, stderr } = await execAsync(`python utils/extract_transcript.py extract_transcript_details "${videoUrl}"`);
        if (stderr) {
            throw new Error(`Python script error: ${stderr}`);
        }       
        return JSON.parse(stdout);

    } catch (error) {
        throw new Error(`Failed to fetch transcript: ${error.message}`);
    }
}

async function generateQuiz(transcript_data,num_ques,num_options){
    try{
        quizPrompt = PromptTemplate.fromTemplate(quizTemplate);
        const formattedPrompt = await quizPrompt.format({
        transcript_data: transcript_data,
        num_questions: num_ques,
        difficulty: (num_options >= 2 && num_options <= 5) ? num_options : 3
        });

        const response = await llm.invoke(formattedPrompt);
        return response;
    }
    catch (error) {
        throw new Error("Quiz generation failed: " + error.message);
    }
}

async function checkYoutubeLink(videoUrl) {
    console.log("Checking YouTube link:", videoUrl);
    videoUrl = videoUrl.replace(/^"|"$/g, '');
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;

    if (!youtubeRegex.test(videoUrl)) {
        return {
            message: "Invalid YouTube URL. Use https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID",
            status: 400
        };
    }

    try {
        const response = await axios.get(`https://www.youtube.com/oembed?url=${videoUrl}`);
        console.log("YouTube link is accessible:", response.status);
        return { message: "Success", status: 200 };    

    } catch (error) {
        return {
            message: "Failed to access the YouTube video. Please check the video URL and try again.",
            status: 400
        };
    }

}

module.exports = { fetchTranscript, generateQuiz, checkYoutubeLink };

