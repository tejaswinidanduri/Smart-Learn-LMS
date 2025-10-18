import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../App';
import type { Course } from '../types';
import { Button, Card, Input, TextArea, Modal, Spinner } from './ui';
import { PlusCircleIcon, BookOpenIcon, CalendarIcon, ChartBarIcon, CertificateIcon, SmartLearnLogo, DownloadIcon } from './Icons';
import { generateCourseDescription } from '../services/geminiService';

const formatDueDate = (dueDateStr: string): { text: string; className: string; } => {
    const due = new Date(`${dueDateStr}T23:59:59`); 
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (due < today) {
        return { text: "Past due", className: "text-copy-light" };
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    if (due <= endOfToday) {
        return { text: "Due today", className: "text-danger font-semibold" };
    }
    if (due <= new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 - 1)) {
        return { text: "Due tomorrow", className: "text-yellow-400 font-semibold" };
    }
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
        return { text: `Due in ${diffDays} days`, className: "text-copy" };
    }

    return { 
        text: `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        className: "text-copy" 
    };
};


const Dashboard: React.FC = () => {
  const { currentUser } = useAppContext();
  const [activeView, setActiveView] = useState('courses');
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl font-extrabold mb-2 text-copy">Welcome back,</h1>
      <h2 className="text-3xl font-bold text-primary neon-text-primary mb-8">{currentUser?.name}!</h2>
      
      <div className="border-b border-white/10 mb-6">
        <nav className="flex space-x-1 sm:space-x-4">
          <TabButton tabName="courses" currentTab={activeView} setTab={setActiveView} icon={<BookOpenIcon className="h-5 w-5"/>}>My Courses</TabButton>
          <TabButton tabName="calendar" currentTab={activeView} setTab={setActiveView} icon={<CalendarIcon />}>Calendar</TabButton>
          {currentUser?.role === 'Student' && (
              <>
                <TabButton tabName="attendance" currentTab={activeView} setTab={setActiveView} icon={<ChartBarIcon className="h-5 w-5" />}>Attendance</TabButton>
                <TabButton tabName="certificates" currentTab={activeView} setTab={setActiveView} icon={<CertificateIcon />}>Certificates</TabButton>
              </>
          )}
        </nav>
      </div>

      {activeView === 'courses' && (currentUser?.role === 'Student' ? <StudentDashboard /> : <TeacherDashboard />)}
      {activeView === 'calendar' && <CalendarView />}
      {activeView === 'attendance' && currentUser?.role === 'Student' && <AttendanceOverview />}
      {activeView === 'certificates' && currentUser?.role === 'Student' && <CertificatesOverview />}
    </div>
  );
};

const TabButton: React.FC<{tabName: string, currentTab: string, setTab: (name: string) => void, icon: React.ReactNode, children: React.ReactNode}> = ({ tabName, currentTab, setTab, icon, children }) => (
    <button
      onClick={() => setTab(tabName)}
      className={`py-3 px-4 text-lg font-semibold transition-colors duration-200 flex items-center space-x-2 border-b-2 ${
        currentTab === tabName ? 'border-primary text-copy neon-text-primary' : 'border-transparent text-copy-light hover:text-copy hover:border-white/20'
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );

const StudentDashboard: React.FC = () => {
  const { currentUser, courses, enrollInCourse } = useAppContext();
  const navigate = useNavigate();

  const enrolledCourses = courses.filter(c => c.studentIds?.includes(currentUser!.id));
  const availableCourses = courses.filter(c => !c.studentIds?.includes(currentUser!.id));

  const handleEnroll = (courseId: string) => {
    enrollInCourse(courseId);
  };

  return (
    <div>
      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-primary pb-2 inline-block text-copy neon-text-primary">My Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => <CourseCard key={course.id} course={course} onAction={() => navigate(`/course/${course.id}`)} actionLabel="View Course" />)}
          </div>
        ) : (
          <p className="text-copy-light">You are not enrolled in any courses yet.</p>
        )}
      </section>

      <section className="mt-12">
        <UpcomingDeadlines />
      </section>
      
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-primary pb-2 inline-block text-copy neon-text-primary">Available Courses</h2>
        {availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map(course => <CourseCard key={course.id} course={course} onAction={() => handleEnroll(course.id)} actionLabel="Enroll Now" />)}
            </div>
        ) : (
            <p className="text-copy-light">No new courses available at the moment.</p>
        )}
      </section>
    </div>
  );
};

const TeacherDashboard: React.FC = () => {
  const { currentUser, courses, createCourse } = useAppContext();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const myCourses = courses.filter(c => c.teacherId === currentUser!.id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleGenerateDescription = async () => {
    if (!newCourse.title) {
        alert("Please enter a course title first.");
        return;
    }
    setIsGenerating(true);
    try {
        const description = await generateCourseDescription(newCourse.title);
        setNewCourse(prev => ({ ...prev, description }));
    } catch (error) {
        console.error("Failed to generate description:", error);
        alert("Could not generate description. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCourse(newCourse);
    setIsModalOpen(false);
    setNewCourse({ title: '', description: '', startDate: '', endDate: '' });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2 inline-block text-copy neon-text-primary">My Courses</h2>
        <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircleIcon />
            <span className="ml-2">Create Course</span>
        </Button>
      </div>
       {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map(course => <CourseCard key={course.id} course={course} onAction={() => navigate(`/course/${course.id}`)} actionLabel="Manage Course" />)}
          </div>
        ) : (
          <p className="text-copy-light">You have not created any courses yet.</p>
        )}
      <div className="mt-12">
        <UpcomingDeadlines />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Course">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Course Title" name="title" value={newCourse.title} onChange={handleChange} required />
          <div>
            <TextArea label="Description" name="description" value={newCourse.description} onChange={handleChange} required rows={4}/>
            <Button type="button" variant="secondary" className="mt-2 text-sm" onClick={handleGenerateDescription} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : '✨ Generate with AI'}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="date" value={newCourse.startDate} onChange={handleChange} required />
            <Input label="End Date" name="endDate" type="date" value={newCourse.endDate} onChange={handleChange} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Course</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const UpcomingDeadlines: React.FC = () => {
  const { currentUser, courses, assignments, submissions, findCourseById } = useAppContext();

  const upcomingAssignments = useMemo(() => {
    if (!currentUser) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const futureAssignments = assignments.filter(a => {
        const dueDate = new Date(`${a.dueDate}T23:59:59`);
        return dueDate >= today;
    });

    if (currentUser.role === 'Student') {
      const enrolledCourseIds = courses
        .filter(c => c.studentIds?.includes(currentUser.id))
        .map(c => c.id);

      const submittedAssignmentIds = new Set(
        submissions
          .filter(s => s.studentId === currentUser.id)
          .map(s => s.assignmentId)
      );

      return futureAssignments
        .filter(a => enrolledCourseIds.includes(a.courseId))
        .filter(a => !submittedAssignmentIds.has(a.id))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
    }
    
    if (currentUser.role === 'Teacher') {
      const taughtCourseIds = courses
        .filter(c => c.teacherId === currentUser.id)
        .map(c => c.id);
      
      return futureAssignments
        .filter(a => taughtCourseIds.includes(a.courseId))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
    }

    return [];
  }, [currentUser, courses, assignments, submissions]);

  const getSubmissionCount = (assignmentId: string) => {
    return submissions.filter(s => s.assignmentId === assignmentId).length;
  };

  const title = currentUser?.role === 'Student' ? "Upcoming Deadlines" : "Assignments Due Soon";

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-primary pb-2 inline-block text-copy neon-text-primary">{title}</h2>
        {upcomingAssignments.length === 0 ? (
          <p className="text-copy-light mt-4">
            {currentUser?.role === 'Student' ? "You're all caught up! No upcoming deadlines." : "No upcoming deadlines for your courses."}
          </p>
        ) : (
          <ul className="space-y-4">
            {upcomingAssignments.map(assignment => {
              const course = findCourseById(assignment.courseId);
              const dueDateInfo = formatDueDate(assignment.dueDate);
              return (
                <li key={assignment.id} className="p-4 bg-surface/60 rounded-lg hover:bg-surface transition-colors border border-white/10">
                  <Link to={`/course/${assignment.courseId}`} className="block">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg text-copy">{assignment.title}</p>
                        <p className="text-sm text-copy-light">{course?.title}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                         <p className={`flex items-center justify-end ${dueDateInfo.className}`}>
                           <CalendarIcon className="h-4 w-4 mr-1.5"/> 
                           {dueDateInfo.text}
                         </p>
                         {currentUser?.role === 'Teacher' && course && (
                           <p className="text-sm text-copy-light mt-1">
                             {getSubmissionCount(assignment.id)} / {course.studentIds?.length || 0} submissions
                           </p>
                         )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
};

const CalendarView = () => {
    const { currentUser, courses, assignments } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());

    const userCourses = useMemo(() => {
        if (!currentUser) return [];
        return currentUser.role === 'Teacher'
            ? courses.filter(c => c.teacherId === currentUser.id)
            : courses.filter(c => c.studentIds?.includes(currentUser.id));
    }, [currentUser, courses]);

    const events = useMemo(() => {
        const userCourseIds = userCourses.map(c => c.id);
        const courseMap = Object.fromEntries(userCourses.map(c => [c.id, c.title]));
        
        const assignmentEvents = assignments
            .filter(a => userCourseIds.includes(a.courseId))
            .map(a => ({
                date: new Date(`${a.dueDate}T00:00:00`),
                title: a.title,
                type: 'Assignment',
                courseId: a.courseId,
                courseTitle: courseMap[a.courseId]
            }));

        return [...assignmentEvents];
    }, [userCourses, assignments]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <Card>
            <div className="p-4 flex justify-between items-center border-b border-white/10">
                <Button variant="secondary" onClick={() => changeMonth(-1)}>&larr;</Button>
                <h2 className="text-xl font-bold text-copy">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <Button variant="secondary" onClick={() => changeMonth(1)}>&rarr;</Button>
            </div>
            <div className="grid grid-cols-7">
                {weekdays.map(day => <div key={day} className="text-center font-bold p-2 text-copy-light border-b border-r border-white/10">{day}</div>)}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border-r border-b border-white/10" />)}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const dayNumber = day + 1;
                    const today = new Date();
                    const isToday = today.getDate() === dayNumber && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
                    const eventsForDay = events.filter(e => 
                        e.date.getFullYear() === currentDate.getFullYear() && 
                        e.date.getMonth() === currentDate.getMonth() && 
                        e.date.getDate() === dayNumber
                    );
                    
                    return (
                        <div key={dayNumber} className="border-r border-b border-white/10 p-2 h-32 overflow-y-auto">
                            <div className={`font-bold text-center ${isToday ? 'bg-primary text-black rounded-full w-7 h-7 flex items-center justify-center' : 'text-copy'}`}>{dayNumber}</div>
                            {eventsForDay.map((event, i) => (
                                <Link to={`/course/${event.courseId}`} key={i} className="block mt-1 text-sm p-1 rounded-md bg-primary/20 hover:bg-primary/30 text-primary">
                                    <strong>{event.type}:</strong> {event.title}
                                    <em className="block text-xs text-primary/80">{event.courseTitle}</em>
                                </Link>
                            ))}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

const AttendanceOverview: React.FC = () => {
    const { currentUser, courses, attendanceRecords } = useAppContext();

    const attendanceData = useMemo(() => {
        if (!currentUser) return [];
        const enrolledCourses = courses.filter(c => c.studentIds?.includes(currentUser.id));
        
        return enrolledCourses.map(course => {
            const records = attendanceRecords.filter(r => r.courseId === course.id && r.studentId === currentUser.id);
            if (records.length === 0) {
                return { courseTitle: course.title, percentage: null };
            }
            const presentOrLate = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
            const percentage = (presentOrLate / records.length) * 100;
            return { courseTitle: course.title, percentage };
        });
    }, [currentUser, courses, attendanceRecords]);

    return (
        <Card>
            <div className="p-6">
                 <h2 className="text-2xl font-semibold mb-6 border-b-2 border-primary pb-2 inline-block text-copy neon-text-primary">Attendance Overview</h2>
                 {attendanceData.length === 0 ? (
                    <p className="text-copy-light">You are not enrolled in any courses with attendance records.</p>
                 ) : (
                    <div className="h-80 w-full bg-surface/60 rounded-lg p-4 flex items-end gap-4 border border-white/10 relative">
                        {/* Y-Axis Labels */}
                        <div className="h-full flex flex-col justify-between text-xs text-copy-light absolute -left-8 top-4 bottom-4">
                            <span>100%</span>
                            <span>75%</span>
                            <span>50%</span>
                            <span>25%</span>
                            <span>0%</span>
                        </div>

                        {/* Graph Bars */}
                        {attendanceData.map((data, index) => (
                             <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                                <div 
                                    className="w-full bg-gradient-to-t from-secondary to-primary rounded-t-md relative transition-all duration-700 ease-out origin-bottom flex items-end justify-center overflow-hidden"
                                    style={{ 
                                        height: `${data.percentage ?? 0}%`,
                                        transform: 'scaleY(0)',
                                        animation: `bar-grow 0.5s ${index * 0.1}s ease-out forwards`
                                    }}
                                >
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-copy opacity-0 group-hover:opacity-100 transition-opacity">
                                        {data.percentage !== null ? `${data.percentage.toFixed(1)}%` : 'N/A'}
                                    </span>
                                    <span className="text-xs text-center pb-1 text-black font-bold truncate w-full">{data.courseTitle}</span>
                                </div>
                            </div>
                        ))}
                         <style>{`
                            @keyframes bar-grow {
                                from { transform: scaleY(0); }
                                to { transform: scaleY(1); }
                            }
                        `}</style>
                    </div>
                 )}
            </div>
        </Card>
    );
};

const CertificateTemplate: React.FC<{ course: Course; forDownloadRef: React.RefObject<HTMLDivElement> }> = ({ course, forDownloadRef }) => {
    const { currentUser, findUserById, calculateCourseGrade } = useAppContext();
    const teacher = findUserById(course.teacherId);
    const grade = currentUser ? calculateCourseGrade(course.id, currentUser.id) : null;

    return (
        <div ref={forDownloadRef} className="bg-background text-copy p-1" style={{ width: '1000px' }}>
            <div className="border-4 border-primary p-10 text-center relative bg-background/80" style={{ fontFamily: "'Times New Roman', serif" }}>
                <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-primary/50"></div>
                <div className="flex justify-center"><SmartLearnLogo /></div>
                <h1 className="text-5xl font-bold text-primary neon-text-primary mt-4">Certificate of Completion</h1>
                <p className="text-lg mt-8 text-copy">This is to certify that</p>
                <p className="text-3xl font-semibold text-copy my-4 underline">{currentUser?.name}</p>
                <p className="text-lg text-copy">has successfully completed the course</p>
                <p className="text-3xl font-semibold text-copy my-4">"{course.title}"</p>
                {grade !== null && (
                    <p className="text-lg text-copy">with a final grade of <span className="font-bold">{grade.toFixed(1)}%</span></p>
                )}
                <p className="text-lg mt-2 text-copy">on {new Date(course.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
                <div className="mt-12 flex justify-between items-end">
                    <div className="text-center">
                        <p className="border-b-2 border-white/50 pb-1 px-4 text-copy">{teacher?.name}</p>
                        <p className="text-sm text-copy-light mt-1">Lead Instructor</p>
                    </div>
                    <div className="text-center">
                        <p className="border-b-2 border-white/50 pb-1 px-4 text-copy">Smart Learn</p>
                        <p className="text-sm text-copy-light mt-1">Learning Platform</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CertificatesOverview: React.FC = () => {
    const { currentUser, courses, calculateCourseGrade } = useAppContext();
    const [courseToDownload, setCourseToDownload] = useState<Course | null>(null);
    const certificateRef = useRef<HTMLDivElement>(null);

    const completedCourses = useMemo(() => {
        if (!currentUser) return [];
        const today = new Date();
        return courses
            .filter(c => c.studentIds?.includes(currentUser.id))
            .filter(c => new Date(c.endDate) < today);
    }, [currentUser, courses]);

    useEffect(() => {
        if (courseToDownload && certificateRef.current && (window as any).html2canvas) {
            (window as any).html2canvas(certificateRef.current, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: '#000814', // Match theme background
            }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = `Certificate_${courseToDownload.title.replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch((err: any) => {
                console.error("Failed to generate certificate image:", err);
                alert("Could not generate the certificate. Please try again.");
            }).finally(() => {
                setCourseToDownload(null); // Reset after download attempt
            });
        }
    }, [courseToDownload]);

    const handleDownloadClick = (course: Course) => {
        if (courseToDownload) return; // Prevent multiple clicks while one is processing
        setCourseToDownload(course);
    };

    return (
        <>
            <Card>
                <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-6 border-b-2 border-primary pb-2 inline-block text-copy neon-text-primary">My Certificates</h2>
                    {completedCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {completedCourses.map(course => {
                                const grade = calculateCourseGrade(course.id, currentUser!.id);
                                return (
                                    <div key={course.id} className="p-6 bg-surface/60 rounded-lg border border-white/10 flex flex-col justify-between hover:border-primary/50 transition-colors">
                                        <div>
                                            <h3 className="text-xl font-bold text-copy">{course.title}</h3>
                                            <p className="text-copy-light">Completed on: {new Date(course.endDate).toLocaleDateString()}</p>
                                            <p className="mt-4 text-2xl font-bold neon-text-primary">
                                                Final Grade: {grade !== null ? `${grade.toFixed(1)}%` : 'Not Graded'}
                                            </p>
                                        </div>
                                        <Button 
                                            onClick={() => handleDownloadClick(course)}
                                            className="mt-4 w-full"
                                            disabled={!!courseToDownload}
                                        >
                                            {courseToDownload?.id === course.id ? (
                                                <><Spinner/> <span className="ml-2">Preparing...</span></>
                                            ) : (
                                                <><DownloadIcon/><span className="ml-2">Download Certificate</span></>
                                            )}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-copy-light">You have not completed any courses yet. Certificates will appear here once you finish a course.</p>
                    )}
                </div>
            </Card>
            {/* Hidden element for rendering the certificate for canvas conversion */}
            {courseToDownload && (
                <div style={{ position: 'absolute', left: '-9999px', top: '0px', zIndex: -1 }}>
                    <CertificateTemplate course={courseToDownload} forDownloadRef={certificateRef} />
                </div>
            )}
        </>
    );
};


interface CourseCardProps {
    course: Course;
    onAction: () => void;
    actionLabel: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onAction, actionLabel }) => {
    const { findUserById } = useAppContext();
    const teacher = findUserById(course.teacherId);

    return (
        <Card className="flex flex-col transform hover:-translate-y-1 transition-transform duration-300 group hover:shadow-[0_0_20px_theme(colors.primary/0.5)] hover:border-primary/50">
            <div className="p-6 flex-grow relative border-b-2 border-primary/50">
                <BookOpenIcon className="h-12 w-12 text-primary/10 absolute right-4 top-4 transform group-hover:scale-110 transition-transform"/>
                <h3 className="text-2xl font-bold text-copy ">{course.title}</h3>
                <p className="text-sm text-copy-light mb-4 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                </p>
            </div>
            <div className="p-6 flex-grow">
                <p className="text-sm text-copy-light mb-4">Taught by {teacher?.name || 'Unknown'}</p>
                <p className="text-copy text-base leading-relaxed line-clamp-3">{course.description}</p>
            </div>
            <div className="bg-surface/60 p-4 border-t border-white/10">
                <Button onClick={onAction} className="w-full">{actionLabel}</Button>
            </div>
        </Card>
    )
}

export default Dashboard;