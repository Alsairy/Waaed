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
  Activity
} from 'lucide-react';
import { StudentManagement } from './components/sis/StudentManagement';
import CourseManagement from './components/lms/CourseManagement';
import EmployeeManagement from './components/erp/EmployeeManagement';
import ExamManagement from './components/exams/ExamManagement';
import AnalyticsManagement from './components/analytics/AnalyticsManagement';
import AdminManagement from './components/admin/AdminManagement';
import AIManagement from './components/ai/AIManagement';
import WorkflowManagement from './components/bpm/WorkflowManagement';
import Layout from './components/layout/Layout';
import './styles/main.scss';

function Dashboard() {
  const { t } = useTranslation();
  const { language, isRTL } = useSelector((state: RootState) => state.ui);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalEmployees: 0,
    attendanceRate: 0
  });
  const navigate = useNavigate();

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
        attendanceRate: attendanceMetric ? attendanceMetric.value : 94.5
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

  const moduleCards = [
    { 
      key: 'sis', 
      icon: GraduationCap, 
      color: 'primary', 
      description: t('sis.description'),
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      key: 'lms', 
      icon: BookOpen, 
      color: 'success', 
      description: t('lms.description'),
      gradient: 'from-green-500 to-green-600'
    },
    { 
      key: 'erp', 
      icon: Users, 
      color: 'secondary', 
      description: t('erp.description'),
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      key: 'exams', 
      icon: FileText, 
      color: 'warning', 
      description: t('exams.description'),
      gradient: 'from-orange-500 to-orange-600'
    },
    { 
      key: 'analytics', 
      icon: BarChart3, 
      color: 'info', 
      description: t('analytics.description'),
      gradient: 'from-indigo-500 to-indigo-600'
    },
    { 
      key: 'admin', 
      icon: Settings, 
      color: 'secondary', 
      description: t('admin.description'),
      gradient: 'from-gray-500 to-gray-600'
    },
    { 
      key: 'ai', 
      icon: Bot, 
      color: 'primary', 
      description: t('ai.description'),
      gradient: 'from-pink-500 to-pink-600'
    },
    { 
      key: 'bpm', 
      icon: Workflow, 
      color: 'warning', 
      description: t('bpm.description'),
      gradient: 'from-yellow-500 to-yellow-600'
    },
  ];

  const statCards = [
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
  ];

  return (
    <div className="content-area">
      {/* Enhanced Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <h1 className="page-title">{t('common.dashboard')}</h1>
            <p className="page-subtitle">{t('dashboard.welcomeMessage')}</p>
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

      {/* Enhanced Statistics Cards */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('dashboard.overview')}</h2>
          <p className="section-subtitle">{t('dashboard.keyMetrics')}</p>
        </div>
        <div className="card-grid grid-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.key} className={`stat-card stat-card-${stat.color}`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="stat-card-header">
                  <div className="stat-icon">
                    <IconComponent size={24} />
                  </div>
                  <div className={`stat-trend ${stat.trend === 'up' ? 'positive' : 'negative'}`}>
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

      {/* Enhanced Module Navigation Cards */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('navigation.modules')}</h2>
          <p className="section-subtitle">{t('navigation.selectModuleDescription')}</p>
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
                        {module.key === 'lms' && `${dashboardData.activeCourses} ${t('lms.courses')}`}
                        {module.key === 'erp' && `${dashboardData.totalEmployees} ${t('erp.employees')}`}
                        {!['sis', 'lms', 'erp'].includes(module.key) && t('common.clickToExplore')}
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
            </Routes>
          </main>
        </Layout>
      </Router>
    </AccessibilityProvider>
  );
}

export default App;
