import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  BookOpen, 
  Users, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Award,
  Bell,
  MessageSquare,
  BarChart3,
  UserCheck,
  ClipboardList,
  ChevronRight,
  PlayCircle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { assignmentsService } from '../../services/assignmentsService'
import { gradesService } from '../../services/gradesService'
import { coursesService } from '../../services/coursesService'
import { academicCalendarService } from '../../services/academicCalendarService'

interface TeacherStats {
  totalStudents: number
  activeCourses: number
  pendingGrades: number
  averageClassPerformance: number
  attendanceRate: number
  assignmentsCreated: number
  upcomingClasses: number
  parentMessages: number
}

interface TodayClass {
  id: string
  courseName: string
  courseCode: string
  startTime: string
  endTime: string
  room: string
  enrolledStudents: number
  status: 'upcoming' | 'current' | 'completed'
  attendanceTaken: boolean
}

interface PendingTask {
  id: string
  type: 'grade' | 'message' | 'lesson-plan' | 'attendance'
  title: string
  courseName?: string
  count?: number
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
}

interface StudentAlert {
  id: string
  studentName: string
  type: 'absent' | 'performance' | 'behavior' | 'achievement'
  message: string
  courseName: string
  severity: 'high' | 'medium' | 'low'
  date: string
}

interface CoursePerformance {
  courseId: string
  courseName: string
  courseCode: string
  averageGrade: number
  totalStudents: number
  attendanceRate: number
  assignmentsCount: number
  trend: 'up' | 'down' | 'stable'
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth()
  const [teacherStats, setTeacherStats] = useState<TeacherStats>({
    totalStudents: 0,
    activeCourses: 0,
    pendingGrades: 0,
    averageClassPerformance: 0,
    attendanceRate: 0,
    assignmentsCreated: 0,
    upcomingClasses: 0,
    parentMessages: 0,
  })
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([])
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([])
  const [studentAlerts, setStudentAlerts] = useState<StudentAlert[]>([])
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformance[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadTeacherData()
    
    const interval = setInterval(() => {
      loadTeacherData()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const loadTeacherData = async () => {
    try {
      
      const courses = await coursesService.getCoursesByInstructor(user?.id || '')
      const totalStudents = courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)
      
      const allAssignments = await Promise.all(
        courses.map(course => assignmentsService.getAssignments(course.id))
      )
      const assignments = allAssignments.flat()
      
      const allGrades = await Promise.all(
        courses.map(course => gradesService.getCourseGrades(course.id))
      )
      const grades = allGrades.flat()
      
      const pendingGrades = assignments.length - grades.length // Simplified calculation
      const averagePerformance = grades.length > 0 
        ? grades.reduce((sum, grade) => sum + grade.percentage, 0) / grades.length 
        : 0

      setTeacherStats({
        totalStudents,
        activeCourses: courses.length,
        pendingGrades: Math.max(0, pendingGrades),
        averageClassPerformance: averagePerformance,
        attendanceRate: 92.5, // Mock data
        assignmentsCreated: assignments.length,
        upcomingClasses: 3, // Mock data
        parentMessages: 5, // Mock data
      })

      const today = new Date()
      const semester = getCurrentSemester()
      const year = today.getFullYear()
      
      const schedule = await academicCalendarService.getInstructorSchedule(
        user?.id || '', 
        semester, 
        year
      )
      const todaySchedule = filterTodayClasses(schedule, courses)
      setTodayClasses(todaySchedule)

      const performanceData = courses.map(course => ({
        courseId: course.id,
        courseName: course.title,
        courseCode: course.code,
        averageGrade: Math.random() * 20 + 75, // Mock data
        totalStudents: course.enrolledStudents || 0,
        attendanceRate: Math.random() * 10 + 85, // Mock data
        assignmentsCount: assignments.filter(a => a.courseId === course.id).length,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
      }))
      setCoursePerformance(performanceData)

      setPendingTasks([
        {
          id: '1',
          type: 'grade',
          title: 'Grade Assignments',
          courseName: 'Mathematics 10A',
          count: 23,
          priority: 'high'
        },
        {
          id: '2',
          type: 'message',
          title: 'Parent Messages',
          count: 5,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'lesson-plan',
          title: 'Lesson Plans',
          count: 2,
          priority: 'medium'
        }
      ])

      setStudentAlerts([
        {
          id: '1',
          studentName: 'Ahmed Al-Rashid',
          type: 'absent',
          message: 'Absent for 2 consecutive days',
          courseName: 'Mathematics 10A',
          severity: 'high',
          date: new Date().toISOString()
        },
        {
          id: '2',
          studentName: 'Layla Mahmoud',
          type: 'achievement',
          message: 'Excellent performance on recent test',
          courseName: 'Physics 11B',
          severity: 'low',
          date: new Date().toISOString()
        }
      ])

      setUnreadNotifications(8) // Mock data

    } catch (error) {
      console.error('Error loading teacher data:', error)
      toast.error('Failed to load dashboard data')
      
      setTeacherStats({
        totalStudents: 125,
        activeCourses: 4,
        pendingGrades: 23,
        averageClassPerformance: 82.5,
        attendanceRate: 92.5,
        assignmentsCreated: 15,
        upcomingClasses: 3,
        parentMessages: 5,
      })
      
      setTodayClasses([
        {
          id: '1',
          courseName: 'Mathematics 10A',
          courseCode: 'MATH10A',
          startTime: '09:00',
          endTime: '10:00',
          room: 'Room 201',
          enrolledStudents: 28,
          status: 'upcoming',
          attendanceTaken: false
        },
        {
          id: '2',
          courseName: 'Physics 11B',
          courseCode: 'PHYS11B',
          startTime: '11:00',
          endTime: '12:00',
          room: 'Room 305',
          enrolledStudents: 25,
          status: 'upcoming',
          attendanceTaken: false
        }
      ])
    } finally {
    }
  }

  const getCurrentSemester = () => {
    const month = new Date().getMonth()
    if (month >= 8 || month <= 0) return 'Fall'
    if (month >= 1 && month <= 4) return 'Spring'
    return 'Summer'
  }

  const filterTodayClasses = (schedule: any[], courses: any[]) => {
    const today = new Date().getDay()
    return schedule.filter(cls => cls.dayOfWeek === today).map(cls => {
      const course = courses.find(c => c.id === cls.courseId)
      return {
        id: cls.id,
        courseName: course?.title || 'Unknown Course',
        courseCode: course?.code || '',
        startTime: cls.startTime,
        endTime: cls.endTime,
        room: cls.location || 'TBA',
        enrolledStudents: course?.enrolledStudents || 0,
        status: getClassStatus(cls.startTime, cls.endTime),
        attendanceTaken: false // Mock data
      }
    })
  }

  const getClassStatus = (startTime: string, endTime: string): 'upcoming' | 'current' | 'completed' => {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const start = startHour * 60 + startMin
    const end = endHour * 60 + endMin

    if (currentTime < start) return 'upcoming'
    if (currentTime >= start && currentTime <= end) return 'current'
    return 'completed'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'grade': return <Award className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'lesson-plan': return <FileText className="h-4 w-4" />
      case 'attendance': return <UserCheck className="h-4 w-4" />
      default: return <ClipboardList className="h-4 w-4" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'absent': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'performance': return <TrendingUp className="h-4 w-4 text-yellow-500" />
      case 'behavior': return <Users className="h-4 w-4 text-orange-500" />
      case 'achievement': return <Award className="h-4 w-4 text-green-500" />
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Teacher Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Good morning, Professor {user?.lastName}!
          </h1>
          <p className="text-muted-foreground">
            Here's your teaching overview for today
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" style={{ color: '#36BA91' }} />
              <span className="text-sm text-muted-foreground">
                {teacherStats.activeCourses} Active Courses
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" style={{ color: '#36BA91' }} />
              <span className="text-sm text-muted-foreground">
                {teacherStats.totalStudents} Students
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
            Notifications
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.2rem] h-5" style={{ backgroundColor: '#36BA91' }}>
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

      {/* Teacher Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {teacherStats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {teacherStats.activeCourses} courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: teacherStats.pendingGrades > 0 ? '#F39C12' : '#36BA91' }}>
              {teacherStats.pendingGrades}
            </div>
            <p className="text-xs text-muted-foreground">
              Assignments to grade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Performance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {teacherStats.averageClassPerformance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across all classes
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
              {teacherStats.attendanceRate}%
            </div>
            <Progress value={teacherStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Your classes for {currentTime.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayClasses.length > 0 ? (
              todayClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{cls.courseName}</h4>
                      <Badge className={`text-xs ${getStatusColor(cls.status)}`}>
                        {cls.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cls.startTime} - {cls.endTime} • {cls.room}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cls.enrolledStudents} students enrolled
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!cls.attendanceTaken && cls.status === 'current' && (
                      <Button size="sm" style={{ backgroundColor: '#36BA91' }}>
                        <UserCheck className="mr-1 h-3 w-3" />
                        Take Attendance
                      </Button>
                    )}
                    {cls.status === 'current' && (
                      <Button size="sm" variant="outline">
                        <PlayCircle className="mr-1 h-3 w-3" />
                        Start Class
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
              Pending Tasks
            </CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getTaskIcon(task.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.courseName && (
                        <p className="text-sm text-muted-foreground">
                          {task.courseName}
                        </p>
                      )}
                      {task.count && (
                        <p className="text-sm font-medium" style={{ color: '#005F96' }}>
                          {task.count} items
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>All caught up! No pending tasks.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Alerts and Course Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" style={{ color: '#E74C3C' }} />
              Student Alerts
            </CardTitle>
            <CardDescription>
              Important student notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentAlerts.length > 0 ? (
              studentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{alert.studentName}</h4>
                      <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {alert.courseName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No student alerts at this time</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
              Course Performance Overview
            </CardTitle>
            <CardDescription>
              Performance metrics for your courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursePerformance.length > 0 ? (
              coursePerformance.map((course) => (
                <div key={course.courseId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{course.courseName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.courseCode} • {course.totalStudents} students
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold" style={{ color: '#36BA91' }}>
                          {course.averageGrade.toFixed(1)}%
                        </span>
                        <TrendingUp 
                          className={`h-4 w-4 ${
                            course.trend === 'up' ? 'text-green-500' : 
                            course.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Grade</span>
                      <span>{course.averageGrade.toFixed(1)}%</span>
                    </div>
                    <Progress value={course.averageGrade} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Attendance</span>
                      <span>{course.attendanceRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={course.attendanceRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{course.assignmentsCount} assignments</span>
                      <span>Trend: {course.trend}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No course performance data available</p>
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
            Frequently used teaching tools and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Award className="h-6 w-6" />
              <span className="text-sm">Grade Assignments</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <UserCheck className="h-6 w-6" />
              <span className="text-sm">Take Attendance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Create Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Message Parents</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TeacherDashboard
