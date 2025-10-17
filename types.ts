export type UserRole = 'Student' | 'Teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be a hash
  role: UserRole;
  bio?: string;
  registeredAt: string; // ISO string
  admissionNumber?: string; // For Students
  admissionYear?: number;   // For Students
  idNumber?: string;        // For Teachers
  bloodGroup?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO string date part YYYY-MM-DD
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string date part YYYY-MM-DD
  endDate: string;   // ISO string date part YYYY-MM-DD
  teacherId: string;
  studentIds?: string[];
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string; // ISO string format
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string; // Text submission, now optional
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  submittedAt: string; // ISO string format
  grade: number | null;
  feedback: string | null;
  gradedAt: string | null; // ISO string format
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string; // ISO string
}

export interface DiscussionPost {
  id: string;
  courseId: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO string
  parentId: string | null; // For replies
}

export interface CourseMaterial {
  id:string;
  courseId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string; // ISO string
}

export interface VideoMaterial {
  id: string;
  courseId: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string; // ISO string
  transcript: string;
}

export interface VideoNote {
  id: string;
  videoId: string;
  studentId: string;
  content: string;
  timestamp: number; // in seconds
  createdAt: string; // ISO string
}


export interface Notification {
    id: string;
    userId: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string; // ISO string
}

export interface Group {
  id: string;
  courseId: string;
  name: string;
  description: string;
  memberIds: string[];
}

export type QuestionType = 'multiple-choice' | 'true-false';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For multiple-choice
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  dueDate: string; // ISO string format
  questions: Question[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string>; // { questionId: answer }
  score: number; // Percentage
  submittedAt: string; // ISO string
}

export interface ChatMessage {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  timestamp: string; // ISO string
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  studentId: string;
  date: string; // YYYY-MM-DD format
  status: 'Present' | 'Absent' | 'Late';
}

export type PaymentMethod = 'Card' | 'Google Pay' | 'PhonePe' | 'Paytm';

export interface Fee {
  id: string;
  studentId: string;
  courseId: string;
  description: string;
  amount: number;
  dueDate: string; // ISO string date part YYYY-MM-DD
  status: 'Paid' | 'Unpaid' | 'Overdue';
  paymentDate?: string; // ISO string
  paymentMethod?: PaymentMethod;
}