import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types';

// Ensure the API key is set in your environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

async function safeGenerateContent(prompt: string): Promise<string> {
    if (!API_KEY) {
        return "AI functionality is disabled. Please configure the Gemini API key.";
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate content from AI.");
    }
}

export async function generateCourseDescription(courseTitle: string): Promise<string> {
    const prompt = `Generate a compelling and concise course description for a course titled "${courseTitle}". The description should be suitable for a learning management system. It should be engaging for potential students and highlight the key learning outcomes. Make it about 2-3 sentences long.`;
    return safeGenerateContent(prompt);
}

export async function generateAssignmentFeedback(assignmentTitle: string, studentSubmission: string): Promise<string> {
    const prompt = `
        You are a helpful teaching assistant providing feedback on a student's assignment.
        Assignment Title: "${assignmentTitle}"
        Student's Submission: "${studentSubmission}"

        Provide constructive and encouraging feedback. Start with something positive, then suggest one area for improvement. Keep the feedback concise and helpful. Do not assign a grade.
    `;
    return safeGenerateContent(prompt);
}


export async function generateQuizQuestions(materialText: string): Promise<Omit<Question, 'id'>[]> {
    if (!API_KEY) {
        throw new Error("AI functionality is disabled. Please configure the Gemini API key.");
    }
    
    const prompt = `Based on the following course material, generate 3-5 quiz questions. The questions should be a mix of multiple-choice and true/false. For multiple-choice questions, provide 4 options.

    Course Material:
    ---
    ${materialText}
    ---

    Provide the output in the specified JSON format.`;

    const questionSchema = {
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING, description: 'The question text.' },
            type: { type: Type.STRING, enum: ['multiple-choice', 'true-false'], description: 'The type of question.' },
            options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'An array of 4 possible answers for multiple-choice questions.'
            },
            correctAnswer: { type: Type.STRING, description: 'The correct answer. For multiple-choice, this must be one of the options. For true/false, it must be "True" or "False".' }
        },
        required: ['text', 'type', 'correctAnswer']
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: questionSchema
                }
            }
        });
        
        const jsonText = response.text.trim();
        const generatedQuestions = JSON.parse(jsonText);
        
        if (!Array.isArray(generatedQuestions)) {
            throw new Error("AI did not return an array of questions.");
        }

        // Filter out any malformed questions just in case
        return (generatedQuestions as any[]).filter(q => q.text && q.type && q.correctAnswer) as Omit<Question, 'id'>[];

    } catch (error) {
        console.error("Error calling Gemini API for quiz generation:", error);
        throw new Error("Failed to generate quiz questions from AI.");
    }
}

export async function generateVideoTranscript(videoTitle: string): Promise<string> {
    const prompt = `Generate a plausible, detailed text transcript for a fictional educational video titled "${videoTitle}". The transcript should be structured with paragraphs and cover potential key topics related to the title. The transcript should be at least 300 words long to provide enough content for an AI assistant to answer questions. Do not add any introductory text like "Here is the transcript". Just start with the transcript content itself.`;
    return safeGenerateContent(prompt);
}

export async function answerQuestionAboutVideo(question: string, transcript: string): Promise<string> {
    const prompt = `You are an AI assistant for a student watching an educational video. Here is the transcript of the video:
---
${transcript}
---
The student asked the following question: "${question}"

Answer the student's question based *only* on the provided transcript. At the beginning of your answer, provide a plausible timestamp in the format [MM:SS] where in the video the relevant information might be found. For example: "[02:45] The mitochondria is the powerhouse of the cell...". If you cannot find an answer in the transcript, state that clearly. Do not make up information not present in the transcript.`;
    return safeGenerateContent(prompt);
}
