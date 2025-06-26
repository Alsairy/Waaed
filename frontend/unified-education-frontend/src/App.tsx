import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { formatDate, formatTime } from './utils/formatters';
import { sisService, lmsService, erpService, analyticsService } from './services';
import { Metric, Course } from './types/api';
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
    { key: 'sis', icon: '🎓', color: 'primary', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { key: 'lms', icon: '📚', color: 'success', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { key: 'erp', icon: '💼', color: 'secondary', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { key: 'exams', icon: '📝', color: 'warning', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
    { key: 'analytics', icon: '📊', color: 'info', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
    { key: 'admin', icon: '⚙️', color: 'secondary', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
    { key: 'ai', icon: '🤖', color: 'primary', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
    { key: 'bpm', icon: '🔄', color: 'warning', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
  ];

  const statCards = [
    {
      key: 'totalStudents',
      icon: '🎓',
      value: dashboardData.totalStudents,
      label: t('dashboard.totalStudents'),
      color: 'primary',
      change: '+12%'
    },
    {
      key: 'activeCourses',
      icon: '📚',
      value: dashboardData.activeCourses,
      label: t('dashboard.activeCourses'),
      color: 'success',
      change: '+8%'
    },
    {
      key: 'totalEmployees',
      icon: '💼',
      value: dashboardData.totalEmployees,
      label: t('dashboard.totalEmployees'),
      color: 'secondary',
      change: '+3%'
    },
    {
      key: 'attendanceRate',
      icon: '📊',
      value: `${dashboardData.attendanceRate}%`,
      label: t('dashboard.attendanceRate'),
      color: 'warning',
      change: '+2%'
    }
  ];

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('common.dashboard')}</h1>
        <p className="page-subtitle">{t('auth.welcome')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('dashboard.overview')}</h2>
        </div>
        <div className="card-grid grid-4">
          {statCards.map((stat) => (
            <div key={stat.key} className={`stat-card`}>
              <div className={`stat-icon stat-icon-${stat.color}`}>
                {stat.icon}
              </div>
              <div className="stat-value">
                {loading ? t('common.loading') : typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-change positive">{stat.change}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('navigation.modules')}</h2>
          <p className="text-sm text-gray-600">{t('navigation.selectModule')}</p>
        </div>
        <div className="card-grid grid-4">
          {moduleCards.map((module) => (
            <div
              key={module.key}
              onClick={() => navigateToModule(module.key)}
              className="card card-hover cursor-pointer"
            >
              <div className="card-body text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${module.bgColor} mb-4`}>
                  <span className="text-2xl">{module.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(`navigation.${module.key}`)}
                </h3>
                <div className={`text-sm ${module.textColor} font-medium`}>
                  {loading ? (
                    t('common.loading')
                  ) : (
                    <div>
                      {module.key === 'sis' && `${dashboardData.totalStudents} ${t('sis.students')}`}
                      {module.key === 'lms' && `${dashboardData.activeCourses} ${t('lms.courses')}`}
                      {module.key === 'erp' && `${dashboardData.totalEmployees} ${t('erp.employees')}`}
                      {!['sis', 'lms', 'erp'].includes(module.key) && t('common.clickToView')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Information */}
      {!loading && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">{t('dashboard.systemInfo')}</h2>
          </div>
          <div className="card-grid grid-3">
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl mb-3">📅</div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('common.currentDate')}</h4>
                <p className="text-gray-600">{formatDate(currentDate, language)}</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl mb-3">🕒</div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('common.currentTime')}</h4>
                <p className="text-gray-600">{formatTime(currentDate, language)}</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="text-2xl mb-3">✅</div>
                <h4 className="font-semibold text-gray-900 mb-1">{t('common.systemStatus')}</h4>
                <p className="text-green-600 font-medium">{t('common.operational')}</p>
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
    <Router>
      <Layout>
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
      </Layout>
    </Router>
  );
}

export default App;
