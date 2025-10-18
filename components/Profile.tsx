import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../App';
import { Card, Input, Button, TextArea, Modal } from './ui';
import { UserCircleIcon, BookOpenIcon, UsersIcon, ChartPieIcon, ClockIcon, ClipboardCheckIcon, CreditCardIcon, GooglePayLogo, PhonePeLogo, CheckCircleIcon, PaytmLogo } from './Icons';
import type { Course, User, Fee, PaymentMethod } from '../types';

// A helper function for password validation
const isPasswordValid = (password: string): boolean => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
};

const Profile: React.FC = () => {
    const { currentUser } = useAppContext();
    if (!currentUser) return null;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Link to="/" className="mb-4 block text-sm text-primary hover:underline">
                &larr; Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-6 text-copy">My Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <ProfileCard />
                </div>
                <div className="lg:col-span-2">
                    {currentUser.role === 'Student' && <StudentProfileBody />}
                    {currentUser.role === 'Teacher' && <TeacherProfileBody />}
                </div>
            </div>
        </div>
    );
};

const ProfileCard: React.FC = () => {
    const { currentUser, updateUserProfile } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        name: currentUser!.name,
        password: '',
        confirmPassword: '',
        bio: currentUser!.bio || '',
        admissionNumber: currentUser!.admissionNumber || '',
        admissionYear: currentUser!.admissionYear || '',
        idNumber: currentUser!.idNumber || '',
        bloodGroup: currentUser!.bloodGroup || '',
        phoneNumber: currentUser!.phoneNumber || '',
        dateOfBirth: currentUser!.dateOfBirth || '',
        gender: currentUser!.gender || 'Prefer not to say',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'admissionYear' ? (value ? parseInt(value, 10) : '') : value });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        
        const updateData: Partial<Omit<User, 'id' | 'email' | 'role' | 'registeredAt'>> = {};

        // Helper to check for changes and add to updateData
        const checkForChange = <K extends keyof typeof formData>(key: K, currentVal: any) => {
            if (formData[key] !== (currentVal || (typeof formData[key] === 'number' ? '' : ''))) {
                 (updateData as any)[key] = formData[key] === '' ? undefined : formData[key];
            }
        };
        
        checkForChange('name', currentUser.name);
        checkForChange('bio', currentUser.bio);
        if (currentUser.role === 'Student') {
            checkForChange('admissionNumber', currentUser.admissionNumber);
            checkForChange('admissionYear', currentUser.admissionYear);
        } else {
            checkForChange('idNumber', currentUser.idNumber);
        }
        checkForChange('bloodGroup', currentUser.bloodGroup);
        checkForChange('phoneNumber', currentUser.phoneNumber);
        checkForChange('dateOfBirth', currentUser.dateOfBirth);
        if (formData.gender !== (currentUser.gender || 'Prefer not to say')) {
            updateData.gender = formData.gender as User['gender'];
        }

        if (formData.password) {
            if (!isPasswordValid(formData.password)) {
                alert("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
            updateData.password = formData.password;
        }

        if (Object.keys(updateData).length > 0) {
            updateUserProfile(currentUser.id, updateData);
            alert("Profile updated successfully!");
        }
        setIsEditing(false);
        setFormData({ ...formData, password: '', confirmPassword: '' });
    };
    
    const DetailItem: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => (
        <div className="grid grid-cols-3 gap-2">
            <span className="font-semibold text-copy col-span-1">{label}:</span>
            <span className="col-span-2">{value || 'N/A'}</span>
        </div>
    );
    
    return (
         <Card>
            <div className="p-6">
                <div className="flex flex-col items-center text-center">
                    <UserCircleIcon className="h-24 w-24 text-copy-lighter" />
                    <h2 className="text-2xl font-bold mt-4 text-copy">{currentUser!.name}</h2>
                    <p className="text-copy-light">{currentUser!.email}</p>
                    <p className="text-sm bg-primary/20 text-primary font-semibold px-3 py-1 rounded-full mt-2">{currentUser!.role}</p>
                </div>

                {!isEditing && (
                    <div className="mt-6 border-t border-white/10 pt-6 text-sm text-copy-light space-y-3">
                        <DetailItem label="Joined" value={new Date(currentUser!.registeredAt).toLocaleDateString()} />
                        {currentUser!.role === 'Student' ? (
                            <>
                                <DetailItem label="Admission No" value={currentUser!.admissionNumber} />
                                <DetailItem label="Admission Year" value={currentUser!.admissionYear} />
                            </>
                        ) : (
                            <DetailItem label="ID Number" value={currentUser!.idNumber} />
                        )}
                        <DetailItem label="Date of Birth" value={currentUser!.dateOfBirth} />
                        <DetailItem label="Gender" value={currentUser!.gender} />
                        <DetailItem label="Blood Group" value={currentUser!.bloodGroup} />
                        <DetailItem label="Phone" value={currentUser!.phoneNumber} />
                        
                        <div>
                            <p className="font-semibold text-copy mb-1">About Me:</p>
                            <p className="italic whitespace-pre-wrap">{currentUser!.bio || 'No bio yet. Click Edit Profile to add one.'}</p>
                        </div>
                    </div>
                )}
                
                <div className="mt-6 border-t border-white/10 pt-6">
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                            {currentUser!.role === 'Student' ? (
                                <>
                                    <Input label="Admission Number" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} />
                                    <Input label="Admission Year" name="admissionYear" type="number" value={formData.admissionYear} onChange={handleChange} />
                                </>
                            ) : (
                                <Input label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleChange} />
                            )}
                            <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-copy-light">Gender</label>
                                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full bg-surface/50 border border-white/20 rounded-lg py-2 px-3 text-copy focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm">
                                    <option>Prefer not to say</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                            <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                            <TextArea label="About Me" name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tell us a little about yourself..."/>
                            <div>
                                <Input label="New Password (optional)" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••"/>
                                <p className="text-xs text-copy-lighter mt-1.5 px-1">
                                    Must be 8+ characters and contain an uppercase, lowercase, number, and special character.
                                </p>
                            </div>
                            <Input label="Confirm New Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••"/>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} className="w-full">Edit Profile</Button>
                    )}
                </div>
            </div>
        </Card>
    );
}


const StudentProfileBody: React.FC = () => {
    const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

    const handlePayClick = (fee: Fee) => {
        setSelectedFee(fee);
        setPaymentModalOpen(true);
    };

    const handleCloseModal = () => {
        setPaymentModalOpen(false);
        setSelectedFee(null);
    };
    
    return (
        <div className="space-y-8">
            <StudentStats />
            <StudentFees onPayClick={handlePayClick} />
            <StudentActivityFeed />
            <StudentCourseList />
            {isPaymentModalOpen && selectedFee && (
                <PaymentModal
                    fee={selectedFee}
                    isOpen={isPaymentModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}

const StudentStats: React.FC = () => {
    const { currentUser, courses, submissions } = useAppContext();
    const stats = useMemo(() => {
        if (currentUser?.role !== 'Student') return null;

        const enrolledCourses = courses.filter(c => c.studentIds?.includes(currentUser.id));
        const userSubmissions = submissions.filter(s => s.studentId === currentUser.id && s.grade !== null);
        
        const totalGrade = userSubmissions.reduce((acc, sub) => acc + sub.grade!, 0);
        const averageGrade = userSubmissions.length > 0 ? totalGrade / userSubmissions.length : 0;

        return {
            enrolledCoursesCount: enrolledCourses.length,
            averageGrade,
            submissionsCount: userSubmissions.length
        };
    }, [currentUser, courses, submissions]);

    if (!stats) return null;

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-copy">My Progress</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-surface/60 p-4 rounded-lg">
                        <BookOpenIcon className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-3xl font-bold mt-2 text-copy">{stats.enrolledCoursesCount}</p>
                        <p className="text-copy-light">Courses Enrolled</p>
                    </div>
                    <div className="bg-surface/60 p-4 rounded-lg">
                        <ChartPieIcon />
                        <p className="text-3xl font-bold mt-2 text-copy">{stats.averageGrade.toFixed(1)}%</p>
                        <p className="text-copy-light">Average Grade</p>
                    </div>
                    <div className="bg-surface/60 p-4 rounded-lg">
                        <ClipboardCheckIcon className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-3xl font-bold mt-2 text-copy">{stats.submissionsCount}</p>
                        <p className="text-copy-light">Graded Submissions</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const StudentFees: React.FC<{ onPayClick: (fee: Fee) => void }> = ({ onPayClick }) => {
    const { currentUser, findFeesByStudentId } = useAppContext();
    const fees = findFeesByStudentId(currentUser!.id);

    const getStatusChip = (status: Fee['status']) => {
        const colors: Record<string, string> = {
            'Paid': 'bg-success/20 text-success',
            'Unpaid': 'bg-danger/20 text-danger',
            'Overdue': 'bg-danger/40 text-danger font-bold'
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
    };

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-copy">My Fees</h3>
                {fees.length > 0 ? (
                    <ul className="space-y-3">
                        {fees.map(fee => (
                            <li key={fee.id} className="p-3 bg-surface/60 rounded-md border border-white/10 flex flex-col sm:flex-row justify-between sm:items-center">
                                <div>
                                    <p className="font-semibold text-copy">{fee.description}</p>
                                    <p className="text-sm text-copy-light">Amount: <span className="font-medium text-copy">${fee.amount.toFixed(2)}</span> | Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                    {getStatusChip(fee.status)}
                                    {fee.status === 'Unpaid' && <Button onClick={() => onPayClick(fee)}>Pay Now</Button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-copy-light">You have no outstanding or past fees.</p>
                )}
            </div>
        </Card>
    );
};

const PaymentModal: React.FC<{ fee: Fee; isOpen: boolean; onClose: () => void; }> = ({ fee, isOpen, onClose }) => {
    const { payFee } = useAppContext();
    const [paymentState, setPaymentState] = useState<'options' | 'processing' | 'success'>('options');

    const handlePayment = (method: PaymentMethod) => {
        setPaymentState('processing');
        // Simulate API call
        setTimeout(() => {
            payFee(fee.id, method);
            setPaymentState('success');
            setTimeout(() => {
                onClose();
                setPaymentState('options');
            }, 2000);
        }, 1500);
    };

    const PaymentButton: React.FC<{ method: PaymentMethod, children: React.ReactNode }> = ({ method, children }) => (
        <button
            onClick={() => handlePayment(method)}
            className="w-full flex items-center p-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors group"
        >
            {children}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={paymentState !== 'processing' ? onClose : () => {}} title="Complete Your Payment">
            <div className="text-center">
                {paymentState === 'options' && (
                    <>
                        <p className="text-copy-light">You are paying for:</p>
                        <p className="text-lg font-semibold text-copy">{fee.description}</p>
                        <p className="text-4xl font-bold my-4 text-copy">${fee.amount.toFixed(2)}</p>
                        <div className="space-y-3 mt-6">
                            <PaymentButton method="Card">
                                <CreditCardIcon className="mr-4 h-6 w-6 text-copy group-hover:text-primary"/>
                                <span className="font-semibold text-copy group-hover:text-primary">Pay with Card</span>
                            </PaymentButton>
                            <PaymentButton method="Google Pay">
                                <GooglePayLogo className="mr-4 h-6 w-auto" />
                                <span className="font-semibold text-copy group-hover:text-primary">Pay with Google Pay</span>
                            </PaymentButton>
                             <PaymentButton method="PhonePe">
                                <PhonePeLogo className="mr-4 h-6 w-auto" />
                                <span className="font-semibold text-copy group-hover:text-primary">Pay with PhonePe</span>
                            </PaymentButton>
                            <PaymentButton method="Paytm">
                                <PaytmLogo className="mr-4 h-6 w-auto" />
                                <span className="font-semibold text-copy group-hover:text-primary">Pay with Paytm</span>
                            </PaymentButton>
                        </div>
                    </>
                )}
                {paymentState === 'processing' && (
                    <div className="py-12 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-lg text-copy-light">Processing payment...</p>
                    </div>
                )}
                {paymentState === 'success' && (
                     <div className="py-12 flex flex-col items-center">
                        <CheckCircleIcon />
                        <h3 className="text-2xl font-bold mt-4 text-success">Payment Successful!</h3>
                        <p className="text-copy-light mt-1">Your payment has been confirmed.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

const StudentActivityFeed: React.FC = () => {
    const { currentUser, submissions, quizAttempts, assignments, quizzes } = useAppContext();
    const activity = useMemo(() => {
        if (!currentUser) return [];

        const submissionActivities = submissions
            .filter(s => s.studentId === currentUser.id)
            .map(s => ({ type: 'submission' as const, date: s.submittedAt, data: s }));

        const gradedActivities = submissions
            .filter(s => s.studentId === currentUser.id && s.gradedAt)
            .map(s => ({ type: 'grade' as const, date: s.gradedAt!, data: s }));
        
        const quizActivities = quizAttempts
            .filter(qa => qa.studentId === currentUser.id)
            .map(qa => ({ type: 'quiz' as const, date: qa.submittedAt, data: qa }));

        return [...submissionActivities, ...gradedActivities, ...quizActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [currentUser, submissions, quizAttempts]);
    
    const getActivityDetails = (item: typeof activity[0]) => {
        if (item.type === 'submission' || item.type === 'grade') {
            const assignment = assignments.find(a => a.id === item.data.assignmentId);
            const courseId = assignment?.courseId;
            const text = item.type === 'submission'
                ? `You submitted '${assignment?.title}'`
                : `Graded: ${item.data.grade}% on '${assignment?.title}'`;
            return { text, link: `/course/${courseId}` };
        }
        if (item.type === 'quiz') {
            const quiz = quizzes.find(q => q.id === item.data.quizId);
            const courseId = quiz?.courseId;
            const text = `Quiz completed: ${item.data.score.toFixed(0)}% on '${quiz?.title}'`;
            return { text, link: `/course/${courseId}` };
        }
        return { text: '', link: '' };
    }

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-copy">Recent Activity</h3>
                {activity.length > 0 ? (
                    <ul className="space-y-4">
                        {activity.map((item, index) => {
                            const details = getActivityDetails(item);
                            return (
                                <li key={index} className="flex items-start">
                                    <ClockIcon className="h-5 w-5 text-copy-light mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <Link to={details.link} className="text-copy hover:text-primary hover:underline">{details.text}</Link>
                                        <p className="text-xs text-copy-lighter">{new Date(item.date).toLocaleString()}</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                ) : <p className="text-copy-light">No recent activity to show.</p>}
            </div>
        </Card>
    );
};

const StudentCourseList: React.FC = () => {
    const { currentUser, courses } = useAppContext();
    const enrolledCourses = courses.filter(c => c.studentIds?.includes(currentUser!.id));

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-copy">My Courses</h3>
                {enrolledCourses.length > 0 ? (
                    <ul className="space-y-2">
                        {enrolledCourses.map(course => (
                            <li key={course.id} className="p-3 bg-surface/60 rounded-md hover:bg-surface transition-colors">
                                <Link to={`/course/${course.id}`} className="font-semibold text-primary hover:underline">{course.title}</Link>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-copy-light">You are not enrolled in any courses.</p>}
            </div>
        </Card>
    );
};


const TeacherProfileBody: React.FC = () => (
    <div className="space-y-8">
        <TeacherStats />
        <TeacherRecentSubmissions />
        <TeacherCourseList />
    </div>
);

const TeacherStats: React.FC = () => {
    const { currentUser, courses } = useAppContext();
    const stats = useMemo(() => {
        if (currentUser?.role !== 'Teacher') return null;
        
        const taughtCourses = courses.filter(c => c.teacherId === currentUser.id);
        const studentIds = new Set<string>();
        taughtCourses.forEach(c => {
            c.studentIds?.forEach(id => studentIds.add(id));
        });

        return { taughtCoursesCount: taughtCourses.length, totalStudents: studentIds.size };
    }, [currentUser, courses]);
    
    if (!stats) return null;

    return (
         <Card>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-copy">My Teaching Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    <div className="bg-surface/60 p-4 rounded-lg">
                        <BookOpenIcon className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-3xl font-bold mt-2 text-copy">{stats.taughtCoursesCount}</p>
                        <p className="text-copy-light">Courses Taught</p>
                    </div>
                    <div className="bg-surface/60 p-4 rounded-lg">
                        <UsersIcon className="h-8 w-8 mx-auto text-primary" />
                        <p className="text-3xl font-bold mt-2 text-copy">{stats.totalStudents}</p>
                        <p className="text-copy-light">Total Students</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const TeacherRecentSubmissions: React.FC = () => {
    const { currentUser, courses, assignments, submissions, findUserById } = useAppContext();
    const ungradedSubmissions = useMemo(() => {
        if (!currentUser) return [];
        const teacherCourseIds = courses.filter(c => c.teacherId === currentUser.id).map(c => c.id);
        const teacherAssignmentIds = assignments.filter(a => teacherCourseIds.includes(a.courseId)).map(a => a.id);
        return submissions
            .filter(s => teacherAssignmentIds.includes(s.assignmentId) && s.grade === null)
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
            .slice(0, 5);
    }, [currentUser, courses, assignments, submissions]);

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-copy">Needs Grading</h3>
                {ungradedSubmissions.length > 0 ? (
                    <ul className="space-y-4">
                        {ungradedSubmissions.map(sub => {
                            const student = findUserById(sub.studentId);
                            const assignment = assignments.find(a => a.id === sub.assignmentId);
                            const course = courses.find(c => c.id === assignment?.courseId);
                            return (
                                <li key={sub.id} className="flex items-start">
                                    <ClipboardCheckIcon className="h-5 w-5 text-copy-light mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-copy">
                                            <span className="font-semibold">{student?.name}</span> submitted <Link to={`/course/${course?.id}`} className="font-semibold text-primary hover:underline">'{assignment?.title}'</Link>
                                        </p>
                                        <p className="text-xs text-copy-lighter">{new Date(sub.submittedAt).toLocaleString()}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : <p className="text-copy-light">No submissions awaiting grading. Well done!</p>}
            </div>
        </Card>
    )
}

const TeacherCourseList: React.FC = () => {
    const { currentUser, courses } = useAppContext();
    const taughtCourses = courses.filter(c => c.teacherId === currentUser!.id);

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-copy">My Courses</h3>
                {taughtCourses.length > 0 ? (
                    <ul className="space-y-2">
                        {taughtCourses.map(course => (
                            <li key={course.id} className="p-3 bg-surface/60 rounded-md hover:bg-surface transition-colors">
                                <Link to={`/course/${course.id}`} className="font-semibold text-primary hover:underline">{course.title}</Link>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-copy-light">You have not created any courses.</p>}
            </div>
        </Card>
    );
};

export default Profile;