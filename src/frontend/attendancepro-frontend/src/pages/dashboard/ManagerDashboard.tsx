import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar, 
  Clock, 
  BarChart3, 
  Settings, 
  Bell,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  MapPin,
  UserCheck,
  FileText,
  Target,
  Award,
  AlertCircle,
  PieChart,
  ClipboardList
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import analyticsService from '../../services/analyticsService'
import notificationService from '../../services/notificationService'
import realTimeService from '../../services/realTimeService'
import WorkforceHealthDashboard from '../../components/analytics/WorkforceHealthDashboard'
import ProductivityMetricsVisualization from '../../components/analytics/ProductivityMetricsVisualization'
import NotificationCenter from '../../components/notifications/NotificationCenter'

interface ManagerStats {
  teamSize: number
  presentToday: number
  absentToday: number
  lateToday: number
  attendanceRate: number
  pendingLeaveRequests: number
  teamProductivity: number
  upcomingDeadlines: number
  teamMorale: number
  monthlyGoalProgress: number
}

interface TeamMember {
  id: string
  name: string
  position: string
  status: 'present' | 'absent' | 'late' | 'on-leave'
  checkInTime?: string
  location?: string
  productivity: number
}

interface PendingTask {
  id: string
  type: 'leave-approval' | 'performance-review' | 'schedule-conflict' | 'goal-review'
  title: string
  employee: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string
}

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [managerStats, setManagerStats] = useState<ManagerStats>({
    teamSize: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0,
    pendingLeaveRequests: 0,
    teamProductivity: 0,
    upcomingDeadlines: 0,
    teamMorale: 0,
    monthlyGoalProgress: 0,
  })
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([])
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
    loadManagerData()
    loadNotificationCount()
    setupRealTimeConnections()
    
    const interval = setInterval(() => {
      if (realTimeUpdates) {
        loadManagerData()
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

    realTimeService.on('team-update', (update) => {
      if (realTimeUpdates) {
        loadManagerData()
        toast.info(`Team update: ${update.message}`)
      }
    })

    realTimeService.on('leave-request', (request) => {
      setPendingTasks(prev => [{
        id: Date.now().toString(),
        type: 'leave-approval',
        title: `Leave request from ${request.employeeName}`,
        employee: request.employeeName,
        priority: 'medium',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }, ...prev.slice(0, 9)])
      toast.info(`New leave request from ${request.employeeName}`)
    })
  }

  const cleanupRealTimeConnections = () => {
    try {
      realTimeService.disconnect?.()
    } catch (error) {
      console.warn('Error during real-time service cleanup:', error)
    }
  }

  const loadManagerData = async () => {
    try {
      setIsLoading(true)
      const overview = await analyticsService.getOverview()
      
      setManagerStats({
        teamSize: 24,
        presentToday: 22,
        absentToday: 1,
        lateToday: 1,
        attendanceRate: overview.attendanceRate || 95.8,
        pendingLeaveRequests: 3,
        teamProductivity: 87.5,
        upcomingDeadlines: 5,
        teamMorale: 8.2,
        monthlyGoalProgress: 78,
      })

      setTeamMembers([
        {
          id: '1',
          name: 'Sarah Johnson',
          position: 'Senior Developer',
          status: 'present',
          checkInTime: '08:45 AM',
          location: 'Office - Floor 3',
          productivity: 92
        },
        {
          id: '2',
          name: 'Mike Chen',
          position: 'UI/UX Designer',
          status: 'present',
          checkInTime: '09:15 AM',
          location: 'Remote',
          productivity: 88
        },
        {
          id: '3',
          name: 'Emily Davis',
          position: 'Project Manager',
          status: 'late',
          checkInTime: '09:45 AM',
          location: 'Office - Floor 3',
          productivity: 85
        },
        {
          id: '4',
          name: 'Alex Rodriguez',
          position: 'Backend Developer',
          status: 'on-leave',
          productivity: 0
        },
        {
          id: '5',
          name: 'Lisa Wang',
          position: 'QA Engineer',
          status: 'absent',
          productivity: 0
        }
      ])

      setPendingTasks([
        {
          id: '1',
          type: 'leave-approval',
          title: 'Annual leave request - Alex Rodriguez',
          employee: 'Alex Rodriguez',
          priority: 'medium',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'performance-review',
          title: 'Quarterly review - Sarah Johnson',
          employee: 'Sarah Johnson',
          priority: 'high',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'goal-review',
          title: 'Monthly goal assessment',
          employee: 'Team',
          priority: 'medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Error loading manager data:', error)
      toast.error('Failed to load manager dashboard data')
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'on-leave':
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Present</Badge>
      case 'late':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Late</Badge>
      case 'absent':
        return <Badge variant="destructive" className="text-xs">Absent</Badge>
      case 'on-leave':
        return <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">On Leave</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Medium</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Low</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Manager Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Team management and performance overview for {user?.firstName}
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
              <CardTitle className="text-lg">Team Notifications</CardTitle>
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

      {/* Manager Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managerStats.teamSize}</div>
            <p className="text-xs text-muted-foreground">
              Direct reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{managerStats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              Team attendance rate: {managerStats.attendanceRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managerStats.teamProductivity}%</div>
            <Progress value={managerStats.teamProductivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Require your attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Status</CardTitle>
              <CardDescription>
                Real-time team attendance and status overview
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Live Updates {realTimeUpdates ? '🟢' : '⏸️'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  {getStatusIcon(member.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {member.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.position}
                  </p>
                  <div className="flex items-center space-x-2">
                    {member.checkInTime && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {member.checkInTime}
                        </p>
                        <span className="text-muted-foreground">•</span>
                      </>
                    )}
                    {member.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {member.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {member.productivity > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.productivity}%</p>
                      <p className="text-xs text-muted-foreground">Productivity</p>
                    </div>
                  )}
                  <div className="flex-shrink-0">
                    {getStatusBadge(member.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View Full Team Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pending Tasks</CardTitle>
              <CardDescription>
                Items requiring your review and approval
              </CardDescription>
            </div>
            <Badge variant={pendingTasks.length > 0 ? "secondary" : "outline"} className="text-xs">
              {pendingTasks.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      {task.employee}
                    </p>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(task.priority)}
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Pending Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Analytics</CardTitle>
            <CardDescription>
              Productivity trends and team health metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkforceHealthDashboard />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Productivity Insights</CardTitle>
            <CardDescription>
              Performance metrics and improvement opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductivityMetricsVisualization />
          </CardContent>
        </Card>
      </div>

      {/* Manager Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Direct team oversight and management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Team Overview
              <Badge variant="secondary" className="ml-auto text-xs">Real-time</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Management
              <Badge variant="secondary" className="ml-auto text-xs">Planning</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Performance Goals
              <Badge variant="secondary" className="ml-auto text-xs">Tracking</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Award className="mr-2 h-4 w-4" />
              Team Recognition
              <Badge variant="secondary" className="ml-auto text-xs">Rewards</Badge>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics & Reporting</CardTitle>
            <CardDescription>
              Team insights and performance reporting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Team Analytics
              <Badge variant="secondary" className="ml-auto text-xs">Insights</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Performance Reports
              <Badge variant="secondary" className="ml-auto text-xs">Automated</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <PieChart className="mr-2 h-4 w-4" />
              Productivity Metrics
              <Badge variant="secondary" className="ml-auto text-xs">Real-time</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trend Analysis
              <Badge variant="secondary" className="ml-auto text-xs">Predictive</Badge>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manager tools and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Approve Timesheets
              <Badge variant="secondary" className="ml-auto text-xs">Pending</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Review Leave Requests
              <Badge variant="secondary" className="ml-auto text-xs">Approval</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <UserCheck className="mr-2 h-4 w-4" />
              Team Check-in
              <Badge variant="secondary" className="ml-auto text-xs">1-on-1</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Team Settings
              <Badge variant="secondary" className="ml-auto text-xs">Configure</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ManagerDashboard
