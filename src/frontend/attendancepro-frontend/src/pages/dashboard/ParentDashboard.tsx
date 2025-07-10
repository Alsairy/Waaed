import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  Users, 
  GraduationCap, 
  TrendingUp,
  Calendar,
  MessageSquare,
  DollarSign,
  Award,
  Bell,
  CheckCircle,
  FileText,
  Clock,
  CreditCard,
  Mail,
  ChevronRight,
  Eye,
  Download
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'

interface ParentStats {
  totalChildren: number
  averageGPA: number
  totalOutstanding: number
  upcomingEvents: number
  unreadMessages: number
  attendanceRate: number
}

interface ChildOverview {
  studentId: string
  firstName: string
  lastName: string
  grade: string
  currentGPA: number
  attendanceRate: number
  enrolledCourses: number
  recentGrade?: {
    subject: string
    grade: string
    percentage: number
  }
  status: 'excellent' | 'good' | 'needs-attention'
}

interface RecentMessage {
  id: string
  from: string
  fromRole: string
  subject: string
  preview: string
  timestamp: string
  isRead: boolean
  priority: 'high' | 'medium' | 'low'
  studentName?: string
}

interface UpcomingEvent {
  id: string
  title: string
  type: 'meeting' | 'event' | 'deadline' | 'exam'
  date: string
  time?: string
  location?: string
  studentName?: string
  description?: string
}

interface PaymentInfo {
  id: string
  description: string
  amount: number
  dueDate: string
  status: 'pending' | 'overdue' | 'paid'
  studentName: string
  category: string
}

interface AcademicSummary {
  studentId: string
  studentName: string
  totalSubjects: number
  averageGrade: number
  gradeDistribution: {
    A: number
    B: number
    C: number
    D: number
    F: number
  }
  trend: 'improving' | 'declining' | 'stable'
}

const ParentDashboard: React.FC = () => {
  const { user } = useAuth()
  const [parentStats, setParentStats] = useState<ParentStats>({
    totalChildren: 0,
    averageGPA: 0,
    totalOutstanding: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    attendanceRate: 0,
  })
  const [childrenOverview, setChildrenOverview] = useState<ChildOverview[]>([])
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo[]>([])
  const [academicSummary, setAcademicSummary] = useState<AcademicSummary[]>([])
  const [, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadParentData()
    
    const interval = setInterval(() => {
      loadParentData()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const loadParentData = async () => {
    try {
      setIsLoading(true)
      
      const mockChildren = [
        {
          studentId: '1',
          firstName: 'Ahmed',
          lastName: 'Al-Rashid',
          grade: '11',
          currentGPA: 3.2,
          attendanceRate: 92,
          enrolledCourses: 6,
          recentGrade: {
            subject: 'Mathematics',
            grade: 'B+',
            percentage: 85
          },
          status: 'good' as const
        },
        {
          studentId: '2',
          firstName: 'Layla',
          lastName: 'Al-Rashid',
          grade: '9',
          currentGPA: 3.6,
          attendanceRate: 95,
          enrolledCourses: 5,
          recentGrade: {
            subject: 'Science',
            grade: 'A',
            percentage: 92
          },
          status: 'excellent' as const
        }
      ]

      setChildrenOverview(mockChildren)

      const totalChildren = mockChildren.length
      const averageGPA = mockChildren.reduce((sum, child) => sum + child.currentGPA, 0) / totalChildren
      const averageAttendance = mockChildren.reduce((sum, child) => sum + child.attendanceRate, 0) / totalChildren

      setParentStats({
        totalChildren,
        averageGPA,
        totalOutstanding: 1500, // Mock data
        upcomingEvents: 3,
        unreadMessages: 5,
        attendanceRate: averageAttendance,
      })

      setRecentMessages([
        {
          id: '1',
          from: 'Dr. Sarah Johnson',
          fromRole: 'Math Teacher',
          subject: "Ahmed's Progress Update",
          preview: 'Ahmed has shown significant improvement in algebra...',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          isRead: false,
          priority: 'medium',
          studentName: 'Ahmed'
        },
        {
          id: '2',
          from: 'Principal Office',
          fromRole: 'Administration',
          subject: 'Parent-Teacher Conference',
          preview: 'Reminder: Parent-teacher conferences are scheduled...',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          isRead: false,
          priority: 'high'
        },
        {
          id: '3',
          from: 'Ms. Fatima Hassan',
          fromRole: 'Science Teacher',
          subject: "Layla's Excellent Performance",
          preview: 'I wanted to commend Layla for her outstanding work...',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          isRead: true,
          priority: 'low',
          studentName: 'Layla'
        }
      ])

      setUpcomingEvents([
        {
          id: '1',
          title: 'Parent-Teacher Meeting',
          type: 'meeting',
          date: new Date(Date.now() + 86400000).toISOString(),
          time: '2:00 PM',
          location: 'School Conference Room',
          studentName: 'Ahmed',
          description: 'Quarterly progress review'
        },
        {
          id: '2',
          title: 'Science Fair',
          type: 'event',
          date: new Date(Date.now() + 432000000).toISOString(),
          time: '10:00 AM',
          location: 'School Auditorium',
          studentName: 'Layla',
          description: 'Annual science fair presentation'
        },
        {
          id: '3',
          title: 'Fee Payment Deadline',
          type: 'deadline',
          date: new Date(Date.now() + 604800000).toISOString(),
          description: 'Semester fee payment due'
        }
      ])

      setPaymentInfo([
        {
          id: '1',
          description: 'Semester Tuition Fee',
          amount: 1200,
          dueDate: new Date(Date.now() + 604800000).toISOString(),
          status: 'pending',
          studentName: 'Ahmed Al-Rashid',
          category: 'Tuition'
        },
        {
          id: '2',
          description: 'Lab Equipment Fee',
          amount: 150,
          dueDate: new Date(Date.now() + 1209600000).toISOString(),
          status: 'pending',
          studentName: 'Layla Al-Rashid',
          category: 'Lab Fees'
        },
        {
          id: '3',
          description: 'Transportation Fee',
          amount: 200,
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          status: 'overdue',
          studentName: 'Ahmed Al-Rashid',
          category: 'Transportation'
        }
      ])

      setAcademicSummary([
        {
          studentId: '1',
          studentName: 'Ahmed',
          totalSubjects: 6,
          averageGrade: 82,
          gradeDistribution: { A: 2, B: 3, C: 1, D: 0, F: 0 },
          trend: 'improving'
        },
        {
          studentId: '2',
          studentName: 'Layla',
          totalSubjects: 5,
          averageGrade: 88,
          gradeDistribution: { A: 4, B: 1, C: 0, D: 0, F: 0 },
          trend: 'stable'
        }
      ])

    } catch (error) {
      console.error('Error loading parent data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'needs-attention': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'paid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'deadline': return <Clock className="h-4 w-4" />
      case 'exam': return <FileText className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      case 'stable': return <TrendingUp className="h-4 w-4 text-gray-500" />
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Parent Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Children Overview - {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-muted-foreground">
            Monitor your children's academic progress and school activities
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" style={{ color: '#36BA91' }} />
              <span className="text-sm text-muted-foreground">
                {parentStats.totalChildren} Children
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" style={{ color: '#36BA91' }} />
              <span className="text-sm text-muted-foreground">
                Average GPA: {parentStats.averageGPA.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            className="relative"
            style={{ borderColor: '#005F96', color: '#005F96' }}
          >
            <Bell className="mr-2 h-4 w-4" />
            Messages
            {parentStats.unreadMessages > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5" style={{ backgroundColor: '#36BA91' }}>
                {parentStats.unreadMessages > 99 ? '99+' : parentStats.unreadMessages}
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

      {/* Parent Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {parentStats.totalChildren}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {parentStats.averageGPA.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all children
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: parentStats.totalOutstanding > 0 ? '#E74C3C' : '#36BA91' }}>
              ${parentStats.totalOutstanding}
            </div>
            <p className="text-xs text-muted-foreground">
              {parentStats.totalOutstanding > 0 ? 'Payment required' : 'All paid up'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {parentStats.attendanceRate.toFixed(1)}%
            </div>
            <Progress value={parentStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Children Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
            Children Overview
          </CardTitle>
          <CardDescription>
            Academic progress and status for each child
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {childrenOverview.map((child) => (
              <div key={child.studentId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Grade {child.grade} • {child.enrolledCourses} courses
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(child.status)}`}>
                    {child.status.replace('-', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">GPA</span>
                    <span className="font-medium" style={{ color: '#005F96' }}>
                      {child.currentGPA.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={(child.currentGPA / 4.0) * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Attendance</span>
                    <span className="font-medium" style={{ color: '#36BA91' }}>
                      {child.attendanceRate}%
                    </span>
                  </div>
                  <Progress value={child.attendanceRate} className="h-2" />
                  
                  {child.recentGrade && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Recent Grade:</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{child.recentGrade.subject}</span>
                        <span className="font-medium" style={{ color: '#36BA91' }}>
                          {child.recentGrade.grade} ({child.recentGrade.percentage}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="mr-1 h-3 w-3" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication and Updates */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
              Recent Messages
            </CardTitle>
            <CardDescription>
              Communications from teachers and school
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{message.subject}</h4>
                      {!message.isRead && (
                        <Badge className="text-xs bg-blue-100 text-blue-800">New</Badge>
                      )}
                      <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      From: {message.from} ({message.fromRole})
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {message.preview}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {message.studentName && (
                        <p className="text-xs text-muted-foreground">
                          Re: {message.studentName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No recent messages</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Important dates and school events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                      {event.time && ` at ${event.time}`}
                    </p>
                    {event.location && (
                      <p className="text-sm text-muted-foreground">
                        📍 {event.location}
                      </p>
                    )}
                    {event.studentName && (
                      <p className="text-sm text-muted-foreground">
                        Student: {event.studentName}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Information and Academic Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
              Payment Information
            </CardTitle>
            <CardDescription>
              Outstanding fees and payment history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentInfo.length > 0 ? (
              paymentInfo.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{payment.description}</h4>
                      <Badge className={`text-xs ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.studentName} • {payment.category}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ 
                      color: payment.status === 'overdue' ? '#E74C3C' : '#005F96' 
                    }}>
                      ${payment.amount}
                    </div>
                    {payment.status === 'pending' && (
                      <Button size="sm" style={{ backgroundColor: '#36BA91' }} className="mt-1">
                        <CreditCard className="mr-1 h-3 w-3" />
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>All payments up to date</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
              Academic Summary
            </CardTitle>
            <CardDescription>
              Overall academic performance overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {academicSummary.length > 0 ? (
              academicSummary.map((summary) => (
                <div key={summary.studentId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{summary.studentName}</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-lg font-bold" style={{ color: '#36BA91' }}>
                        {summary.averageGrade}%
                      </span>
                      {getTrendIcon(summary.trend)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subjects</span>
                      <span>{summary.totalSubjects}</span>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      <div className="text-center">
                        <div className="font-medium">A</div>
                        <div className="text-muted-foreground">{summary.gradeDistribution.A}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">B</div>
                        <div className="text-muted-foreground">{summary.gradeDistribution.B}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">C</div>
                        <div className="text-muted-foreground">{summary.gradeDistribution.C}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">D</div>
                        <div className="text-muted-foreground">{summary.gradeDistribution.D}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">F</div>
                        <div className="text-muted-foreground">{summary.gradeDistribution.F}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Trend: {summary.trend}</span>
                      <Button size="sm" variant="outline">
                        <Download className="mr-1 h-3 w-3" />
                        Report Card
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No academic data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used parent portal features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Message Teachers</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Meeting</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">Make Payment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Download className="h-6 w-6" />
              <span className="text-sm">Download Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ParentDashboard
