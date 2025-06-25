import { useEffect, useState } from 'react';
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

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">
                {t('auth.welcome')}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { key: 'sis', icon: '🎓', color: 'blue' },
              { key: 'lms', icon: '📚', color: 'green' },
              { key: 'erp', icon: '💼', color: 'purple' },
              { key: 'exams', icon: '📝', color: 'orange' },
              { key: 'analytics', icon: '📊', color: 'indigo' },
              { key: 'admin', icon: '⚙️', color: 'gray' },
              { key: 'ai', icon: '🤖', color: 'pink' },
              { key: 'bpm', icon: '🔄', color: 'yellow' },
            ].map((module) => (
              <div
                key={module.key}
                onClick={() => navigateToModule(module.key)}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl mb-2">{module.icon}</div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t(`navigation.${module.key}`)}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {loading ? (
                      t('common.loading')
                    ) : (
                      <div>
                        {module.key === 'sis' && (
                          <span className="text-blue-600 font-semibold">
                            {dashboardData.totalStudents} {t('sis.students')}
                          </span>
                        )}
                        {module.key === 'lms' && (
                          <span className="text-green-600 font-semibold">
                            {dashboardData.activeCourses} {t('lms.courses')}
                          </span>
                        )}
                        {module.key === 'erp' && (
                          <span className="text-purple-600 font-semibold">
                            {dashboardData.totalEmployees} {t('erp.employees')}
                          </span>
                        )}
                        {!['sis', 'lms', 'erp'].includes(module.key) && (
                          <span className={`text-${module.color}-600 font-semibold`}>
                            {t('common.clickToView')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>



          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {t('common.dashboard')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">
                  {t('dashboard.totalStudents')}
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {loading ? t('common.loading') : dashboardData.totalStudents.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 mb-1">
                  {t('dashboard.activeCourses')}
                </p>
                <p className="text-2xl font-bold text-green-800">
                  {loading ? t('common.loading') : dashboardData.activeCourses.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">
                  {t('dashboard.totalEmployees')}
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {loading ? t('common.loading') : dashboardData.totalEmployees.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">
                  {t('dashboard.attendanceRate')}
                </p>
                <p className="text-2xl font-bold text-orange-800">
                  {loading ? t('common.loading') : `${dashboardData.attendanceRate}%`}
                </p>
              </div>
            </div>
            
            {!loading && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {t('common.currentDate')}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatDate(currentDate, language)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {t('common.currentTime')}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatTime(currentDate, language)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {t('common.systemStatus')}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    {t('common.operational')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
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
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
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
      </div>
    </Router>
  );
}

export default App;
