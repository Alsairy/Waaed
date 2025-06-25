import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin,
  Bell,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  Target,
  TrendingUp,
  FileText,
  Settings,
  Smartphone,
  Coffee
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import analyticsService from '../../services/analyticsService'
import notificationService from '../../services/notificationService'
import realTimeService from '../../services/realTimeService'
import NotificationCenter from '../../components/notifications/NotificationCenter'

interface EmployeeStats {
  todayStatus: 'checked-in' | 'checked-out' | 'not-started'
  checkInTime?: string
  checkOutTime?: string
  hoursWorked: number
  breaksTaken: number
  leaveBalance: number
  attendanceRate: number
  weeklyHours: number
  monthlyGoalProgress: number
  upcomingLeaves: number
}

interface PersonalActivity {
  id: string
  action: 'check-in' | 'check-out' | 'break-start' | 'break-end' | 'leave-approved'
  time: string
  location?: string
  duration?: string
}

interface LeaveRequest {
  id: string
  type: 'annual' | 'sick' | 'personal' | 'emergency'
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected'
  days: number
}

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth()
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats>({
    todayStatus: 'not-started',
    hoursWorked: 0,
    breaksTaken: 0,
    leaveBalance: 0,
    attendanceRate: 0,
    weeklyHours: 0,
    monthlyGoalProgress: 0,
    upcomingLeaves: 0,
  })
  const [personalActivity, setPersonalActivity] = useState<PersonalActivity[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
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
    loadEmployeeData()
    loadNotificationCount()
    setupRealTimeConnections()
    
    const interval = setInterval(() => {
      if (realTimeUpdates) {
        loadEmployeeData()
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

    realTimeService.on('personal-update', (update) => {
      if (realTimeUpdates) {
        loadEmployeeData()
        setPersonalActivity(prev => [update, ...prev.slice(0, 9)])
        toast.info(`${update.action.replace('-', ' ')} recorded`)
      }
    })

    realTimeService.on('leave-status-update', (update) => {
      setLeaveRequests(prev => prev.map(req => 
        req.id === update.requestId 
          ? { ...req, status: update.status }
          : req
      ))
      toast.info(`Leave request ${update.status}`)
    })
  }

  const cleanupRealTimeConnections = () => {
    // Note: realTimeService.off() may require specific handler references
    try {
      realTimeService.disconnect?.()
    } catch (error) {
      console.warn('Error during real-time service cleanup:', error)
    }
  }

  const loadEmployeeData = async () => {
    try {
      const overview = await analyticsService.getOverview()
      
      setEmployeeStats({
        todayStatus: 'checked-in',
        checkInTime: '08:30 AM',
        checkOutTime: undefined,
        hoursWorked: 7.5,
        breaksTaken: 2,
        leaveBalance: 18,
        attendanceRate: overview.attendanceRate || 96.5,
        weeklyHours: 37.5,
        monthlyGoalProgress: 85,
        upcomingLeaves: 1,
      })

      setPersonalActivity([
        {
          id: '1',
          action: 'check-in',
          time: '08:30 AM',
          location: 'Office - Floor 3'
        },
        {
          id: '2',
          action: 'break-start',
          time: '10:15 AM',
          duration: '15 min'
        },
        {
          id: '3',
          action: 'break-end',
          time: '10:30 AM',
          duration: '15 min'
        },
        {
          id: '4',
          action: 'break-start',
          time: '12:00 PM',
          duration: '45 min'
        },
        {
          id: '5',
          action: 'break-end',
          time: '12:45 PM',
          duration: '45 min'
        }
      ])

      setLeaveRequests([
        {
          id: '1',
          type: 'annual',
          startDate: '2025-07-15',
          endDate: '2025-07-19',
          status: 'pending',
          days: 5
        },
        {
          id: '2',
          type: 'sick',
          startDate: '2025-06-10',
          endDate: '2025-06-10',
          status: 'approved',
          days: 1
        }
      ])
    } catch (error) {
      console.error('Error loading employee data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
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
      case 'checked-in':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'checked-out':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Checked In</Badge>
      case 'checked-out':
        return <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">Checked Out</Badge>
      default:
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Not Started</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'check-in':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'check-out':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'break-start':
        return <Coffee className="h-4 w-4 text-blue-500" />
      case 'break-end':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'leave-approved':
        return <Calendar className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getLeaveStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>
      default:
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const handleQuickCheckIn = () => {
    toast.success('Check-in recorded successfully!')
    setEmployeeStats(prev => ({
      ...prev,
      todayStatus: 'checked-in',
      checkInTime: new Date().toLocaleTimeString()
    }))
  }

  const handleQuickCheckOut = () => {
    toast.success('Check-out recorded successfully!')
    setEmployeeStats(prev => ({
      ...prev,
      todayStatus: 'checked-out',
      checkOutTime: new Date().toLocaleTimeString()
    }))
  }

  return (
    <div className="space-y-6">
      {/* Employee Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here's your personal attendance overview.
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
              <CardTitle className="text-lg">My Notifications</CardTitle>
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

      {/* Quick Check-in/out */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Today's Status</CardTitle>
              <CardDescription>
                Current attendance status and quick actions
              </CardDescription>
            </div>
            {getStatusBadge(employeeStats.todayStatus)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon(employeeStats.todayStatus)}
              <div>
                <p className="font-medium">
                  {employeeStats.todayStatus === 'checked-in' ? 'You are checked in' : 
                   employeeStats.todayStatus === 'checked-out' ? 'You are checked out' : 
                   'Ready to start your day'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {employeeStats.checkInTime && (
                    <span>Check-in: {employeeStats.checkInTime}</span>
                  )}
                  {employeeStats.checkOutTime && (
                    <span>Check-out: {employeeStats.checkOutTime}</span>
                  )}
                  <span>Hours today: {employeeStats.hoursWorked}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {employeeStats.todayStatus !== 'checked-in' && (
                <Button onClick={handleQuickCheckIn} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check In
                </Button>
              )}
              {employeeStats.todayStatus === 'checked-in' && (
                <Button onClick={handleQuickCheckOut} variant="outline">
                  <XCircle className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.weeklyHours}</div>
            <p className="text-xs text-muted-foreground">
              Target: 40 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{employeeStats.attendanceRate}%</div>
            <Progress value={employeeStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.leaveBalance}</div>
            <p className="text-xs text-muted-foreground">
              Days remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeStats.monthlyGoalProgress}%</div>
            <Progress value={employeeStats.monthlyGoalProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Activity */}
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>My Activity Today</CardTitle>
                <CardDescription>
                  Your check-ins, breaks, and attendance events
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Live Updates {realTimeUpdates ? '🟢' : '⏸️'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personalActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    {getActionIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground capitalize">
                      {activity.action.replace('-', ' ')}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                      {activity.location && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {activity.location}
                            </p>
                          </div>
                        </>
                      )}
                      {activity.duration && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <p className="text-sm text-muted-foreground">
                            {activity.duration}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View Full Activity History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Personal tools and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Manual Time Entry
              <Badge variant="secondary" className="ml-auto text-xs">Correction</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Request Leave
              <Badge variant="secondary" className="ml-auto text-xs">Apply</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              My Timesheets
              <Badge variant="secondary" className="ml-auto text-xs">Review</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <User className="mr-2 h-4 w-4" />
              Update Profile
              <Badge variant="secondary" className="ml-auto text-xs">Personal</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile App
              <Badge variant="secondary" className="ml-auto text-xs">Download</Badge>
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Preferences
              <Badge variant="secondary" className="ml-auto text-xs">Settings</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My Leave Requests</CardTitle>
              <CardDescription>
                Recent and upcoming leave applications
              </CardDescription>
            </div>
            <Button size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div key={request.id} className="flex items-center space-x-4 hover:bg-muted/50 p-2 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground capitalize">
                    {request.type} Leave - {request.days} day{request.days > 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getLeaveStatusBadge(request.status)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              View All Leave History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmployeeDashboard
