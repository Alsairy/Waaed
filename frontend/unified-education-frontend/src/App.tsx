import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { formatDate, formatTime } from './utils/formatters';
import { sisService, lmsService, erpService, analyticsService } from './services';
import { Metric, Course } from './types/api';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Bot, 
  Workflow,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Activity,
  DollarSign,
  Library,
  Package,
  Vote,
  PenTool,
  CheckSquare
} from 'lucide-react';
import { StudentManagement } from './components/sis/StudentManagement';
import CourseManagement from './components/lms/CourseManagement';
import EmployeeManagement from './components/erp/EmployeeManagement';
import ExamManagement from './components/exams/ExamManagement';
import AnalyticsManagement from './components/analytics/AnalyticsManagement';
import AdminManagement from './components/admin/AdminManagement';
import AIManagement from './components/ai/AIManagement';
import WorkflowManagement from './components/bpm/WorkflowManagement';
import FeeManagement from './components/finance/FeeManagement';
import HREmployeeManagement from './components/hr/EmployeeManagement';
import BookCatalog from './components/library/BookCatalog';
import StoreManagement from './components/inventory/StoreManagement';
import PollCreation from './components/polls/PollCreation';
import BlogPostList from './components/blogs/BlogPostList';
import TaskList from './components/tasks/TaskList';
import Layout from './components/layout/Layout';
import './styles/main.scss';

const dashboardStyles = `
  .user-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.5rem;
  }

  .user-name {
    font-weight: 600;
    color: var(--waaed-primary-blue);
    font-size: 1.1rem;
  }

  .user-role {
    font-size: 0.875rem;
    color: var(--waaed-primary-green);
    text-transform: capitalize;
    font-weight: 500;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .badge-primary {
    background-color: rgba(0, 95, 150, 0.1);
    color: var(--waaed-primary-blue);
  }

  .badge-success {
    background-color: rgba(54, 186, 145, 0.1);
    color: var(--waaed-primary-green);
  }

  .badge-warning {
    background-color: rgba(248, 196, 64, 0.1);
    color: var(--warning-color);
  }

  .stat-trend.neutral {
    color: var(--text-muted);
    background: rgba(209, 209, 209, 0.1);
  }

  @media (max-width: 768px) {
    .card-grid.grid-4 {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .card-grid.grid-3 {
      grid-template-columns: 1fr;
    }
    
    .card-grid.grid-2 {
      grid-template-columns: 1fr;
    }
  }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = dashboardStyles;
  document.head.appendChild(styleElement);
}

function Dashboard() {
  const { t } = useTranslation();
  const { language, isRTL } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalEmployees: 0,
    attendanceRate: 0,
    myAssignments: 0,
    upcomingClasses: 0,
    pendingTasks: 0,
    myChildren: 0,
    pendingPayments: 0,
    systemAlerts: 0
  });
  const navigate = useNavigate();

  const getUserRole = () => {
    return user?.role?.toLowerCase() || 'student';
  };

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.className = `font-${language === 'ar' ? 'arabic' : 'english'}`;
  }, [language, isRTL]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [studentsData, coursesData, employeesData, metricsData] = await Promise.all([
        sisService.getStudents(),
        lmsService.getCourses(),
        erpService.getEmployees(),
        analyticsService.getMetrics()
      ]);

      const attendanceMetric = metricsData.find((m: Metric) => m.name === 'Average Attendance Rate');
      
      setDashboardData({
        totalStudents: studentsData.length,
        activeCourses: coursesData.filter((c: Course) => c.status === 'Published').length,
        totalEmployees: employeesData.length,
        attendanceRate: attendanceMetric ? attendanceMetric.value : 94.5,
        myAssignments: 8,
        upcomingClasses: 5,
        pendingTasks: 12,
        myChildren: 2,
        pendingPayments: 3,
        systemAlerts: 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToModule = (moduleKey: string) => {
    navigate(`/${moduleKey}`);
  };

  const currentDate = new Date();

  const getModuleCardsForRole = (role: string) => {
    const allModules = [
      { 
        key: 'sis', 
        icon: GraduationCap, 
        color: 'primary', 
        description: t('sis.description'),
        gradient: 'from-blue-500 to-blue-600',
        roles: ['admin', 'teacher']
      },
      { 
        key: 'lms', 
        icon: BookOpen, 
        color: 'success', 
        description: t('lms.description'),
        gradient: 'from-green-500 to-green-600',
        roles: ['admin', 'teacher', 'student']
      },
      { 
        key: 'erp', 
        icon: Users, 
        color: 'secondary', 
        description: t('erp.description'),
        gradient: 'from-purple-500 to-purple-600',
        roles: ['admin']
      },
      { 
        key: 'exams', 
        icon: FileText, 
        color: 'warning', 
        description: t('exams.description'),
        gradient: 'from-orange-500 to-orange-600',
        roles: ['admin', 'teacher', 'student']
      },
      { 
        key: 'analytics', 
        icon: BarChart3, 
        color: 'info', 
        description: t('analytics.description'),
        gradient: 'from-indigo-500 to-indigo-600',
        roles: ['admin', 'teacher']
      },
      { 
        key: 'admin', 
        icon: Settings, 
        color: 'secondary', 
        description: t('admin.description'),
        gradient: 'from-gray-500 to-gray-600',
        roles: ['admin']
      },
      { 
        key: 'ai', 
        icon: Bot, 
        color: 'primary', 
        description: t('ai.description'),
        gradient: 'from-pink-500 to-pink-600',
        roles: ['admin', 'teacher', 'student']
      },
      { 
        key: 'bpm', 
        icon: Workflow, 
        color: 'warning', 
        description: t('bpm.description'),
        gradient: 'from-yellow-500 to-yellow-600',
        roles: ['admin', 'teacher']
      },
      { 
        key: 'finance', 
        icon: DollarSign, 
        color: 'success', 
        description: t('finance.description'),
        gradient: 'from-emerald-500 to-emerald-600',
        roles: ['admin', 'parent']
      },
      { 
        key: 'hr', 
        icon: Users, 
        color: 'info', 
        description: t('hr.description'),
        gradient: 'from-blue-500 to-blue-600',
        roles: ['admin']
      },
      { 
        key: 'library', 
        icon: Library, 
        color: 'secondary', 
        description: t('library.description'),
        gradient: 'from-violet-500 to-violet-600',
        roles: ['admin', 'teacher', 'student']
      },
      { 
        key: 'inventory', 
        icon: Package, 
        color: 'warning', 
        description: t('inventory.description'),
        gradient: 'from-amber-500 to-amber-600',
        roles: ['admin']
      },
      { 
        key: 'polls', 
        icon: Vote, 
        color: 'primary', 
        description: t('polls.description'),
        gradient: 'from-cyan-500 to-cyan-600',
        roles: ['admin', 'teacher', 'student', 'parent']
      },
      { 
        key: 'blogs', 
        icon: PenTool, 
        color: 'info', 
        description: t('blogs.description'),
        gradient: 'from-rose-500 to-rose-600',
        roles: ['admin', 'teacher', 'student']
      },
      { 
        key: 'tasks', 
        icon: CheckSquare, 
        color: 'success', 
        description: t('tasks.description'),
        gradient: 'from-teal-500 to-teal-600',
        roles: ['admin', 'teacher', 'student']
      },
    ];

    return allModules.filter(module => module.roles.includes(role));
  };

  const getStatCardsForRole = (role: string) => {
    const baseCards = {
      admin: [
        {
          key: 'totalStudents',
          icon: GraduationCap,
          value: dashboardData.totalStudents,
          label: t('dashboard.totalStudents'),
          color: 'primary',
          change: '+12%',
          trend: 'up',
          description: t('dashboard.studentsGrowth')
        },
        {
          key: 'activeCourses',
          icon: BookOpen,
          value: dashboardData.activeCourses,
          label: t('dashboard.activeCourses'),
          color: 'success',
          change: '+8%',
          trend: 'up',
          description: t('dashboard.coursesActive')
        },
        {
          key: 'totalEmployees',
          icon: Users,
          value: dashboardData.totalEmployees,
          label: t('dashboard.totalEmployees'),
          color: 'secondary',
          change: '+3%',
          trend: 'up',
          description: t('dashboard.staffMembers')
        },
        {
          key: 'attendanceRate',
          icon: Activity,
          value: `${dashboardData.attendanceRate}%`,
          label: t('dashboard.attendanceRate'),
          color: 'warning',
          change: '+2%',
          trend: 'up',
          description: t('dashboard.attendanceImprovement')
        }
      ],
      teacher: [
        {
          key: 'myClasses',
          icon: BookOpen,
          value: dashboardData.activeCourses,
          label: t('dashboard.myClasses'),
          color: 'primary',
          change: '+5%',
          trend: 'up',
          description: t('dashboard.activeClasses')
        },
        {
          key: 'myStudents',
          icon: GraduationCap,
          value: dashboardData.totalStudents,
          label: t('dashboard.myStudents'),
          color: 'success',
          change: '+8%',
          trend: 'up',
          description: t('dashboard.enrolledStudents')
        },
        {
          key: 'pendingTasks',
          icon: CheckSquare,
          value: dashboardData.pendingTasks || 12,
          label: t('dashboard.pendingTasks'),
          color: 'warning',
          change: '-3%',
          trend: 'down',
          description: t('dashboard.tasksToComplete')
        },
        {
          key: 'attendanceRate',
          icon: Activity,
          value: `${dashboardData.attendanceRate}%`,
          label: t('dashboard.classAttendance'),
          color: 'info',
          change: '+2%',
          trend: 'up',
          description: t('dashboard.studentAttendance')
        }
      ],
      student: [
        {
          key: 'upcomingClasses',
          icon: Calendar,
          value: dashboardData.upcomingClasses || 5,
          label: t('dashboard.upcomingClasses'),
          color: 'primary',
          change: '+2',
          trend: 'up',
          description: t('dashboard.todaysSchedule')
        },
        {
          key: 'myAssignments',
          icon: FileText,
          value: dashboardData.myAssignments || 8,
          label: t('dashboard.myAssignments'),
          color: 'warning',
          change: '+3',
          trend: 'up',
          description: t('dashboard.pendingAssignments')
        },
        {
          key: 'myGrades',
          icon: TrendingUp,
          value: '85%',
          label: t('dashboard.averageGrade'),
          color: 'success',
          change: '+5%',
          trend: 'up',
          description: t('dashboard.academicProgress')
        },
        {
          key: 'attendanceRate',
          icon: Activity,
          value: `${dashboardData.attendanceRate}%`,
          label: t('dashboard.myAttendance'),
          color: 'info',
          change: '+2%',
          trend: 'up',
          description: t('dashboard.attendanceRecord')
        }
      ],
      parent: [
        {
          key: 'myChildren',
          icon: Users,
          value: dashboardData.myChildren || 2,
          label: t('dashboard.myChildren'),
          color: 'primary',
          change: '0',
          trend: 'neutral',
          description: t('dashboard.enrolledChildren')
        },
        {
          key: 'pendingPayments',
          icon: DollarSign,
          value: dashboardData.pendingPayments || 3,
          label: t('dashboard.pendingPayments'),
          color: 'warning',
          change: '-1',
          trend: 'down',
          description: t('dashboard.outstandingFees')
        },
        {
          key: 'childrenAttendance',
          icon: Activity,
          value: `${dashboardData.attendanceRate}%`,
          label: t('dashboard.childrenAttendance'),
          color: 'success',
          change: '+3%',
          trend: 'up',
          description: t('dashboard.overallAttendance')
        },
        {
          key: 'upcomingEvents',
          icon: Calendar,
          value: 4,
          label: t('dashboard.upcomingEvents'),
          color: 'info',
          change: '+1',
          trend: 'up',
          description: t('dashboard.schoolEvents')
        }
      ]
    };

    return baseCards[role as keyof typeof baseCards] || baseCards.student;
  };

  const userRole = getUserRole();
  const moduleCards = getModuleCardsForRole(userRole);
  const statCards = getStatCardsForRole(userRole);

  const getRoleSpecificWelcome = (role: string) => {
    const welcomeMessages = {
      admin: t('dashboard.welcomeAdmin'),
      teacher: t('dashboard.welcomeTeacher'),
      student: t('dashboard.welcomeStudent'),
      parent: t('dashboard.welcomeParent')
    };
    return welcomeMessages[role as keyof typeof welcomeMessages] || t('dashboard.welcomeMessage');
  };

  const getRoleSpecificTitle = (role: string) => {
    const titles = {
      admin: t('dashboard.adminDashboard'),
      teacher: t('dashboard.teacherDashboard'),
      student: t('dashboard.studentDashboard'),
      parent: t('dashboard.parentDashboard')
    };
    return titles[role as keyof typeof titles] || t('common.dashboard');
  };

  return (
    <div className="content-area">
      {/* Enhanced Role-Specific Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <h1 className="page-title">{getRoleSpecificTitle(userRole)}</h1>
            <p className="page-subtitle">{getRoleSpecificWelcome(userRole)}</p>
            {user && (
              <div className="user-info">
                <span className="user-name">{user.email || 'User'}</span>
                <span className="user-role">{t(`roles.${userRole}`)}</span>
              </div>
            )}
          </div>
          <div className="page-header-actions">
            <div className="header-stats">
              <div className="header-stat">
                <Calendar size={16} />
                <span>{formatDate(currentDate, language)}</span>
              </div>
              <div className="header-stat">
                <Clock size={16} />
                <span>{formatTime(currentDate, language)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Role-Specific Statistics Cards */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('dashboard.overview')}</h2>
          <p className="section-subtitle">{t(`dashboard.${userRole}Metrics`)}</p>
        </div>
        <div className="card-grid grid-4">
          {statCards.map((stat: any, index: number) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.key} className={`stat-card stat-card-${stat.color}`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-card-header">
                  <div className="stat-icon">
                    <IconComponent size={24} />
                  </div>
                  <div className={`stat-trend ${stat.trend === 'up' ? 'positive' : stat.trend === 'down' ? 'negative' : 'neutral'}`}>
                    <TrendingUp size={16} />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {loading ? (
                      <div className="stat-skeleton"></div>
                    ) : (
                      typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value
                    )}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-description">{stat.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Role-Specific Module Navigation Cards */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('navigation.modules')}</h2>
          <p className="section-subtitle">{t(`navigation.${userRole}ModulesDescription`)}</p>
        </div>
        <div className="card-grid grid-4">
          {moduleCards.map((module, index) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.key}
                onClick={() => navigateToModule(module.key)}
                className="module-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="module-card-header">
                  <div className={`module-icon bg-gradient-to-br ${module.gradient}`}>
                    <IconComponent size={28} color="white" />
                  </div>
                </div>
                <div className="module-card-body">
                  <h3 className="module-title">
                    {t(`navigation.${module.key}`)}
                  </h3>
                  <p className="module-description">
                    {module.description}
                  </p>
                  <div className="module-stats">
                    {loading ? (
                      <div className="module-skeleton"></div>
                    ) : (
                      <div className="module-stat-value">
                        {module.key === 'sis' && `${dashboardData.totalStudents} ${t('sis.students')}`}
                        {module.key === 'lms' && userRole === 'student' && `${dashboardData.activeCourses} ${t('lms.enrolledCourses')}`}
                        {module.key === 'lms' && userRole === 'teacher' && `${dashboardData.activeCourses} ${t('lms.teachingCourses')}`}
                        {module.key === 'lms' && userRole === 'admin' && `${dashboardData.activeCourses} ${t('lms.totalCourses')}`}
                        {module.key === 'erp' && `${dashboardData.totalEmployees} ${t('erp.employees')}`}
                        {module.key === 'finance' && userRole === 'parent' && `${dashboardData.pendingPayments || 0} ${t('finance.pendingPayments')}`}
                        {module.key === 'tasks' && `${dashboardData.pendingTasks || 0} ${t('tasks.pending')}`}
                        {!['sis', 'lms', 'erp', 'finance', 'tasks'].includes(module.key) && t('common.clickToExplore')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="module-card-footer">
                  <div className="module-action">
                    <span>{t('common.openModule')}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Specific Quick Actions Section */}
      {userRole === 'teacher' && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.quickActions')}</h2>
            <p className="section-subtitle">{t('dashboard.teacherQuickActions')}</p>
          </div>
          <div className="card-grid grid-3">
            <div className="card card-hover card-primary">
              <div className="card-body">
                <h4>{t('dashboard.takeAttendance')}</h4>
                <p>{t('dashboard.markStudentAttendance')}</p>
              </div>
            </div>
            <div className="card card-hover card-success">
              <div className="card-body">
                <h4>{t('dashboard.gradeAssignments')}</h4>
                <p>{t('dashboard.reviewSubmissions')}</p>
              </div>
            </div>
            <div className="card card-hover card-warning">
              <div className="card-body">
                <h4>{t('dashboard.createAnnouncement')}</h4>
                <p>{t('dashboard.notifyStudents')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {userRole === 'student' && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.todaysSchedule')}</h2>
            <p className="section-subtitle">{t('dashboard.upcomingClasses')}</p>
          </div>
          <div className="card-grid grid-2">
            <div className="card card-hover card-primary">
              <div className="card-body">
                <h4>{t('dashboard.nextClass')}</h4>
                <p>{t('dashboard.mathematics')} - 10:00 AM</p>
                <span className="badge badge-primary">{t('dashboard.inProgress')}</span>
              </div>
            </div>
            <div className="card card-hover card-success">
              <div className="card-body">
                <h4>{t('dashboard.recentAssignment')}</h4>
                <p>{t('dashboard.physicsHomework')}</p>
                <span className="badge badge-warning">{t('dashboard.dueToday')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {userRole === 'parent' && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.childrenOverview')}</h2>
            <p className="section-subtitle">{t('dashboard.academicProgress')}</p>
          </div>
          <div className="card-grid grid-2">
            <div className="card card-hover card-primary">
              <div className="card-body">
                <h4>{t('dashboard.childName1')}</h4>
                <p>{t('dashboard.grade')} 10 - {t('dashboard.attendance')}: 95%</p>
                <span className="badge badge-success">{t('dashboard.excellent')}</span>
              </div>
            </div>
            <div className="card card-hover card-success">
              <div className="card-body">
                <h4>{t('dashboard.childName2')}</h4>
                <p>{t('dashboard.grade')} 8 - {t('dashboard.attendance')}: 92%</p>
                <span className="badge badge-success">{t('dashboard.good')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced System Status */}
      {!loading && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.systemStatus')}</h2>
            <p className="section-subtitle">{t('dashboard.systemHealth')}</p>
          </div>
          <div className="card-grid grid-3">
            <div className="status-card">
              <div className="status-card-header">
                <div className="status-icon status-icon-info">
                  <Calendar size={24} />
                </div>
                <div className="status-indicator status-active"></div>
              </div>
              <div className="status-card-body">
                <h4 className="status-title">{t('common.currentDate')}</h4>
                <p className="status-value">{formatDate(currentDate, language)}</p>
                <p className="status-description">{t('dashboard.academicCalendar')}</p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-card-header">
                <div className="status-icon status-icon-warning">
                  <Clock size={24} />
                </div>
                <div className="status-indicator status-active"></div>
              </div>
              <div className="status-card-body">
                <h4 className="status-title">{t('common.currentTime')}</h4>
                <p className="status-value">{formatTime(currentDate, language)}</p>
                <p className="status-description">{t('dashboard.systemTime')}</p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-card-header">
                <div className="status-icon status-icon-success">
                  <CheckCircle size={24} />
                </div>
                <div className="status-indicator status-active"></div>
              </div>
              <div className="status-card-body">
                <h4 className="status-title">{t('common.systemStatus')}</h4>
                <p className="status-value status-operational">{t('common.operational')}</p>
                <p className="status-description">{t('dashboard.allSystemsRunning')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const { language, isRTL } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.className = `font-${language === 'ar' ? 'arabic' : 'english'}`;
  }, [language, isRTL]);

  return (
    <AccessibilityProvider>
      <Router>
        <Layout>
          <main id="main-content" tabIndex={-1}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sis" element={<StudentManagement />} />
              <Route path="/lms" element={<CourseManagement />} />
              <Route path="/erp" element={<EmployeeManagement />} />
              <Route path="/exams" element={<ExamManagement />} />
              <Route path="/analytics" element={<AnalyticsManagement />} />
              <Route path="/admin" element={<AdminManagement />} />
              <Route path="/ai" element={<AIManagement />} />
              <Route path="/bpm" element={<WorkflowManagement />} />
              <Route path="/finance" element={<FeeManagement />} />
              <Route path="/hr" element={<HREmployeeManagement />} />
              <Route path="/library" element={<BookCatalog />} />
              <Route path="/inventory" element={<StoreManagement />} />
              <Route path="/polls" element={<PollCreation />} />
              <Route path="/blogs" element={<BlogPostList />} />
              <Route path="/tasks" element={<TaskList />} />
            </Routes>
          </main>
        </Layout>
      </Router>
    </AccessibilityProvider>
  );
}

export default App;
