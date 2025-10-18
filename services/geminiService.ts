import type { Question } from '../types';

// Mock function to simulate a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateCourseDescription(courseTitle: string): Promise<string> {
    await sleep(500); // Simulate network delay
    return `This is a comprehensive course about "${courseTitle}". Throughout this course, you will explore fundamental concepts, advanced techniques, and real-world applications. Get ready to enhance your skills and deepen your understanding in this exciting field.`;
}

export async function generateAssignmentFeedback(assignmentTitle: string, studentSubmission: string): Promise<string> {
    await sleep(500);
    return `Thank you for your submission on "${assignmentTitle}". You've made a good effort to address the prompt. One area for improvement would be to provide more detailed examples to support your main points. Keep up the great work!`;
}

export async function generateQuizQuestions(materialText: string): Promise<Omit<Question, 'id'>[]> {
    await sleep(1000);
    return [
        {
            text: 'What is the primary topic of the material provided?',
            type: 'multiple-choice',
            options: ['Topic A', 'Topic B', 'Topic C', 'All of the above'],
            correctAnswer: 'All of the above'
        },
        {
            text: 'The material suggests that concept X is false.',
            type: 'true-false',
            correctAnswer: 'False'
        },
        {
            text: 'Which of the following concepts was NOT mentioned?',
            type: 'multiple-choice',
            options: ['Concept 1', 'Concept 2', 'Concept 3', 'Concept 4 (Not Mentioned)'],
            correctAnswer: 'Concept 4 (Not Mentioned)'
        }
    ];
}

export async function generateVideoTranscript(videoTitle: string): Promise<string> {
    await sleep(500);
    return `Welcome to this video on "${videoTitle}". In this session, we will begin by exploring the core principles. At around 01:30, we'll dive into a practical example. The main takeaway from this video is understanding the key framework. We will wrap up with a summary of what we've learned and suggest further reading. Thank you for watching.`;
}

export async function answerQuestionAboutVideo(question: string, transcript: string): Promise<string> {
    await sleep(500);
    // A simple mock that checks for a keyword.
    if (question.toLowerCase().includes('summary')) {
        return `[03:15] The video summary involves recapping the core principles and practical examples discussed.`;
    }
    return `[01:30] Based on the transcript, the information related to your question can be found around the middle of the video where we discuss practical examples. The transcript provides key details on the subject.`;
}
