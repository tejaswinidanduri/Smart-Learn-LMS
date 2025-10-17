import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../App';
import type { Course } from '../types';
import { Button, Card, Input, TextArea, Modal } from './ui';
import { PlusCircleIcon, BookOpenIcon, CalendarIcon } from './Icons';
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
      <h1 className="text-4xl font-extrabold mb-2 text-white">Welcome back,</h1>
      <h2 className="text-3xl font-bold text-primary neon-text-primary mb-8">{currentUser?.name}!</h2>
      
      <div className="border-b border-white/10 mb-6">
        <nav className="flex space-x-1 sm:space-x-4">
          <TabButton tabName="courses" currentTab={activeView} setTab={setActiveView} icon={<BookOpenIcon className="h-5 w-5"/>}>My Courses</TabButton>
          <TabButton tabName="calendar" currentTab={activeView} setTab={setActiveView} icon={<CalendarIcon />}>Calendar</TabButton>
        </nav>
      </div>

      {activeView === 'courses' && (currentUser?.role === 'Student' ? <StudentDashboard /> : <TeacherDashboard />)}
      {activeView === 'calendar' && <CalendarView />}
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
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-primary pb-2 inline-block neon-text-primary">My Courses</h2>
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
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-primary pb-2 inline-block neon-text-primary">Available Courses</h2>
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
        <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2 inline-block neon-text-primary">My Courses</h2>
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
        <h2 className="text-2xl font-semibold mb-4 border-b-2 border-primary pb-2 inline-block neon-text-primary">{title}</h2>
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
                <li key={assignment.id} className="p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors border border-white/10">
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
    const { currentUser, courses, assignments, quizzes } = useAppContext();
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

        const quizEvents = quizzes
            .filter(q => userCourseIds.includes(q.courseId))
            .map(q => ({
                date: new Date(`${q.dueDate}T00:00:00`),
                title: q.title,
                type: 'Quiz',
                courseId: q.courseId,
                courseTitle: courseMap[q.courseId]
            }));

        return [...assignmentEvents, ...quizEvents];
    }, [userCourses, assignments, quizzes]);

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
                <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
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
                            <div className={`font-bold text-center ${isToday ? 'bg-primary text-black rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>{dayNumber}</div>
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
                <h3 className="text-2xl font-bold text-white ">{course.title}</h3>
                <p className="text-sm text-copy-light mb-4 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                </p>
            </div>
            <div className="p-6 flex-grow">
                <p className="text-sm text-copy-light mb-4">Taught by {teacher?.name || 'Unknown'}</p>
                <p className="text-copy text-base leading-relaxed line-clamp-3">{course.description}</p>
            </div>
            <div className="bg-black/20 p-4 border-t border-white/10">
                <Button onClick={onAction} className="w-full">{actionLabel}</Button>
            </div>
        </Card>
    )
}

export default Dashboard;