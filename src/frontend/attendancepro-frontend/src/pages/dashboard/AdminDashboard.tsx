import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Settings,
  Bell,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  Building2,
  Shield,
  Database,
  Server,
  AlertTriangle,
  DollarSign,
  FileText
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import analyticsService from '../../services/analyticsService'
import notificationService from '../../services/notificationService'
import realTimeService from '../../services/realTimeService'
import WorkforceHealthDashboard from '../../components/analytics/WorkforceHealthDashboard'
import ProductivityMetricsVisualization from '../../components/analytics/ProductivityMetricsVisualization'
import NotificationCenter from '../../components/notifications/NotificationCenter'

interface AdminStats {
  totalEmployees: number
  presentToday: number
  absentToday: number
  lateToday: number
  attendanceRate: number
  totalTenants: number
  activeTenants: number
  systemHealth: number
  monthlyRevenue: number
  newUsersThisMonth: number
  criticalAlerts: number
}

interface SystemAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  service: string
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0,
    totalTenants: 0,
    activeTenants: 0,
    systemHealth: 0,
    monthlyRevenue: 0,
    newUsersThisMonth: 0,
    criticalAlerts: 0,
  })
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [realTimeUpdates, setRealTimeUpdates] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting' | 'error'>('disconnected')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadAdminData()
    loadNotificationCount()
    setupRealTimeConnections()
    
    const interval = setInterval(() => {
      if (realTimeUpdates) {
        loadAdminData()
        loadNotificationCount()
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      cleanupRealTimeConnections()
    }
  }, [realTimeUpdates])

  const setupRealTimeConnections = () => {
    realTimeService.on('connection-status', (status) => {
      setConnectionStatus(status.status)
      if (status.status === 'connected') {
        toast.success('Real-time connection established')
      } else if (status.status === 'disconnected') {
        toast.error('Real-time connection lost')
      } else if (status.status === 'reconnecting') {
        toast.info('Reconnecting to real-time service...')
      }
    })

    realTimeService.on('system-alert', (alert) => {
      setSystemAlerts(prev => [alert, ...prev.slice(0, 9)])
      if (alert.type === 'critical') {
        toast.error(`Critical Alert: ${alert.message}`)
      }
    })

    realTimeService.on('admin-update', () => {
      if (realTimeUpdates) {
        loadAdminData()
      }
    })
  }

  const cleanupRealTimeConnections = () => {
    realTimeService.off('connection-status', () => {})
    realTimeService.off('system-alert', () => {})
    realTimeService.off('admin-update', () => {})
  }

  const loadAdminData = async () => {
    try {
      setIsLoading(true)
      const overview = await analyticsService.getOverview()
      
      setAdminStats({
        totalEmployees: overview.totalEmployees || 1250,
        presentToday: overview.presentToday || 1142,
        absentToday: overview.absentToday || 85,
        lateToday: overview.lateToday || 23,
        attendanceRate: overview.attendanceRate || 91.2,
        totalTenants: 45,
        activeTenants: 42,
        systemHealth: 98.5,
        monthlyRevenue: 125000,
        newUsersThisMonth: 156,
        criticalAlerts: 2,
      })

      setSystemAlerts([
        {
          id: '1',
          type: 'critical',
          message: 'Database connection pool reaching capacity',
          timestamp: new Date().toISOString(),
          service: 'Database'
        },
        {
          id: '2',
          type: 'warning',
          message: 'High memory usage on Analytics service',
          timestamp: new Date().toISOString(),
          service: 'Analytics'
        },
        {
          id: '3',
          type: 'info',
          message: 'Scheduled maintenance window in 2 hours',
          timestamp: new Date().toISOString(),
          service: 'System'
        }
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin dashboard data')
      setAdminStats({
        totalEmployees: 1250,
        presentToday: 1142,
        absentToday: 85,
        lateToday: 23,
        attendanceRate: 91.2,
        totalTenants: 45,
        activeTenants: 42,
        systemHealth: 98.5,
        monthlyRevenue: 125000,
        newUsersThisMonth: 156,
        criticalAlerts: 2,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadNotificationCount = async () => {
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadNotifications(count)
    } catch (error) {
      console.error('Error loading notification count:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
    }
  }

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return <Badge variant="destructive" className="text-xs">Critical</Badge>
      case 'warning':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Warning</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Info</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and enterprise management for {user?.firstName}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${realTimeUpdates ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-muted-foreground">
                {realTimeUpdates ? 'Live Updates' : 'Updates Paused'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : connectionStatus === 'reconnecting' ? (
                <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground capitalize">{connectionStatus}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            >
              <Activity className="mr-1 h-3 w-3" />
              {realTimeUpdates ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </Badge>
            )}
          </Button>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</p>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">System Notifications</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <NotificationCenter />
          </CardContent>
        </Card>
      )}

      {/* Admin Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adminStats.activeTenants}</div>
            <p className="text-xs text-muted-foreground">
              of {adminStats.totalTenants} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{adminStats.systemHealth}%</div>
            <Progress value={adminStats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${adminStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Critical system notifications and alerts
              </CardDescription>
            </div>
            <Badge variant={adminStats.criticalAlerts > 0 ? "destructive" : "outline"} className="text-xs">
              {adminStats.criticalAlerts} Critical
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center space-x-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {alert.message}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                      {alert.service}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getAlertBadge(alert.type)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All System Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Analytics Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enterprise Workforce Health</CardTitle>
            <CardDescription>
              Multi-tenant workforce analytics and health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkforceHealthDashboard />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Performance Metrics</CardTitle>
            <CardDescription>
              System performance and productivity insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductivityMetricsVisualization />
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
            <CardDescription>
              Enterprise administration and control
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Building2 className="mr-2 h-4 w-4" />
              Tenant Management
              <Badge variant="secondary" className="ml-auto text-xs">Multi-tenant</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              User Management
              <Badge variant="secondary" className="ml-auto text-xs">Enterprise</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Security Center
              <Badge variant="secondary" className="ml-auto text-xs">Advanced</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Database Management
              <Badge variant="secondary" className="ml-auto text-xs">SQL Server</Badge>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics & Reports</CardTitle>
            <CardDescription>
              Business intelligence and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Advanced Analytics
              <Badge variant="secondary" className="ml-auto text-xs">AI Powered</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Compliance Reports
              <Badge variant="secondary" className="ml-auto text-xs">Automated</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Business Intelligence
              <Badge variant="secondary" className="ml-auto text-xs">Real-time</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Revenue Analytics
              <Badge variant="secondary" className="ml-auto text-xs">Financial</Badge>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Operations</CardTitle>
            <CardDescription>
              System monitoring and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Server className="mr-2 h-4 w-4" />
              System Health
              <Badge variant="secondary" className="ml-auto text-xs">Monitoring</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Platform Settings
              <Badge variant="secondary" className="ml-auto text-xs">Global</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Alert Management
              <Badge variant="secondary" className="ml-auto text-xs">Critical</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Performance Monitor
              <Badge variant="secondary" className="ml-auto text-xs">Live</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
