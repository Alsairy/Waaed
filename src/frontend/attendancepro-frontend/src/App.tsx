import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import TwoFactorPage from './pages/auth/TwoFactorPage'
import DashboardLayout from './components/layouts/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard'
import AttendancePage from './pages/attendance/AttendancePage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import UsersPage from './pages/users/UsersPage'
import ProfilePage from './pages/profile/ProfilePage'
import SettingsPage from './pages/settings/SettingsPage'
import KioskLoginPage from './pages/kiosk/KioskLoginPage'
import KioskAttendancePage from './pages/kiosk/KioskAttendancePage'
import ShiftSchedulingPage from './pages/scheduling/ShiftSchedulingPage'
import VoiceManagementPage from './pages/voice/VoiceManagementPage'
import WorkflowDesignerPage from './pages/workflow/WorkflowDesignerPage'
import WorkflowMonitoringPage from './pages/workflow/WorkflowMonitoringPage'
import ReportsPage from './pages/reports/ReportsPage'
import WebhooksManagementPage from './pages/webhooks/WebhooksManagementPage'
import CompliancePage from './pages/compliance/CompliancePage'
import TenantManagementPage from './pages/tenant/TenantManagementPage'
import './App.css'

const PERSONA = import.meta.env.VITE_USER_PERSONA || 'admin'

const getPersonaRoutes = () => {
  const getDashboardComponent = () => {
    switch (PERSONA) {
      case 'admin':
        return <AdminDashboard />
      case 'manager':
        return <ManagerDashboard />
      case 'employee':
        return <EmployeeDashboard />
      default:
        return <Dashboard />
    }
  }

  const baseRoutes = [
    { path: 'dashboard', element: getDashboardComponent(), roles: ['admin', 'manager', 'user'] },
    { path: 'attendance', element: <AttendancePage />, roles: ['admin', 'manager', 'user'] },
    { path: 'profile', element: <ProfilePage />, roles: ['admin', 'manager', 'user'] },
    { path: 'settings', element: <SettingsPage />, roles: ['admin', 'manager', 'user'] }
  ]

  const adminRoutes = [
    { path: 'analytics', element: <AnalyticsPage />, roles: ['admin', 'manager'] },
    { path: 'users', element: <UsersPage />, roles: ['admin'] },
    { path: 'reports', element: <ReportsPage />, roles: ['admin', 'manager'] },
    { path: 'webhooks', element: <WebhooksManagementPage />, roles: ['admin'] },
    { path: 'compliance', element: <CompliancePage />, roles: ['admin'] },
    { path: 'tenants', element: <TenantManagementPage />, roles: ['admin'] },
    { path: 'workflow/designer', element: <WorkflowDesignerPage />, roles: ['admin'] },
    { path: 'workflow/monitoring', element: <WorkflowMonitoringPage />, roles: ['admin', 'manager'] },
    { path: 'scheduling', element: <ShiftSchedulingPage />, roles: ['admin', 'manager'] },
    { path: 'voice-management', element: <VoiceManagementPage />, roles: ['admin'] }
  ]

  switch (PERSONA) {
    case 'admin':
      return [...baseRoutes, ...adminRoutes]
    case 'manager':
      return [...baseRoutes, 
        { path: 'analytics', element: <AnalyticsPage />, roles: ['admin', 'manager'] },
        { path: 'reports', element: <ReportsPage />, roles: ['admin', 'manager'] },
        { path: 'workflow/monitoring', element: <WorkflowMonitoringPage />, roles: ['admin', 'manager'] },
        { path: 'scheduling', element: <ShiftSchedulingPage />, roles: ['admin', 'manager'] }
      ]
    case 'employee':
    default:
      return baseRoutes
  }
}

function App() {
  const personaRoutes = getPersonaRoutes()
  
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey={`hudur-${PERSONA}-ui-theme`}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/two-factor" element={<TwoFactorPage />} />
              
              {/* Kiosk routes */}
              <Route path="/kiosk" element={<KioskLoginPage />} />
              <Route path="/kiosk/attendance" element={<KioskAttendancePage />} />
              
              {/* Protected routes - persona-specific */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                {personaRoutes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
            <Toaster position="top-right" />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
