import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import type { User, Course, Assignment, Submission, UserRole, DiscussionPost, CourseMaterial, Notification, Group, Quiz, Question, QuizAttempt, ChatMessage, AttendanceRecord, Announcement, Fee, PaymentMethod, VideoMaterial, VideoNote } from './types';
import { SmartLearnLogo, LogoutIcon, BellIcon, UserCircleIcon } from './components/Icons';
import { generateVideoTranscript } from './services/geminiService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import CourseDetail from './components/CourseDetail';
import SplashScreen from './components/SplashScreen';
import Profile from './components/Profile';
import NeuralNetworkBackground from './components/NeuralNetworkBackground';

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error(`Error saving state for key "${key}" to localStorage.`, e);
      alert(`Could not save changes. The browser's storage might be full.`);
    }
  }, [key, state]);

  return [state, setState];
};

interface AppContextType {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  attendanceRecords: AttendanceRecord[];
  announcements: Announcement[];
  fees: Fee[];
  login: (email: string, password: string) => boolean;
  loginWithUserObject: (user: User) => void;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => boolean;
  updateUserProfile: (userId: string, data: Partial<Omit<User, 'id' | 'email' | 'role' | 'registeredAt'>>) => void;
  createCourse: (course: Omit<Course, 'id' | 'teacherId'>) => void;
  enrollInCourse: (courseId: string) => void;
  createAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  submitAssignment: (submission: Omit<Submission, 'id' | 'grade' | 'feedback' | 'gradedAt'>) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  uploadMaterial: (material: Omit<CourseMaterial, 'id' | 'uploadedAt'>) => void;
  deleteMaterial: (materialId: string) => void;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'authorId'>) => void;
  createDiscussionPost: (post: Omit<DiscussionPost, 'id' | 'createdAt' | 'authorId'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  createGroup: (group: Omit<Group, 'id' | 'memberIds'>) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  createQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  submitQuiz: (attempt: Omit<QuizAttempt, 'id'>) => void;
  sendChatMessage: (message: Omit<ChatMessage, 'id' | 'authorId' | 'timestamp'>) => void;
  markAttendance: (courseId: string, attendanceData: { studentId: string, status: 'Present' | 'Absent' | 'Late' }[]) => void;
  createFee: (feeData: { courseId: string, studentIds: string[], description: string, amount: number, dueDate: string }) => void;
  payFee: (feeId: string, paymentMethod: PaymentMethod) => void;
  uploadVideoMaterial: (courseId: string, file: File) => Promise<void>;
  deleteVideoMaterial: (videoId: string) => void;
  createVideoNote: (note: Omit<VideoNote, 'id' | 'createdAt' | 'studentId'>) => void;
  findCourseById: (id: string) => Course | undefined;
  findAssignmentsByCourseId: (courseId: string) => Assignment[];
  findSubmissionsByAssignmentId: (assignmentId: string) => Submission[];
  findUserById: (userId: string) => User | undefined;
  findSubmissionsByStudentId: (studentId: string, assignmentId: string) => Submission[];
  findAnnouncementsByCourseId: (courseId: string) => Announcement[];
  findPostsByCourseId: (courseId: string) => DiscussionPost[];
  findMaterialsByCourseId: (courseId: string) => CourseMaterial[];
  findNotificationsByUserId: (userId: string) => Notification[];
  findGroupsByCourseId: (courseId: string) => Group[];
  findQuizzesByCourseId: (courseId: string) => Quiz[];
  findQuizAttemptsByQuizId: (quizId: string) => QuizAttempt[];
  findQuizAttemptByStudent: (quizId: string, studentId: string) => QuizAttempt | undefined;
  findChatMessagesByGroupId: (groupId: string) => ChatMessage[];
  findAttendanceByCourseForDate: (courseId: string, date: string) => AttendanceRecord[];
  findAttendanceByCourseAndStudent: (courseId: string, studentId: string) => AttendanceRecord[];
  findFeesByStudentId: (studentId: string) => Fee[];
  findFeesByCourseId: (courseId: string) => Fee[];
  findVideoMaterialsByCourseId: (courseId: string) => VideoMaterial[];
  findVideoNotesByVideoIdAndStudentId: (videoId: string, studentId: string) => VideoNote[];
  calculateCourseGrade: (courseId: string, studentId: string) => number | null;
}

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within an AppProvider");
    return context;
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = usePersistentState<User[]>('users', []);
  const [courses, setCourses] = usePersistentState<Course[]>('courses', []);
  const [assignments, setAssignments] = usePersistentState<Assignment[]>('assignments', []);
  const [submissions, setSubmissions] = usePersistentState<Submission[]>('submissions', []);
  const [announcements, setAnnouncements] = usePersistentState<Announcement[]>('announcements', []);
  const [discussionPosts, setDiscussionPosts] = usePersistentState<DiscussionPost[]>('discussionPosts', []);
  const [materials, setMaterials] = usePersistentState<CourseMaterial[]>('materials', []);
  const [videoMaterials, setVideoMaterials] = usePersistentState<VideoMaterial[]>('videoMaterials', []);
  const [videoNotes, setVideoNotes] = usePersistentState<VideoNote[]>('videoNotes', []);
  const [notifications, setNotifications] = usePersistentState<Notification[]>('notifications', []);
  const [groups, setGroups] = usePersistentState<Group[]>('groups', []);
  const [quizzes, setQuizzes] = usePersistentState<Quiz[]>('quizzes', []);
  const [quizAttempts, setQuizAttempts] = usePersistentState<QuizAttempt[]>('quizAttempts', []);
  const [chatMessages, setChatMessages] = usePersistentState<ChatMessage[]>('chatMessages', []);
  const [attendanceRecords, setAttendanceRecords] = usePersistentState<AttendanceRecord[]>('attendanceRecords', []);
  const [fees, setFees] = usePersistentState<Fee[]>('fees', []);
  const [currentUser, setCurrentUser] = usePersistentState<User | null>('currentUser', null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      navigate('/');
      return true;
    }
    return false;
  };
  
  const loginWithUserObject = (user: User) => {
    setCurrentUser(user);
    navigate('/');
  };

  const logout = () => {
    setCurrentUser(null);
    navigate('/auth');
  };

  const register = (name: string, email: string, password: string, role: UserRole): boolean => {
    if (users.some(u => u.email === email)) {
      return false; 
    }
    const newUser: User = { 
        id: `user-${Date.now()}`, 
        name, 
        email, 
        password, 
        role,
        registeredAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    navigate('/');
    return true;
  };

  const updateUserProfile = (userId: string, data: Partial<Omit<User, 'id' | 'email' | 'role' | 'registeredAt'>>) => {
    setUsers(prevUsers => 
        prevUsers.map(user => {
            if (user.id === userId) {
                const updatedUser = { ...user, ...data };
                if (currentUser?.id === userId) {
                    setCurrentUser(updatedUser);
                }
                return updatedUser;
            }
            return user;
        })
    );
  };
  
  const createNotification = (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        isRead: false,
        createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const createCourse = (course: Omit<Course, 'id' | 'teacherId'>) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    const newCourse: Course = { ...course, id: `course-${Date.now()}`, teacherId: currentUser.id };
    setCourses(prev => [...prev, newCourse]);
  };

  const enrollInCourse = (courseId: string) => {
    if (!currentUser || currentUser.role !== 'Student') return;
    const course = courses.find(c => c.id === courseId);
    if (course && !course.studentIds?.includes(currentUser.id)) {
        const updatedCourses = courses.map(c => 
            c.id === courseId 
            ? { ...c, studentIds: [...(c.studentIds || []), currentUser.id] }
            : c
        );
        setCourses(updatedCourses);
    }
  };
  
  const createAssignment = (assignment: Omit<Assignment, 'id'>) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    const newAssignment: Assignment = { ...assignment, id: `assign-${Date.now()}`};
    setAssignments(prev => [...prev, newAssignment]);

    const course = courses.find(c => c.id === assignment.courseId);
    if (course?.studentIds) {
        course.studentIds.forEach(studentId => {
            createNotification({
                userId: studentId,
                message: `New assignment "${assignment.title}" in "${course.title}".`,
                link: `/course/${course.id}`
            });
        });
    }
  };

  const submitAssignment = (submission: Omit<Submission, 'id' | 'grade' | 'feedback' | 'gradedAt'>) => {
    if (!currentUser || currentUser.role !== 'Student') return;
    setSubmissions(prev => {
        const existing = prev.find(s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId);
        if (existing) {
            const updatedSubmission: Submission = {
                ...existing, // Keep id
                content: submission.content,
                fileUrl: submission.fileUrl,
                fileName: submission.fileName,
                fileType: submission.fileType,
                submittedAt: submission.submittedAt,
                grade: null, // Reset grade on resubmission
                feedback: null,
                gradedAt: null,
            };
            return prev.map(s => s.id === existing.id ? updatedSubmission : s);
        }
        const newSubmission: Submission = {
            ...submission,
            id: `sub-${Date.now()}`,
            grade: null,
            feedback: null,
            gradedAt: null
        };
        return [...prev, newSubmission];
    });
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
      if (!currentUser || currentUser.role !== 'Teacher') return;
      setSubmissions(prev => prev.map(s => s.id === submissionId ? {...s, grade, feedback, gradedAt: new Date().toISOString()} : s));
      
      const submissionToGrade = submissions.find(s => s.id === submissionId);
      if (submissionToGrade) {
        const assignment = assignments.find(a => a.id === submissionToGrade.assignmentId);
        if (assignment) {
            createNotification({
                userId: submissionToGrade.studentId,
                message: `Graded: Your submission for "${assignment.title}" received a ${grade}%.`,
                link: `/course/${assignment.courseId}`
            });
        }
      }
  };

  const uploadMaterial = (material: Omit<CourseMaterial, 'id' | 'uploadedAt'>) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    const newMaterial: CourseMaterial = {
        ...material,
        id: `mat-${Date.now()}`,
        uploadedAt: new Date().toISOString()
    };
    setMaterials(prev => [newMaterial, ...prev]);

    const course = courses.find(c => c.id === material.courseId);
    if (course?.studentIds) {
        course.studentIds.forEach(studentId => {
            createNotification({
                userId: studentId,
                message: `New material "${material.fileName}" uploaded to "${course.title}".`,
                link: `/course/${material.courseId}`
            });
        });
    }
  };

  const deleteMaterial = (materialId: string) => {
      if (!currentUser || currentUser.role !== 'Teacher') return;
      const materialToDelete = materials.find(m => m.id === materialId);
      if (materialToDelete?.fileUrl) {
          URL.revokeObjectURL(materialToDelete.fileUrl);
      }
      setMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const createAnnouncement = (announcement: Omit<Announcement, 'id' | 'createdAt' | 'authorId'>) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    const newAnnouncement: Announcement = {
        ...announcement,
        id: `announce-${Date.now()}`,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);

    const course = courses.find(c => c.id === announcement.courseId);
    if (course?.studentIds) {
        course.studentIds.forEach(studentId => {
            createNotification({
                userId: studentId,
                message: `New announcement in "${course.title}": ${announcement.title}`,
                link: `/course/${announcement.courseId}`
            });
        });
    }
  };

  const createDiscussionPost = (post: Omit<DiscussionPost, 'id' | 'createdAt' | 'authorId'>) => {
      if (!currentUser) return;
      const newPost: DiscussionPost = {
          ...post,
          id: `post-${Date.now()}`,
          authorId: currentUser.id,
          createdAt: new Date().toISOString(),
      };
      setDiscussionPosts(prev => [...prev, newPost]);
      
      const course = courses.find(c => c.id === post.courseId);
      if (!course) return;

      if (currentUser.role === 'Student' && course.teacherId !== currentUser.id) {
          createNotification({
              userId: course.teacherId,
              message: `${currentUser.name} posted in the "${course.title}" discussion.`,
              link: `/course/${course.id}`
          });
      }
  };
  
  const markNotificationAsRead = (notificationId: string) => {
      setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, isRead: true} : n));
  };
  
  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? {...n, isRead: true} : n));
  };

  const createGroup = (group: Omit<Group, 'id' | 'memberIds'>) => {
    if (!currentUser || currentUser.role !== 'Student') return;
    const allCourseGroups = groups.filter(g => g.courseId === group.courseId);
    if (allCourseGroups.some(g => g.memberIds.includes(currentUser.id))) {
        alert("You are already in a group for this course.");
        return;
    }
    const newGroup: Group = { ...group, id: `group-${Date.now()}`, memberIds: [currentUser.id] };
    setGroups(prev => [...prev, newGroup]);
  };

  const joinGroup = (groupId: string) => {
    if (!currentUser || currentUser.role !== 'Student') return;
    const groupToJoin = groups.find(g => g.id === groupId);
    if (!groupToJoin) return;

    const allCourseGroups = groups.filter(g => g.courseId === groupToJoin.courseId);
    if (allCourseGroups.some(g => g.memberIds.includes(currentUser.id))) {
        alert("You can only join one group per course. Please leave your current group first.");
        return;
    }
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, memberIds: [...g.memberIds, currentUser.id] } : g));
  };

  const leaveGroup = (groupId: string) => {
    if (!currentUser) return;
    const groupToLeave = groups.find(g => g.id === groupId);
    if (!groupToLeave) return;
    
    const updatedMembers = groupToLeave.memberIds.filter(id => id !== currentUser.id);
    if (updatedMembers.length === 0) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
    } else {
        setGroups(prev => prev.map(g => g.id === groupId ? { ...g, memberIds: updatedMembers } : g));
    }
  };

  const createQuiz = (quiz: Omit<Quiz, 'id'>) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    const newQuiz: Quiz = { ...quiz, id: `quiz-${Date.now()}` };
    setQuizzes(prev => [...prev, newQuiz]);
    
    const course = courses.find(c => c.id === quiz.courseId);
    if (course?.studentIds) {
        course.studentIds.forEach(studentId => {
            createNotification({
                userId: studentId,
                message: `New quiz "${quiz.title}" in "${course.title}".`,
                link: `/course/${course.id}`
            });
        });
    }
  };

  const submitQuiz = (attempt: Omit<QuizAttempt, 'id'>) => {
    if (!currentUser || currentUser.role !== 'Student') return;
    const newAttempt: QuizAttempt = { ...attempt, id: `attempt-${Date.now()}` };
    setQuizAttempts(prev => [...prev, newAttempt]);
  };

  const sendChatMessage = (message: Omit<ChatMessage, 'id' | 'authorId' | 'timestamp'>) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}`,
        authorId: currentUser.id,
        timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const markAttendance = (courseId: string, attendanceData: { studentId: string, status: 'Present' | 'Absent' | 'Late' }[]) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    setAttendanceRecords(prev => {
        const otherRecords = prev.filter(rec => !(rec.courseId === courseId && rec.date === today));
        const newRecords: AttendanceRecord[] = attendanceData.map(data => ({
            id: `att-${data.studentId}-${courseId}-${today}`,
            courseId,
            studentId: data.studentId,
            date: today,
            status: data.status,
        }));
        return [...otherRecords, ...newRecords];
    });
  };

  const createFee = (feeData: { courseId: string; studentIds: string[]; description: string; amount: number; dueDate: string }) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    const newFees: Fee[] = feeData.studentIds.map(studentId => ({
        id: `fee-${Date.now()}-${Math.random()}`,
        studentId,
        courseId: feeData.courseId,
        description: feeData.description,
        amount: feeData.amount,
        dueDate: feeData.dueDate,
        status: 'Unpaid',
    }));
    setFees(prev => [...prev, ...newFees]);

    const course = courses.find(c => c.id === feeData.courseId);
    if(course) {
        feeData.studentIds.forEach(studentId => {
            createNotification({
                userId: studentId,
                message: `A new fee of $${feeData.amount} for "${feeData.description}" has been assigned.`,
                link: `/profile`
            });
        });
    }
  };

  const payFee = (feeId: string, paymentMethod: PaymentMethod) => {
      if (!currentUser || currentUser.role !== 'Student') return;
      setFees(prev => prev.map(f =>
          f.id === feeId ? {
              ...f,
              status: 'Paid',
              paymentMethod,
              paymentDate: new Date().toISOString()
          } : f
      ));
  };
  
  const uploadVideoMaterial = async (courseId: string, file: File) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    
    const fileUrl = URL.createObjectURL(file);
    const transcript = await generateVideoTranscript(file.name);

    const newVideoMaterial: VideoMaterial = {
        id: `video-${Date.now()}`,
        courseId,
        fileName: file.name,
        fileType: file.type,
        fileUrl,
        transcript,
        uploadedAt: new Date().toISOString()
    };
    
    setVideoMaterials(prev => [newVideoMaterial, ...prev]);

    const course = courses.find(c => c.id === courseId);
    if (course?.studentIds) {
        course.studentIds.forEach(studentId => {
            createNotification({
                userId: studentId,
                message: `New video "${file.name}" uploaded to "${course.title}".`,
                link: `/course/${courseId}`
            });
        });
    }
  };

  const deleteVideoMaterial = (videoId: string) => {
    if (!currentUser || currentUser.role !== 'Teacher') return;
    const videoToDelete = videoMaterials.find(v => v.id === videoId);
    if (videoToDelete?.fileUrl) {
        URL.revokeObjectURL(videoToDelete.fileUrl);
    }
    setVideoMaterials(prev => prev.filter(v => v.id !== videoId));
    setVideoNotes(prev => prev.filter(n => n.videoId !== videoId));
  };

  const createVideoNote = (note: Omit<VideoNote, 'id' | 'createdAt' | 'studentId'>) => {
    if (!currentUser) return;
    const newNote: VideoNote = {
        ...note,
        id: `vnote-${Date.now()}`,
        studentId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    setVideoNotes(prev => [...prev, newNote]);
  };

  const calculateCourseGrade = (courseId: string, studentId: string): number | null => {
    const courseAssignments = assignments.filter(a => a.courseId === courseId);
    const courseQuizzes = quizzes.filter(q => q.courseId === courseId);

    const studentSubmissions = submissions.filter(s =>
        s.studentId === studentId &&
        courseAssignments.some(a => a.id === s.assignmentId) &&
        s.grade !== null
    );

    const studentQuizAttempts = quizAttempts.filter(qa =>
        qa.studentId === studentId &&
        courseQuizzes.some(q => q.id === qa.quizId)
    );

    const allGrades = [
        ...studentSubmissions.map(s => s.grade!),
        ...studentQuizAttempts.map(qa => qa.score)
    ];

    if (allGrades.length === 0) {
        return null;
    }

    const total = allGrades.reduce((sum, grade) => sum + grade, 0);
    return total / allGrades.length;
  };


  const findCourseById = (id: string) => courses.find(c => c.id === id);
  const findAssignmentsByCourseId = (courseId: string) => assignments.filter(a => a.courseId === courseId);
  const findSubmissionsByAssignmentId = (assignmentId: string) => submissions.filter(s => s.assignmentId === assignmentId);
  const findUserById = (userId: string) => users.find(u => u.id === userId);
  const findSubmissionsByStudentId = (studentId: string, assignmentId: string) => submissions.filter(s => s.studentId === studentId && s.assignmentId === assignmentId);
  const findAnnouncementsByCourseId = (courseId: string) => announcements.filter(a => a.courseId === courseId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const findPostsByCourseId = (courseId: string) => discussionPosts.filter(p => p.courseId === courseId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const findMaterialsByCourseId = (courseId: string) => materials.filter(m => m.courseId === courseId).sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());;
  const findNotificationsByUserId = (userId: string) => notifications.filter(n => n.userId === userId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());;
  const findGroupsByCourseId = (courseId: string) => groups.filter(g => g.courseId === courseId);
  const findQuizzesByCourseId = (courseId: string) => quizzes.filter(q => q.courseId === courseId);
  const findQuizAttemptsByQuizId = (quizId: string) => quizAttempts.filter(qa => qa.quizId === quizId);
  const findQuizAttemptByStudent = (quizId: string, studentId: string) => quizAttempts.find(qa => qa.quizId === quizId && qa.studentId === studentId);
  const findChatMessagesByGroupId = (groupId: string) => chatMessages.filter(m => m.groupId === groupId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const findAttendanceByCourseForDate = (courseId: string, date: string) => attendanceRecords.filter(rec => rec.courseId === courseId && rec.date === date);
  const findAttendanceByCourseAndStudent = (courseId: string, studentId: string) => attendanceRecords.filter(rec => rec.courseId === courseId && rec.studentId === studentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const findFeesByStudentId = (studentId: string) => fees.filter(f => f.studentId === studentId).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  const findFeesByCourseId = (courseId: string) => fees.filter(f => f.courseId === courseId);
  const findVideoMaterialsByCourseId = (courseId: string) => videoMaterials.filter(v => v.courseId === courseId).sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  const findVideoNotesByVideoIdAndStudentId = (videoId: string, studentId: string) => videoNotes.filter(n => n.videoId === videoId && n.studentId === studentId).sort((a,b) => a.timestamp - b.timestamp);


  const contextValue: AppContextType = {
    currentUser, users, courses, assignments, submissions, quizzes, quizAttempts, attendanceRecords, announcements, fees,
    login, logout, register, loginWithUserObject, updateUserProfile, createCourse, enrollInCourse,
    createAssignment, submitAssignment, gradeSubmission, findCourseById,
    findAssignmentsByCourseId, findSubmissionsByAssignmentId, findUserById,
    findSubmissionsByStudentId, uploadMaterial, deleteMaterial, createAnnouncement, createDiscussionPost,
    markNotificationAsRead, markAllNotificationsAsRead, findAnnouncementsByCourseId, findPostsByCourseId, 
    findMaterialsByCourseId, findNotificationsByUserId, createGroup, joinGroup,
    leaveGroup, findGroupsByCourseId, createQuiz, submitQuiz, findQuizzesByCourseId,
    findQuizAttemptsByQuizId, findQuizAttemptByStudent, sendChatMessage, findChatMessagesByGroupId,
    markAttendance, findAttendanceByCourseForDate, findAttendanceByCourseAndStudent,
    createFee, payFee, findFeesByStudentId, findFeesByCourseId,
    uploadVideoMaterial, deleteVideoMaterial, createVideoNote, findVideoMaterialsByCourseId, findVideoNotesByVideoIdAndStudentId,
    calculateCourseGrade
  };
  
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen flex flex-col">
        <NeuralNetworkBackground />
        {currentUser && <Header />}
        <main className="flex-grow z-10">
          <Routes>
            <Route path="/auth" element={currentUser ? <Navigate to="/" /> : <Auth />} />
            <Route path="/" element={currentUser ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="/course/:id" element={currentUser ? <CourseDetail /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/auth" />} />
          </Routes>
        </main>
      </div>
    </AppContext.Provider>
  );
};

const Header: React.FC = () => {
    const { currentUser, logout, findNotificationsByUserId, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const notifications = currentUser ? findNotificationsByUserId(currentUser.id) : [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markNotificationAsRead(notification.id);
        }
        navigate(notification.link);
        setNotificationsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const DropdownMenu: React.FC<{isOpen: boolean, children: React.ReactNode, className?: string}> = ({ isOpen, children, className }) => (
        <div className={`absolute right-0 mt-2 glassmorphism rounded-xl z-20 overflow-hidden origin-top-right transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'} ${className}`}>
            {children}
        </div>
    );
    

    return (
        <header className="glassmorphism sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center space-x-4">
                        <SmartLearnLogo />
                        <span className="text-xl font-bold text-copy neon-text-primary">Smart Learn</span>
                    </Link>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="relative" ref={notificationsRef}>
                            <button onClick={() => setNotificationsOpen(o => !o)} className="p-2 rounded-full hover:bg-white/10 transition-colors relative" aria-label="Toggle notifications">
                               <BellIcon />
                               {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-background"></span>}
                            </button>
                            <DropdownMenu isOpen={notificationsOpen} className="w-80 sm:w-96">
                                <div className="p-4 flex justify-between items-center sticky top-0 bg-surface/80 backdrop-blur-sm border-b border-white/10">
                                    <h4 className="font-semibold text-lg text-copy">Notifications</h4>
                                    {unreadCount > 0 && <button onClick={markAllNotificationsAsRead} className="text-sm text-primary hover:underline">Mark all as read</button>}
                                </div>
                                <ul className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.map(n => (
                                      <li key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}>
                                          <div className="flex items-start">
                                            {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 mr-3 flex-shrink-0"></div>}
                                            <p className={`text-sm ${n.isRead ? 'text-copy-light ml-5' : 'text-copy'}`}>{n.message}</p>
                                          </div>
                                          <p className="text-xs text-copy-lighter mt-1 text-right">{new Date(n.createdAt).toLocaleString()}</p>
                                      </li>
                                    )) : <li className="p-4 text-center text-copy-light">No notifications yet.</li>}
                                </ul>
                            </DropdownMenu>
                        </div>

                         <div className="relative" ref={profileRef}>
                            <button onClick={() => setProfileOpen(o => !o)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Toggle user menu">
                                <UserCircleIcon className="h-8 w-8 text-copy-light"/>
                                <div className="text-left hidden sm:block">
                                   <p className="font-semibold leading-tight text-copy">{currentUser?.name}</p>
                                   <p className="text-sm text-copy-light leading-tight">{currentUser?.role}</p>
                                </div>
                            </button>
                            <DropdownMenu isOpen={profileOpen} className="w-48 py-2">
                                <ul>
                                    <li>
                                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center w-full px-4 py-2 text-md text-copy hover:bg-primary/10 hover:text-primary rounded-md m-1">
                                            <UserCircleIcon className="mr-3 h-5 w-5"/>
                                            My Profile
                                        </Link>
                                    </li>
                                     <li>
                                        <button onClick={() => { setProfileOpen(false); logout(); }} className="w-full text-left flex items-center px-4 py-2 text-md text-copy hover:bg-primary/10 hover:text-primary rounded-md m-1">
                                            <LogoutIcon className="mr-3 h-5 w-5" />
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
             {location.pathname === '/' && <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary animated-gradient-bar" />}
        </header>
    )
}

export default App;