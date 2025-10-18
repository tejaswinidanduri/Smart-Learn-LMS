import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';
import type { Announcement, Assignment, Submission, DiscussionPost, CourseMaterial, Group, Quiz, Question, QuestionType, QuizAttempt, ChatMessage, AttendanceRecord, Fee, VideoMaterial } from '../types';
import { Button, Card, Input, TextArea, Modal, Spinner } from './ui';
import { PlusCircleIcon, PaperClipIcon, DownloadIcon, TrashIcon, ChatBubbleIcon, UsersIcon, BookOpenIcon, ChartBarIcon, ClipboardCheckIcon, SendIcon, ClipboardListIcon, ChartPieIcon, CheckCircleIcon, ClockIcon, XCircleIcon, MegaphoneIcon, CreditCardIcon, VideoCameraIcon } from './Icons';
import { generateAssignmentFeedback, generateQuizQuestions } from '../services/geminiService';
import VideoPlayerView from './VideoPlayerView';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, findCourseById, findUserById } = useAppContext();
  const [activeTab, setActiveTab] = useState('Announcements');
  
  const course = findCourseById(id!);

  if (!course) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl">Course not found.</h2>
        <Button onClick={() => navigate('/')} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  const teacher = findUserById(course.teacherId);
  const isEnrolled = currentUser?.role === 'Student' && course.studentIds?.includes(currentUser.id);
  const isTeacher = currentUser?.role === 'Teacher' && course.teacherId === currentUser.id;
  const canViewContent = isEnrolled || isTeacher;

  const TabButton: React.FC<{tabName: string, icon: React.ReactNode}> = ({ tabName, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`py-3 px-4 text-lg font-semibold transition-colors duration-200 flex items-center space-x-2 border-b-2 ${
        activeTab === tabName ? 'border-primary text-copy neon-text-primary' : 'border-transparent text-copy-light hover:text-copy hover:border-white/20'
      }`}
    >
      {icon}
      <span>{tabName}</span>
    </button>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-primary hover:underline">
        &larr; Back to Dashboard
      </button>
      <div className="mb-8 p-8 glassmorphism rounded-xl border-t-2 border-primary">
        <h1 className="text-4xl font-extrabold text-copy neon-text-primary">{course.title}</h1>
        <p className="text-copy-light mt-2">Taught by {teacher?.name}</p>
        <p className="mt-4 text-lg text-copy/90">{course.description}</p>
      </div>
        
      {canViewContent ? (
        <>
          <div className="border-b border-white/10 mb-6">
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto">
              <TabButton tabName="Announcements" icon={<MegaphoneIcon />} />
              <TabButton tabName="Assignments" icon={<BookOpenIcon className="h-5 w-5" />} />
              <TabButton tabName="Quizzes" icon={<ClipboardCheckIcon />} />
              <TabButton tabName="Videos" icon={<VideoCameraIcon />} />
              <TabButton tabName="Attendance" icon={<ClipboardListIcon />} />
              <TabButton tabName="Materials" icon={<PaperClipIcon />} />
              <TabButton tabName="Discussion" icon={<ChatBubbleIcon />} />
              {!isTeacher && <TabButton tabName="Study Groups" icon={<UsersIcon />} />}
              {isTeacher && <TabButton tabName="Fees" icon={<CreditCardIcon />} />}
              {isTeacher && <TabButton tabName="Reports" icon={<ChartBarIcon />} />}
            </nav>
          </div>

          <div>
            {activeTab === 'Announcements' && <AnnouncementsSection courseId={course.id} isTeacher={isTeacher} />}
            {activeTab === 'Assignments' && <AssignmentSection courseId={course.id} isTeacher={isTeacher} />}
            {activeTab === 'Quizzes' && <QuizzesSection courseId={course.id} isTeacher={isTeacher} />}
            {activeTab === 'Videos' && <VideoSection courseId={course.id} isTeacher={isTeacher} />}
            {activeTab === 'Attendance' && <AttendanceSection courseId={course.id} isTeacher={isTeacher} />}
            {activeTab === 'Materials' && <CourseMaterials courseId={course.id} isTeacher={isTeacher} />}
            {activeTab === 'Discussion' && <DiscussionForum courseId={course.id} />}
            {activeTab === 'Study Groups' && !isTeacher && <StudyGroupsSection courseId={course.id} isTeacher={isTeacher} />}
            {activeTab === 'Fees' && isTeacher && <FeesManagementSection courseId={course.id} />}
            {activeTab === 'Reports' && isTeacher && <ReportsSection courseId={course.id} />}
          </div>
        </>
      ) : (
        <p className="text-center text-xl">You must be enrolled to view course materials.</p>
      )}

      {isTeacher && <EnrolledStudents courseId={course.id} />}
    </div>
  );
};

// ANNOUNCEMENTS SECTION
const AnnouncementsSection: React.FC<{ courseId: string; isTeacher: boolean; }> = ({ courseId, isTeacher }) => {
  const { createAnnouncement, findAnnouncementsByCourseId, findUserById } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  const announcements = findAnnouncementsByCourseId(courseId);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    createAnnouncement({ courseId, ...newAnnouncement });
    setIsModalOpen(false);
    setNewAnnouncement({ title: '', content: '' });
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-copy">Announcements</h2>
        {isTeacher && (
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircleIcon />
            <span className="ml-2">New Announcement</span>
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {announcements.length > 0 ? (
          announcements.map(announcement => {
            const author = findUserById(announcement.authorId);
            return (
              <Card key={announcement.id}>
                <div className="p-6">
                  <h3 className="text-xl font-bold neon-text-primary">{announcement.title}</h3>
                  <p className="text-sm text-copy-light mb-2">
                    Posted by {author?.name || 'Teacher'} on {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                  <p className="whitespace-pre-wrap text-copy">{announcement.content}</p>
                </div>
              </Card>
            )
          })
        ) : (
          <p className="text-copy-light">No announcements have been posted for this course yet.</p>
        )}
      </div>
      {isTeacher && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Announcement">
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <Input label="Title" name="title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})} required />
            <TextArea label="Content" name="content" value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} required rows={5} />
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Post Announcement</Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};


// ASSIGNMENTS SECTION
const AssignmentSection: React.FC<{ courseId: string; isTeacher: boolean; }> = ({ courseId, isTeacher }) => {
  const { createAssignment, findAssignmentsByCourseId } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });
  const assignments = findAssignmentsByCourseId(courseId);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    createAssignment({ courseId, ...newAssignment });
    setIsModalOpen(false);
    setNewAssignment({ title: '', description: '', dueDate: '' });
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-copy">Assignments</h2>
        {isTeacher && (
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircleIcon />
            <span className="ml-2">New Assignment</span>
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {assignments.length > 0 ? (
          assignments.map(assignment => <AssignmentView key={assignment.id} assignment={assignment} isTeacher={isTeacher} />)
        ) : (
          <p className="text-copy-light">No assignments have been posted for this course yet.</p>
        )}
      </div>
      {isTeacher && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Assignment">
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <Input label="Title" name="title" value={newAssignment.title} onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})} required />
            <TextArea label="Description" name="description" value={newAssignment.description} onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})} required />
            <Input label="Due Date" name="dueDate" type="date" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})} required />
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

const AssignmentView: React.FC<{ assignment: Assignment; isTeacher: boolean }> = ({ assignment, isTeacher }) => {
  const { currentUser, findSubmissionsByStudentId, submitAssignment, findSubmissionsByAssignmentId, submissions } = useAppContext();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mySubmission = useMemo(() => {
    if (isTeacher || !currentUser) return null;
    return findSubmissionsByStudentId(currentUser.id, assignment.id)[0];
  }, [currentUser, assignment.id, findSubmissionsByStudentId, isTeacher, submissions]);
  
  const allSubmissions = isTeacher ? findSubmissionsByAssignmentId(assignment.id) : [];

  const isPastDue = new Date() > new Date(`${assignment.dueDate}T23:59:59`);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setFile(e.target.files[0]);
    } else {
        setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPastDue) {
        alert("The due date for this assignment has passed.");
        return;
    }
    if (!currentUser || (!content.trim() && !file)) {
        alert("Please provide a text submission or upload a file.");
        return;
    }
    setIsSubmitting(true);

    try {
        const submissionPayload: Omit<Submission, 'id' | 'grade' | 'feedback' | 'gradedAt'> = {
            assignmentId: assignment.id,
            studentId: currentUser.id,
            content: content,
            submittedAt: new Date().toISOString(),
        };

        if (file) {
            if (mySubmission?.fileUrl) {
                URL.revokeObjectURL(mySubmission.fileUrl);
            }
            submissionPayload.fileUrl = URL.createObjectURL(file);
            submissionPayload.fileName = file.name;
            submissionPayload.fileType = file.type;
        }

        submitAssignment(submissionPayload);
        setContent('');
        setFile(null);
        const fileInput = document.getElementById(`file-input-${assignment.id}`) as HTMLInputElement;
        if(fileInput) fileInput.value = "";
    } catch (error) {
        console.error("Submission failed:", error);
        alert("There was an error submitting your assignment. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const downloadFile = (fileData: { fileUrl?: string; fileName?: string; }) => {
    if (!fileData.fileUrl || !fileData.fileName) return;
    const a = document.createElement('a');
    a.href = fileData.fileUrl;
    a.download = fileData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-xl font-bold text-copy">{assignment.title}</h3>
        <p className="text-sm text-copy-light mb-2">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
        <p className="text-copy">{assignment.description}</p>
      </div>
      {!isTeacher && currentUser && (
        <div className="p-6 bg-surface/60 border-t border-white/10">
          {mySubmission && (
            <div className="mb-6 pb-6 border-b border-white/20">
              <h4 className="font-semibold text-lg text-copy">Your Current Submission</h4>
              {mySubmission.content && <p className="mt-2 p-3 bg-background rounded-md whitespace-pre-wrap border border-white/10 text-copy">{mySubmission.content}</p>}
              {mySubmission.fileName && (
                <div className="mt-2 p-3 bg-background rounded-md border border-white/10 flex items-center justify-between">
                    <div className="flex items-center">
                        <PaperClipIcon />
                        <span className="ml-3 font-medium text-copy">{mySubmission.fileName}</span>
                    </div>
                    <Button variant="secondary" onClick={() => downloadFile(mySubmission)} aria-label={`Download ${mySubmission.fileName}`}><DownloadIcon /></Button>
                </div>
              )}
              {mySubmission.grade !== null ? (
                <div className="mt-4 p-3 border-l-4 border-success bg-success/10 rounded-r-md">
                    <p className="font-bold text-success">Grade: {mySubmission.grade}%</p>
                    <p className="font-semibold mt-2 text-copy">Feedback:</p>
                    <p className="text-copy-light">{mySubmission.feedback}</p>
                </div>
              ) : (
                <p className="mt-4 text-secondary">Awaiting grade.</p>
              )}
            </div>
          )}

          {isPastDue ? (
             <div className="mt-4 p-4 bg-danger/10 border-l-4 border-danger rounded-r-md flex items-start">
                <ClockIcon className="h-6 w-6 text-danger mr-3 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-danger">Submissions Closed</p>
                    <p className="text-copy-light mt-1">
                        {mySubmission 
                            ? "The due date has passed, and you can no longer update your submission."
                            : "The due date for this assignment has passed. Submissions are no longer accepted."}
                    </p>
                </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-semibold text-lg text-copy">{mySubmission ? 'Update Your Submission' : 'Submit Your Assignment'}</h4>
              <TextArea label="Text Submission (Optional)" value={content} onChange={(e) => setContent(e.target.value)} rows={5} />
              <Input label="Upload File (Optional)" type="file" id={`file-input-${assignment.id}`} onChange={handleFileChange} />
              {file && <p className="text-sm text-copy-light">Selected file: {file.name}</p>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : mySubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
              </Button>
            </form>
          )}
        </div>
      )}
      {isTeacher && (
        <div className="p-6 bg-surface/60 border-t border-white/10">
           <h4 className="font-semibold text-lg mb-2 text-copy">Submissions ({allSubmissions.length})</h4>
           {allSubmissions.length > 0 ? (
               <div className="space-y-4">
                   {allSubmissions.map(sub => <SubmissionGrading key={sub.id} submission={sub} assignmentTitle={assignment.title}/>)}
               </div>
           ) : (
               <p className="text-copy-light">No submissions yet.</p>
           )}
        </div>
      )}
    </Card>
  );
};

const SubmissionGrading: React.FC<{ submission: Submission; assignmentTitle: string }> = ({ submission, assignmentTitle }) => {
    const { findUserById, gradeSubmission } = useAppContext();
    const student = findUserById(submission.studentId);
    const [grade, setGrade] = useState(submission.grade?.toString() || '');
    const [feedback, setFeedback] = useState(submission.feedback || '');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGradeSubmit = () => {
        gradeSubmission(submission.id, parseInt(grade, 10), feedback);
    };
    
    const handleGenerateFeedback = async () => {
        setIsGenerating(true);
        try {
            const generatedFeedback = await generateAssignmentFeedback(assignmentTitle, submission.content || 'No text submitted.');
            setFeedback(generatedFeedback);
        } catch (error) {
            console.error(error);
            alert("Failed to generate feedback.");
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadFile = (fileData: { fileUrl?: string; fileName?: string; }) => {
        if (!fileData.fileUrl || !fileData.fileName) return;
        const a = document.createElement('a');
        a.href = fileData.fileUrl;
        a.download = fileData.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="p-4 bg-background rounded-lg border border-white/10">
            <p className="font-bold text-copy">{student?.name || 'Unknown Student'}</p>
            <p className="text-sm text-copy-light">Submitted on: {new Date(submission.submittedAt).toLocaleString()}</p>
            {submission.content && <p className="mt-2 p-3 bg-surface/60 rounded-md whitespace-pre-wrap border border-white/10 text-copy">{submission.content}</p>}
            {submission.fileName && (
                <div className="mt-2 p-3 bg-surface/60 rounded-md border border-white/10 flex items-center justify-between">
                    <div className="flex items-center">
                        <PaperClipIcon />
                        <span className="ml-3 font-medium text-copy">{submission.fileName}</span>
                    </div>
                    <Button variant="secondary" onClick={() => downloadFile(submission)} aria-label={`Download ${submission.fileName}`}><DownloadIcon /></Button>
                </div>
              )}
            <div className="mt-4 flex gap-4 items-end">
                <div className="flex-grow">
                    <TextArea label="Feedback" value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} />
                    <Button type="button" variant="secondary" className="text-sm mt-2" onClick={handleGenerateFeedback} disabled={isGenerating}>
                      {isGenerating ? <Spinner/> : '✨ Generate Feedback with AI'}
                    </Button>
                </div>
                <div className="w-24">
                   <Input label="Grade (%)" type="number" value={grade} onChange={e => setGrade(e.target.value)} />
                </div>
                <Button onClick={handleGradeSubmit} disabled={!grade || !feedback}>Save Grade</Button>
            </div>
        </div>
    )
}

// QUIZZES SECTION
const QuizzesSection: React.FC<{ courseId: string; isTeacher: boolean; }> = ({ courseId, isTeacher }) => {
  const { currentUser, findQuizzesByCourseId, createQuiz, submitQuiz, findQuizAttemptByStudent, findQuizAttemptsByQuizId, findUserById } = useAppContext();
  const quizzes = findQuizzesByCourseId(courseId);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isTakeQuizModalOpen, setTakeQuizModalOpen] = useState(false);
  const [isViewResultsModalOpen, setViewResultsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([]);
  
  const [materialForAI, setMaterialForAI] = useState('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const resetCreateForm = () => {
    setQuizTitle('');
    setQuestions([]);
    setMaterialForAI('');
  };
  
  const handleGenerateQuestions = async () => {
    if (!materialForAI.trim()) {
        alert("Please paste some course material to generate questions from.");
        return;
    }
    setIsGeneratingQuestions(true);
    try {
        const newQuestions = await generateQuizQuestions(materialForAI);
        setQuestions(prev => [...prev, ...newQuestions]);
        setMaterialForAI(''); // Clear textarea after generation
    } catch (error) {
        console.error(error);
        alert("Failed to generate quiz questions. Please check the console for details.");
    } finally {
        setIsGeneratingQuestions(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '' }]);
  };
  
  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    if(newQuestions[qIndex].options){
      newQuestions[qIndex].options![oIndex] = value;
      setQuestions(newQuestions);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const handleCreateQuiz = () => {
    if (!quizTitle || questions.length === 0) {
        alert("Please fill in all fields.");
        return;
    }
    const finalQuestions: Question[] = questions.map(q => ({ ...q, id: `q-${Date.now()}-${Math.random()}`}));
    createQuiz({ courseId, title: quizTitle, questions: finalQuestions });
    setCreateModalOpen(false);
    resetCreateForm();
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setTakeQuizModalOpen(true);
  };
  
  const handleViewResults = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setViewResultsModalOpen(true);
  };
  
  const TakeQuizView: React.FC<{ quiz: Quiz; onClose: () => void }> = ({ quiz, onClose }) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleSubmitQuiz = () => {
      if (!currentUser) return;
      let correctCount = 0;
      quiz.questions.forEach(q => {
        if(answers[q.id] === q.correctAnswer) {
            correctCount++;
        }
      });
      const score = (correctCount / quiz.questions.length) * 100;

      submitQuiz({
        quizId: quiz.id,
        studentId: currentUser.id,
        answers,
        score,
        submittedAt: new Date().toISOString()
      });
      onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Quiz: ${quiz.title}`}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
              {quiz.questions.map((q, qIndex) => (
                <div key={q.id}>
                  <p className="font-semibold text-copy">{qIndex + 1}. {q.text}</p>
                  <div className="mt-2 space-y-1 pl-4 text-copy">
                    {q.type === 'multiple-choice' && q.options?.map((opt, oIndex) => (
                        <label key={oIndex} className="flex items-center">
                          <input type="radio" name={q.id} value={opt} onChange={e => setAnswers({...answers, [q.id]: e.target.value})} className="mr-2 accent-primary"/> {opt}
                        </label>
                    ))}
                    {q.type === 'true-false' && (
                        <>
                         <label className="flex items-center"><input type="radio" name={q.id} value="True" onChange={e => setAnswers({...answers, [q.id]: e.target.value})} className="mr-2 accent-primary"/> True</label>
                         <label className="flex items-center"><input type="radio" name={q.id} value="False" onChange={e => setAnswers({...answers, [q.id]: e.target.value})} className="mr-2 accent-primary"/> False</label>
                        </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-white/10">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmitQuiz} disabled={Object.keys(answers).length !== quiz.questions.length}>Submit Quiz</Button>
            </div>
        </Modal>
    );
  };
  
  const ViewResultsView: React.FC<{ quiz: Quiz; onClose: () => void }> = ({ quiz, onClose }) => {
    const attempts = findQuizAttemptsByQuizId(quiz.id);
    return (
        <Modal isOpen={true} onClose={onClose} title={`Results for ${quiz.title}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                {attempts.length > 0 ? (
                    <table className="w-full text-left text-copy">
                        <thead className="bg-surface/60"><tr><th className="p-2 font-semibold">Student</th><th className="p-2 font-semibold">Score</th></tr></thead>
                        <tbody>
                        {attempts.map(attempt => {
                            const student = findUserById(attempt.studentId);
                            return (
                                <tr key={attempt.id} className="border-b border-white/10"><td className="p-2">{student?.name}</td><td className="p-2">{attempt.score.toFixed(1)}%</td></tr>
                            )
                        })}
                        </tbody>
                    </table>
                ) : <p className="text-copy-light">No attempts yet.</p>}
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-white/10">
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
  };
  
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-copy">Quizzes</h2>
        {isTeacher && <Button onClick={() => setCreateModalOpen(true)}><PlusCircleIcon /><span className="ml-2">New Quiz</span></Button>}
      </div>
      <div className="space-y-4">
        {quizzes.length > 0 ? (
          quizzes.map(quiz => {
            const studentAttempt = !isTeacher && currentUser ? findQuizAttemptByStudent(quiz.id, currentUser.id) : null;
            return (
              <Card key={quiz.id} className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-copy">{quiz.title}</h3>
                </div>
                <div>
                  {isTeacher && <Button onClick={() => handleViewResults(quiz)}>View Results</Button>}
                  {!isTeacher && (
                    studentAttempt 
                    ? <p className="font-bold text-lg text-primary neon-text-primary">Score: {studentAttempt.score.toFixed(1)}%</p>
                    : <Button onClick={() => handleTakeQuiz(quiz)}>Take Quiz</Button>
                  )}
                </div>
              </Card>
            )
          })
        ) : <p className="text-copy-light">No quizzes posted yet.</p>}
      </div>
      
      {isCreateModalOpen && (
        <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Quiz">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <Input label="Quiz Title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
            
            <div className="p-4 border border-white/10 rounded-md bg-surface/60 space-y-2">
                <h4 className="font-semibold text-md text-copy">✨ AI Question Generator</h4>
                <TextArea 
                    label="Paste course material here"
                    value={materialForAI}
                    onChange={e => setMaterialForAI(e.target.value)}
                    rows={5}
                    placeholder="Paste text from your course materials, and the AI will generate questions based on it."
                />
                <Button type="button" variant="secondary" onClick={handleGenerateQuestions} disabled={isGeneratingQuestions}>
                    {isGeneratingQuestions ? <Spinner /> : 'Generate Questions'}
                </Button>
            </div>
            
            <hr className="border-white/10"/>
            <h3 className="font-semibold text-lg text-copy">Questions ({questions.length})</h3>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 border border-white/10 rounded-md space-y-2 relative bg-surface/30">
                <Button variant="danger" className="absolute top-2 right-2 p-1 h-auto" onClick={() => handleRemoveQuestion(qIndex)}>&times;</Button>
                <TextArea label={`Question ${qIndex + 1}`} value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} rows={2} />
                <select value={q.type} onChange={e => handleQuestionChange(qIndex, 'type', e.target.value)} className="w-full p-2 border border-white/20 bg-surface/50 rounded-md text-copy">
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                </select>
                {q.type === 'multiple-choice' && (
                    <div className="space-y-1 text-copy">
                        {q.options?.map((opt, oIndex) => (
                           <div key={oIndex} className="flex items-center gap-2">
                             <input type="radio" className="accent-primary" name={`correct-ans-${qIndex}`} checked={q.correctAnswer === opt} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', opt)}/>
                             <Input label="" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} />
                           </div>
                        ))}
                    </div>
                )}
                {q.type === 'true-false' && (
                  <div className="space-y-1 text-copy">
                    <label className="flex items-center gap-2"><input type="radio" className="accent-primary" name={`correct-ans-${qIndex}`} checked={q.correctAnswer === "True"} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', "True")}/> True</label>
                    <label className="flex items-center gap-2"><input type="radio" className="accent-primary" name={`correct-ans-${qIndex}`} checked={q.correctAnswer === "False"} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', "False")}/> False</label>
                  </div>
                )}
              </div>
            ))}
            <Button variant="secondary" onClick={handleAddQuestion}>Add Question</Button>
          </div>
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-white/10">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleCreateQuiz}>Create Quiz</Button>
          </div>
        </Modal>
      )}

      {isTakeQuizModalOpen && selectedQuiz && <TakeQuizView quiz={selectedQuiz} onClose={() => setTakeQuizModalOpen(false)} />}
      {isViewResultsModalOpen && selectedQuiz && <ViewResultsView quiz={selectedQuiz} onClose={() => setViewResultsModalOpen(false)} />}
    </section>
  );
};

// VIDEO SECTION
const VideoSection: React.FC<{ courseId: string; isTeacher: boolean; }> = ({ courseId, isTeacher }) => {
    const { findVideoMaterialsByCourseId, uploadVideoMaterial, deleteVideoMaterial } = useAppContext();
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isPlayerOpen, setPlayerOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoMaterial | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const videos = findVideoMaterialsByCourseId(courseId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            await uploadVideoMaterial(courseId, file);
            setUploadModalOpen(false);
            setFile(null);
        } catch (error) {
            console.error("Video upload failed:", error);
            alert("Video upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handlePlayVideo = (video: VideoMaterial) => {
        setSelectedVideo(video);
        setPlayerOpen(true);
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-copy">Videos</h2>
                {isTeacher && (
                    <Button onClick={() => setUploadModalOpen(true)}>
                        <PlusCircleIcon />
                        <span className="ml-2">Upload Video</span>
                    </Button>
                )}
            </div>
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map(video => (
                        <Card key={video.id} className="group relative overflow-hidden">
                            <div className="aspect-video bg-black flex items-center justify-center">
                                <VideoCameraIcon className="h-16 w-16 text-copy-light" />
                            </div>
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button onClick={() => handlePlayVideo(video)}>Watch Video</Button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold truncate text-copy">{video.fileName}</h3>
                                <p className="text-sm text-copy-light">Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}</p>
                                {isTeacher && (
                                     <Button variant="danger" className="w-full mt-2" onClick={() => deleteVideoMaterial(video.id)}>
                                        <TrashIcon /> <span className="ml-2">Delete</span>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-copy-light">No videos have been uploaded for this course yet.</p>
            )}

            {isTeacher && (
                 <Modal isOpen={isUploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload New Video">
                    <div className="space-y-4">
                        <Input label="Select Video File" type="file" accept="video/*" onChange={handleFileChange} />
                        {file && <p className="text-sm text-copy-light">Selected: {file.name}</p>}
                        <p className="text-xs text-copy-light">Note: AI transcript generation will begin after upload.</p>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpload} disabled={!file || isUploading}>
                                {isUploading ? <Spinner/> : 'Upload'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {isPlayerOpen && selectedVideo && (
                 <VideoPlayerView
                    video={selectedVideo}
                    onClose={() => {
                        setPlayerOpen(false);
                        setSelectedVideo(null);
                    }}
                />
            )}
        </section>
    );
};


// ATTENDANCE SECTION
const AttendanceSection: React.FC<{ courseId: string; isTeacher: boolean; }> = ({ courseId, isTeacher }) => {
    if (isTeacher) {
        return <TeacherAttendanceView courseId={courseId} />;
    } else {
        return <StudentAttendanceView courseId={courseId} />;
    }
};

const TeacherAttendanceView: React.FC<{ courseId: string }> = ({ courseId }) => {
    const { findCourseById, findUserById, markAttendance, findAttendanceByCourseForDate, attendanceRecords } = useAppContext();
    const course = findCourseById(courseId);
    const students = useMemo(() => 
        course?.studentIds?.map(id => findUserById(id)).filter(Boolean) as any[] || [],
        [course, findUserById]
    );

    const today = new Date().toISOString().split('T')[0];
    const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const todaysRecords = findAttendanceByCourseForDate(courseId, today);
        if (todaysRecords.length > 0) {
            const initialAttendance = Object.fromEntries(
                todaysRecords.map(rec => [rec.studentId, rec.status])
            );
            setAttendance(initialAttendance);
            setIsSaved(true);
        } else {
            // Pre-fill with 'Present' for easier marking
            const initialAttendance = Object.fromEntries(students.map(s => [s.id, 'Present']));
            setAttendance(initialAttendance);
        }
    }, [courseId, today, findAttendanceByCourseForDate, students]);

    const handleMark = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
        setAttendance(prev => ({...prev, [studentId]: status}));
        setIsSaved(false);
    };

    const handleSave = () => {
        const attendanceData = students.map(s => ({
            studentId: s.id,
            status: attendance[s.id] || 'Absent' // Default to absent if not marked
        }));
        markAttendance(courseId, attendanceData);
        setIsSaved(true);
    };
    
    const calculateStudentStats = (studentId: string) => {
        const studentRecords = attendanceRecords.filter(r => r.courseId === courseId && r.studentId === studentId);
        if (studentRecords.length === 0) return { percentage: 'N/A' };
        
        const present = studentRecords.filter(r => r.status === 'Present').length;
        const late = studentRecords.filter(r => r.status === 'Late').length;
        const total = studentRecords.length;
        const percentage = ((present + late) / total * 100).toFixed(1);

        return { percentage: `${percentage}%` };
    }

    const StatusButton: React.FC<{current: string, value: string, onClick: () => void, children: React.ReactNode, color: string, activeColor: string}> = ({ current, value, onClick, children, color, activeColor}) => {
      const isActive = current === value;
      return <button onClick={onClick} className={`px-3 py-1 text-sm rounded-md border border-white/20 ${isActive ? `${color} ${activeColor}` : 'bg-surface/60 hover:bg-surface'}`}>{children}</button>
    }

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-copy">Mark Attendance for {new Date(today).toLocaleDateString()}</h2>
                <Button onClick={handleSave} disabled={isSaved}>
                    {isSaved ? 'Attendance Saved' : 'Save Attendance'}
                </Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px] text-copy">
                        <thead className="bg-surface/60">
                            <tr>
                                <th className="p-4 font-semibold">Student Name</th>
                                <th className="p-4 font-semibold">Overall Attendance</th>
                                <th className="p-4 font-semibold">Today's Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id} className="border-b border-white/10 last:border-b-0">
                                    <td className="p-4 font-medium">{student.name}</td>
                                    <td className="p-4">{calculateStudentStats(student.id).percentage}</td>
                                    <td className="p-4 space-x-2">
                                        <StatusButton current={attendance[student.id]} value="Present" onClick={() => handleMark(student.id, 'Present')} color="bg-success" activeColor="text-black">Present</StatusButton>
                                        <StatusButton current={attendance[student.id]} value="Late" onClick={() => handleMark(student.id, 'Late')} color="bg-yellow-500" activeColor="text-black">Late</StatusButton>
                                        <StatusButton current={attendance[student.id]} value="Absent" onClick={() => handleMark(student.id, 'Absent')} color="bg-danger" activeColor="text-white">Absent</StatusButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </section>
    );
};

const StudentAttendanceView: React.FC<{ courseId: string }> = ({ courseId }) => {
    const { currentUser, findAttendanceByCourseAndStudent } = useAppContext();
    const myRecords = currentUser ? findAttendanceByCourseAndStudent(courseId, currentUser.id) : [];

    const stats = useMemo(() => {
        if (myRecords.length === 0) return { percentage: 'N/A', present: 0, late: 0, absent: 0 };
        const present = myRecords.filter(r => r.status === 'Present').length;
        const late = myRecords.filter(r => r.status === 'Late').length;
        const absent = myRecords.filter(r => r.status === 'Absent').length;
        const total = myRecords.length;
        const percentage = ((present + late) / total * 100).toFixed(1);
        return { percentage: `${percentage}%`, present, late, absent };
    }, [myRecords]);

    const getStatusChip = (status: AttendanceRecord['status']) => {
        const colors: Record<string, string> = {
            'Present': 'bg-success/20 text-success',
            'Late': 'bg-yellow-500/20 text-yellow-400',
            'Absent': 'bg-danger/20 text-danger'
        }
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>
    }

    return (
        <section>
            <h2 className="text-2xl font-semibold mb-4 text-copy">My Attendance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 flex flex-col items-center justify-center">
                    <ChartPieIcon />
                    <h3 className="text-lg font-semibold text-copy-light mt-2">Attendance %</h3>
                    <p className="text-3xl font-bold mt-1 text-copy">{stats.percentage}</p>
                </Card>
                 <Card className="p-4 flex flex-col items-center justify-center">
                    <CheckCircleIcon />
                    <h3 className="text-lg font-semibold text-copy-light mt-2">Present</h3>
                    <p className="text-3xl font-bold mt-1 text-copy">{stats.present}</p>
                </Card>
                 <Card className="p-4 flex flex-col items-center justify-center">
                    <ClockIcon />
                    <h3 className="text-lg font-semibold text-copy-light mt-2">Late</h3>
                    <p className="text-3xl font-bold mt-1 text-copy">{stats.late}</p>
                </Card>
                 <Card className="p-4 flex flex-col items-center justify-center">
                    <XCircleIcon />
                    <h3 className="text-lg font-semibold text-copy-light mt-2">Absent</h3>
                    <p className="text-3xl font-bold mt-1 text-copy">{stats.absent}</p>
                </Card>
            </div>
             <Card>
                <div className="p-4 border-b border-white/10"><h3 className="font-semibold text-lg text-copy">Attendance Log</h3></div>
                {myRecords.length > 0 ? (
                    <ul className="divide-y divide-white/10">
                        {myRecords.map(record => (
                            <li key={record.id} className="p-4 flex justify-between items-center">
                                <span className="font-medium text-copy">{new Date(record.date).toLocaleDateString()}</span>
                                {getStatusChip(record.status)}
                            </li>
                        ))}
                    </ul>
                ) : <p className="p-4 text-copy-light">No attendance has been recorded yet.</p>}
            </Card>
        </section>
    );
};


// MATERIALS SECTION
const CourseMaterials: React.FC<{ courseId: string, isTeacher: boolean }> = ({ courseId, isTeacher }) => {
    const { findMaterialsByCourseId, uploadMaterial, deleteMaterial } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const materials = findMaterialsByCourseId(courseId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setIsUploading(true);
        uploadMaterial({
            courseId,
            fileName: file.name,
            fileType: file.type,
            fileUrl: URL.createObjectURL(file)
        });
        setIsModalOpen(false);
        setFile(null);
        setIsUploading(false);
    };
    
    const downloadFile = (material: CourseMaterial) => {
        const a = document.createElement('a');
        a.href = material.fileUrl;
        a.download = material.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <section>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-copy">Course Materials</h2>
                {isTeacher && (
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusCircleIcon />
                    <span className="ml-2">Upload Material</span>
                </Button>
                )}
            </div>
            {materials.length > 0 ? (
                <Card className="p-4 sm:p-6">
                    <ul className="space-y-3">
                        {materials.map(m => (
                            <li key={m.id} className="flex justify-between items-center p-3 bg-surface/60 rounded-md border border-white/10">
                                <div className="flex items-center text-copy">
                                    <PaperClipIcon />
                                    <span className="ml-3 font-medium">{m.fileName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="secondary" onClick={() => downloadFile(m)} aria-label={`Download ${m.fileName}`}><DownloadIcon /></Button>
                                    {isTeacher && <Button variant="danger" onClick={() => deleteMaterial(m.id)} aria-label={`Delete ${m.fileName}`}><TrashIcon /></Button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
            ) : (
                <p className="text-copy-light">No materials have been uploaded yet.</p>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload New Material">
                <div className="space-y-4">
                    <Input label="Select File" type="file" onChange={handleFileChange} />
                    {file && <p className="text-sm text-copy-light">Selected: {file.name}</p>}
                     <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpload} disabled={!file || isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </section>
    );
};


// DISCUSSION SECTION
const DiscussionForum: React.FC<{ courseId: string }> = ({ courseId }) => {
    const { findPostsByCourseId, createDiscussionPost, findUserById, currentUser } = useAppContext();
    const [newPostContent, setNewPostContent] = useState('');
    const allPosts = findPostsByCourseId(courseId);

    const topLevelPosts = allPosts.filter(p => !p.parentId);
    const repliesByParentId = allPosts.reduce((acc, post) => {
        if (post.parentId) {
            if (!acc[post.parentId]) acc[post.parentId] = [];
            acc[post.parentId].push(post);
        }
        return acc;
    }, {} as Record<string, DiscussionPost[]>);

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        createDiscussionPost({ courseId, content: newPostContent, parentId: null });
        setNewPostContent('');
    };

    const Post: React.FC<{post: DiscussionPost}> = ({ post }) => {
        const author = findUserById(post.authorId);
        const [isReplying, setIsReplying] = useState(false);
        const [replyContent, setReplyContent] = useState('');
        const postReplies = repliesByParentId[post.id] || [];

        const handleReplySubmit = () => {
             if (!replyContent.trim()) return;
             createDiscussionPost({ courseId, content: replyContent, parentId: post.id });
             setReplyContent('');
             setIsReplying(false);
        }
        
        return (
            <div className="p-4 bg-surface/60 rounded-lg border border-white/10">
                <div className="flex items-center mb-2">
                    <p className="font-bold text-copy">{author?.name || 'Unknown User'}</p>
                    <p className="text-xs text-copy-light ml-2">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
                <p className="whitespace-pre-wrap text-copy">{post.content}</p>
                <div className="mt-2">
                    <button onClick={() => setIsReplying(r => !r)} className="text-sm text-primary hover:underline">
                        {isReplying ? 'Cancel' : 'Reply'}
                    </button>
                </div>
                {isReplying && (
                    <div className="mt-2 flex gap-2">
                        <TextArea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={2} label="" placeholder={`Reply to ${author?.name}...`}/>
                        <Button onClick={handleReplySubmit}>Send</Button>
                    </div>
                )}
                {postReplies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-white/20 space-y-4">
                        {postReplies.map(reply => <Post key={reply.id} post={reply} />)}
                    </div>
                )}
            </div>
        )
    };
    
    return (
        <section>
            <h2 className="text-2xl font-semibold mb-4 text-copy">Discussion Forum</h2>
            <Card className="p-4 sm:p-6 mb-6">
                <form onSubmit={handlePostSubmit} className="space-y-2">
                    <TextArea label="Start a new discussion" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} rows={3} required />
                    <div className="flex justify-end">
                        <Button type="submit">Post</Button>
                    </div>
                </form>
            </Card>
            <div className="space-y-4">
                {topLevelPosts.length > 0 ? (
                    topLevelPosts.map(post => <Post key={post.id} post={post} />)
                ) : (
                    <p className="text-copy-light">No discussions have been started yet. Be the first!</p>
                )}
            </div>
        </section>
    );
};

// STUDY GROUPS SECTION
const StudyGroupsSection: React.FC<{ courseId: string; isTeacher: boolean; }> = ({ courseId, isTeacher }) => {
    const { currentUser, createGroup, joinGroup, leaveGroup, findGroupsByCourseId, findUserById } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });

    const groups = findGroupsByCourseId(courseId);
    const userGroup = useMemo(() => 
        currentUser ? groups.find(g => g.memberIds.includes(currentUser.id)) : undefined,
        [groups, currentUser]
    );

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault();
        createGroup({ courseId, ...newGroup });
        setIsModalOpen(false);
        setNewGroup({ name: '', description: '' });
    };
    
    const handleJoinGroup = (groupId: string) => {
        joinGroup(groupId);
    };

    const handleLeaveGroup = (groupId: string) => {
        leaveGroup(groupId);
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-copy">Study Groups</h2>
                {!isTeacher && !userGroup && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PlusCircleIcon />
                        <span className="ml-2">Create Group</span>
                    </Button>
                )}
            </div>
            <div className="space-y-4">
                {groups.length > 0 ? (
                    groups.map(group => (
                       <Card key={group.id} className="p-6">
                           <div className="flex justify-between items-start">
                               <div>
                                   <h3 className="text-xl font-bold text-copy">{group.name}</h3>
                                   <p className="text-copy-light mt-2">{group.description}</p>
                               </div>
                               {!isTeacher && (
                                   userGroup?.id === group.id 
                                   ? <Button variant="danger" onClick={() => handleLeaveGroup(group.id)}>Leave Group</Button>
                                   : !userGroup && <Button onClick={() => handleJoinGroup(group.id)}>Join Group</Button>
                               )}
                           </div>
                           <div className="mt-4 pt-4 border-t border-white/10 text-copy">
                               <h4 className="font-semibold flex items-center"><UsersIcon /><span className="ml-2">Members ({group.memberIds.length})</span></h4>
                               <ul className="mt-2 list-disc list-inside text-copy-light">
                                   {group.memberIds.map(id => {
                                       const member = findUserById(id);
                                       return <li key={id}>{member?.name}</li>
                                   })}
                               </ul>
                           </div>
                           {userGroup?.id === group.id && <GroupChat groupId={group.id} />}
                       </Card>
                    ))
                ) : (
                    <p className="text-copy-light">No study groups have been formed yet. {!isTeacher && 'Why not create one?'}</p>
                )}
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Study Group">
                <form onSubmit={handleCreateGroup} className="space-y-4">
                    <Input label="Group Name" name="name" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})} required />
                    <TextArea label="Description" name="description" value={newGroup.description} onChange={(e) => setNewGroup({...newGroup, description: e.target.value})} required />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create</Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
};

const GroupChat: React.FC<{ groupId: string }> = ({ groupId }) => {
    const { currentUser, findChatMessagesByGroupId, sendChatMessage, findUserById } = useAppContext();
    const [messageContent, setMessageContent] = useState('');
    const messages = findChatMessagesByGroupId(groupId);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(!messageContent.trim()) return;
        sendChatMessage({ groupId, content: messageContent });
        setMessageContent('');
    };

    return (
        <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="font-semibold mb-2 text-copy">Group Chat</h4>
            <div className="bg-surface/60 border border-white/10 rounded-lg p-4 h-64 overflow-y-auto" ref={chatContainerRef}>
                {messages.length > 0 ? (
                    messages.map(msg => {
                        const author = findUserById(msg.authorId);
                        const isCurrentUser = author?.id === currentUser?.id;
                        return (
                           <div key={msg.id} className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end': 'items-start'}`}>
                               <div className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-md text-copy ${isCurrentUser ? 'bg-primary text-black' : 'bg-surface'}`}>
                                   {!isCurrentUser && <p className="text-xs font-bold text-secondary">{author?.name}</p>}
                                   <p>{msg.content}</p>
                               </div>
                               <p className="text-xs text-copy-lighter mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                           </div>
                        )
                    })
                ) : (
                    <p className="text-copy-light text-center h-full flex items-center justify-center">Start the conversation!</p>
                )}
            </div>
            <form onSubmit={handleSendMessage} className="mt-2 flex gap-2">
                <Input label="" placeholder="Type a message..." value={messageContent} onChange={e => setMessageContent(e.target.value)} className="flex-grow !text-background" />
                <Button type="submit" aria-label="Send Message"><SendIcon /></Button>
            </form>
        </div>
    )
};


// FEES MANAGEMENT SECTION (TEACHER)
const FeesManagementSection: React.FC<{ courseId: string }> = ({ courseId }) => {
    const { findCourseById, findUserById, findFeesByCourseId, createFee } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feeData, setFeeData] = useState({ description: '', amount: '', dueDate: '' });

    const course = findCourseById(courseId);
    const students = useMemo(() =>
        course?.studentIds?.map(id => findUserById(id)).filter(Boolean) as any[] || [],
        [course, findUserById]
    );
    const courseFees = findFeesByCourseId(courseId);

    const getStudentFeeStatus = (studentId: string) => {
        // This logic is simple; assumes one fee per course for now for display
        const studentFee = courseFees.find(f => f.studentId === studentId);
        if (!studentFee) return <span className="text-copy-lighter">Not Assigned</span>;
        if (studentFee.status === 'Paid') return <span className="px-2 py-1 text-xs font-medium rounded-full bg-success/20 text-success">Paid</span>;
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-danger/20 text-danger">Unpaid</span>;
    };
    
    const handleAssignFee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!course?.studentIds) return;
        createFee({
            courseId,
            studentIds: course.studentIds,
            description: feeData.description || `${course.title} Fee`,
            amount: parseFloat(feeData.amount),
            dueDate: feeData.dueDate,
        });
        setIsModalOpen(false);
        setFeeData({ description: '', amount: '', dueDate: '' });
    };

    return (
        <section>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-copy">Fee Status</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusCircleIcon />
                    <span className="ml-2">Assign Fee</span>
                </Button>
            </div>
            <Card>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px] text-copy">
                        <thead className="bg-surface/60">
                            <tr>
                                <th className="p-4 font-semibold">Student Name</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id} className="border-b border-white/10 last:border-b-0">
                                    <td className="p-4 font-medium">{student.name}</td>
                                    <td className="p-4 text-copy-light">{student.email}</td>
                                    <td className="p-4">{getStudentFeeStatus(student.id)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Fee to All Students">
                <form onSubmit={handleAssignFee} className="space-y-4">
                    <p className="text-copy-light">This will assign a new fee to all {students.length} students enrolled in this course.</p>
                    <Input label="Fee Description" value={feeData.description} onChange={e => setFeeData({...feeData, description: e.target.value})} placeholder={`${course?.title} Tuition Fee`} required />
                    <Input label="Amount ($)" type="number" value={feeData.amount} onChange={e => setFeeData({...feeData, amount: e.target.value})} required />
                    <Input label="Due Date" type="date" value={feeData.dueDate} onChange={e => setFeeData({...feeData, dueDate: e.target.value})} required />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Assign Fee</Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}


// REPORTS SECTION (TEACHER VIEW)
const ReportsSection: React.FC<{ courseId: string }> = ({ courseId }) => {
    const { findCourseById, findAssignmentsByCourseId, findUserById, submissions } = useAppContext();

    const course = findCourseById(courseId);
    const assignments = findAssignmentsByCourseId(courseId);
    const students = useMemo(() => 
        course?.studentIds?.map(id => findUserById(id)).filter(Boolean) as any[] || [],
        [course, findUserById]
    );

    const reportData = useMemo(() => {
        if (!course) return null;
        
        const courseAssignmentIds = assignments.map(a => a.id);
        const courseSubmissions = submissions.filter(s => courseAssignmentIds.includes(s.assignmentId));
        const gradedSubmissions = courseSubmissions.filter(s => s.grade !== null);
        
        const totalGrade = gradedSubmissions.reduce((sum, s) => sum + s.grade!, 0);
        const overallAverageGrade = gradedSubmissions.length > 0 ? (totalGrade / gradedSubmissions.length) : 0;
        
        const assignmentStats = assignments.map(assignment => {
            const submissionsForAssignment = courseSubmissions.filter(s => s.assignmentId === assignment.id);
            const gradedSubmissionsForAssignment = submissionsForAssignment.filter(s => s.grade !== null);
            const totalGrade = gradedSubmissionsForAssignment.reduce((sum, s) => sum + s.grade!, 0);
            const averageGrade = gradedSubmissionsForAssignment.length > 0 ? (totalGrade / gradedSubmissionsForAssignment.length) : 0;
            const submissionRate = students.length > 0 ? (submissionsForAssignment.length / students.length) * 100 : 0;

            return { id: assignment.id, title: assignment.title, submissionCount: submissionsForAssignment.length, submissionRate, averageGrade };
        });

        const studentStats = students.map(student => {
            const submissionsByStudent = courseSubmissions.filter(s => s.studentId === student.id);
            const gradedSubmissionsByStudent = submissionsByStudent.filter(s => s.grade !== null);
            const totalGrade = gradedSubmissionsByStudent.reduce((sum, s) => sum + s.grade!, 0);
            const averageGrade = gradedSubmissionsByStudent.length > 0 ? (totalGrade / gradedSubmissionsByStudent.length) : 0;
            
            return { id: student.id, name: student.name, submittedCount: submissionsByStudent.length, averageGrade };
        });

        return { overallAverageGrade, assignmentStats, studentStats };
    }, [course, students, assignments, submissions]);
    
    const handleExport = () => {
        if (!reportData) return;
        const headers = ["Student Name", "Submitted Assignments", "Average Grade (%)"];
        
        const escapeCsvCell = (cell: any) => `"${String(cell).replace(/"/g, '""')}"`;
        const rows = reportData.studentStats.map(s => 
            [escapeCsvCell(s.name), s.submittedCount, s.averageGrade.toFixed(2)].join(',')
        );
        
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${course?.title}_student_report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!reportData) return <Spinner />;

    if (students.length === 0) {
        return (
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-copy">Reports</h2>
                <p className="text-copy-light">No students are enrolled in this course yet. Reporting data will be available once students enroll.</p>
            </section>
        );
    }
    
    return (
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-copy">Reports Dashboard</h2>
                 <Button onClick={handleExport} variant="secondary">
                    <DownloadIcon />
                    <span className="ml-2">Export Student Data</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 text-center"><h3 className="text-lg font-semibold text-copy-light">Enrolled Students</h3><p className="text-4xl font-bold mt-2 text-copy">{students.length}</p></Card>
                <Card className="p-6 text-center"><h3 className="text-lg font-semibold text-copy-light">Assignments</h3><p className="text-4xl font-bold mt-2 text-copy">{assignments.length}</p></Card>
                <Card className="p-6 text-center"><h3 className="text-lg font-semibold text-copy-light">Overall Average Grade</h3><p className="text-4xl font-bold mt-2 text-copy">{reportData.overallAverageGrade.toFixed(1)}%</p></Card>
            </div>

            <Card className="mb-8">
                 <div className="p-6 border-b border-white/10"><h3 className="text-xl font-semibold text-copy">Assignment Performance</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px] text-copy"><thead className="bg-surface/60"><tr><th className="p-4 font-semibold">Assignment</th><th className="p-4 font-semibold">Submission Rate</th><th className="p-4 font-semibold">Average Grade</th></tr></thead>
                        <tbody>
                            {reportData.assignmentStats.map(stat => (
                                <tr key={stat.id} className="border-b border-white/10 last:border-b-0"><td className="p-4">{stat.title}</td><td className="p-4">{stat.submissionCount}/{students.length} ({stat.submissionRate.toFixed(0)}%)</td><td className="p-4">{stat.averageGrade > 0 ? `${stat.averageGrade.toFixed(1)}%` : 'N/A'}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card>
                <div className="p-6 border-b border-white/10"><h3 className="text-xl font-semibold text-copy">Student Performance</h3></div>
                <div className="overflow-x-auto">
                     <table className="w-full text-left min-w-[600px] text-copy"><thead className="bg-surface/60"><tr><th className="p-4 font-semibold">Student Name</th><th className="p-4 font-semibold">Assignments Submitted</th><th className="p-4 font-semibold">Average Grade</th></tr></thead>
                        <tbody>
                            {reportData.studentStats.map(stat => (
                                <tr key={stat.id} className="border-b border-white/10 last:border-b-0"><td className="p-4">{stat.name}</td><td className="p-4">{stat.submittedCount}/{assignments.length}</td><td className="p-4">{stat.averageGrade > 0 ? `${stat.averageGrade.toFixed(1)}%` : 'N/A'}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </section>
    );
};

// ENROLLED STUDENTS (TEACHER VIEW)
const EnrolledStudents: React.FC<{ courseId: string }> = ({ courseId }) => {
    const { findCourseById, findUserById } = useAppContext();
    const course = findCourseById(courseId);
    const students = course?.studentIds?.map(id => findUserById(id)).filter(Boolean) as any[];

    return (
        <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4 text-copy">Enrolled Students ({students?.length || 0})</h2>
            {students && students.length > 0 ? (
                <Card className="p-6">
                    <ul className="space-y-2">
                        {students.map(student => (
                            <li key={student.id} className="text-copy-light">{student.name} ({student.email})</li>
                        ))}
                    </ul>
                </Card>
            ) : (
                <p className="text-copy-light">No students have enrolled yet.</p>
            )}
        </section>
    );
};

export default CourseDetail;