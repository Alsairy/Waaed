import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  Award,
  Bell,
  RefreshCw,
  ChevronRight,
  PlayCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { sisService } from '../../services/sisService'
import { lmsService } from '../../services/lmsService'
import { assignmentsService } from '../../services/assignmentsService'
import { gradesService } from '../../services/gradesService'
import { academicCalendarService } from '../../services/academicCalendarService'

interface StudentStats {
  currentGPA: number
  attendanceRate: number
  completedAssignments: number
  totalAssignments: number
  enrolledCourses: number
  upcomingExams: number
  overdueTasks: number
  creditsEarned: number
}

interface TodayClass {
  id: string
  courseName: string
  courseCode: string
  startTime: string
  endTime: string
  room: string
  instructorName: string
  status: 'upcoming' | 'current' | 'completed'
}

interface AssignmentDue {
  id: string
  title: string
  courseName: string
  dueDate: string
  status: 'not-started' | 'in-progress' | 'submitted' | 'overdue'
  priority: 'high' | 'medium' | 'low'
}

interface RecentGrade {
  id: string
  assignmentName: string
  courseName: string
  grade: number
  maxPoints: number
  percentage: number
  letterGrade: string
  gradedAt: string
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const [studentStats, setStudentStats] = useState<StudentStats>({
    currentGPA: 0,
    attendanceRate: 0,
    completedAssignments: 0,
    totalAssignments: 0,
    enrolledCourses: 0,
    upcomingExams: 0,
    overdueTasks: 0,
    creditsEarned: 0,
  })
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([])
  const [assignmentsDue, setAssignmentsDue] = useState<AssignmentDue[]>([])
  const [recentGrades, setRecentGrades] = useState<RecentGrade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadStudentData()
    
    const interval = setInterval(() => {
      loadStudentData()
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(interval)
  }, [])

  const loadStudentData = async () => {
    try {
      setIsLoading(true)
      
      const today = new Date()
      const semester = getCurrentSemester()
      const year = today.getFullYear()
      
      const enrollments = await sisService.getStudentEnrollments(user?.id || '', semester, year)
      const grades = await gradesService.getStudentGrades(user?.id || '')
      const upcomingAssignments = await assignmentsService.getUpcomingAssignments(user?.id || '', 7)
      const overdueAssignments = await assignmentsService.getOverdueAssignments(user?.id || '')
      
      const currentGPA = calculateGPA(grades)
      
      setStudentStats({
        currentGPA,
        attendanceRate: 94.5, // Mock data - would come from attendance service
        completedAssignments: grades.filter(g => g.grade > 0).length,
        totalAssignments: grades.length,
        enrolledCourses: enrollments.length,
        upcomingExams: 3, // Mock data - would come from exam schedule
        overdueTasks: overdueAssignments.length,
        creditsEarned: enrollments.reduce((sum, e) => sum + e.credits, 0),
      })

      const schedule = await academicCalendarService.getStudentSchedule(
        user?.id || '', 
        semester, 
        year
      )
      const todaySchedule = filterTodayClasses(schedule)
      setTodayClasses(todaySchedule)

      const assignmentsDueData = upcomingAssignments.slice(0, 5).map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        courseName: assignment.courseName || 'Unknown Course',
        dueDate: assignment.dueDate,
        status: getAssignmentStatus(assignment),
        priority: getAssignmentPriority(assignment.dueDate)
      }))
      setAssignmentsDue(assignmentsDueData)

      const recentGradesData = grades.slice(0, 5).map(grade => ({
        id: grade.id,
        assignmentName: grade.assignmentName || 'Assignment',
        courseName: grade.courseName || 'Unknown Course',
        grade: grade.grade,
        maxPoints: grade.maxPoints,
        percentage: grade.percentage,
        letterGrade: grade.letterGrade,
        gradedAt: grade.gradedAt
      }))
      setRecentGrades(recentGradesData)

      setUnreadNotifications(5) // Mock data

    } catch (error) {
      console.error('Error loading student data:', error)
      toast.error('Failed to load dashboard data')
      
      setStudentStats({
        currentGPA: 3.2,
        attendanceRate: 94.5,
        completedAssignments: 15,
        totalAssignments: 20,
        enrolledCourses: 6,
        upcomingExams: 3,
        overdueTasks: 2,
        creditsEarned: 18,
      })
      
      setTodayClasses([
        {
          id: '1',
          courseName: 'Mathematics 10A',
          courseCode: 'MATH10A',
          startTime: '09:00',
          endTime: '10:00',
          room: 'Room 201',
          instructorName: 'Dr. Sarah Johnson',
          status: 'upcoming'
        },
        {
          id: '2',
          courseName: 'Physics 11B',
          courseCode: 'PHYS11B',
          startTime: '11:00',
          endTime: '12:00',
          room: 'Room 305',
          instructorName: 'Prof. Ahmed Ali',
          status: 'upcoming'
        }
      ])
      
      setAssignmentsDue([
        {
          id: '1',
          title: 'Quadratic Equations Worksheet',
          courseName: 'Mathematics 10A',
          dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          status: 'in-progress',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Physics Lab Report',
          courseName: 'Physics 11B',
          dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days
          status: 'not-started',
          priority: 'medium'
        }
      ])
      
      setRecentGrades([
        {
          id: '1',
          assignmentName: 'Algebra Test',
          courseName: 'Mathematics 10A',
          grade: 85,
          maxPoints: 100,
          percentage: 85,
          letterGrade: 'B+',
          gradedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentSemester = () => {
    const month = new Date().getMonth()
    if (month >= 8 || month <= 0) return 'Fall'
    if (month >= 1 && month <= 4) return 'Spring'
    return 'Summer'
  }

  const calculateGPA = (grades: any[]) => {
    if (grades.length === 0) return 0
    const totalPoints = grades.reduce((sum, grade) => sum + grade.gradePoints, 0)
    return totalPoints / grades.length
  }

  const filterTodayClasses = (schedule: any[]) => {
    const today = new Date().getDay()
    return schedule.filter(cls => cls.dayOfWeek === today).map(cls => ({
      id: cls.id,
      courseName: cls.courseName || 'Unknown Course',
      courseCode: cls.courseCode || '',
      startTime: cls.startTime,
      endTime: cls.endTime,
      room: cls.location || 'TBA',
      instructorName: cls.instructorName || 'TBA',
      status: getClassStatus(cls.startTime, cls.endTime)
    }))
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

  const getAssignmentStatus = (assignment: any): 'not-started' | 'in-progress' | 'submitted' | 'overdue' => {
    return 'in-progress'
  }

  const getAssignmentPriority = (dueDate: string): 'high' | 'medium' | 'low' => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) return 'high'
    if (diffDays <= 3) return 'medium'
    return 'low'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800'
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'submitted': return 'bg-green-100 text-green-800'
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

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here's your academic overview for today
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" style={{ color: '#36BA91' }} />
              <span className="text-sm text-muted-foreground">
                {getCurrentSemester()} {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4" style={{ color: '#36BA91' }} />
              <span className="text-sm text-muted-foreground">
                GPA: {studentStats.currentGPA.toFixed(2)}
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

      {/* Student Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {studentStats.currentGPA.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {studentStats.currentGPA >= 3.5 ? '+0.2 from last semester' : 'Keep up the good work!'}
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
              {studentStats.attendanceRate}%
            </div>
            <Progress value={studentStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {studentStats.completedAssignments}/{studentStats.totalAssignments}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((studentStats.completedAssignments / studentStats.totalAssignments) * 100)}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {studentStats.enrolledCourses}
            </div>
            <p className="text-xs text-muted-foreground">
              {studentStats.creditsEarned} credits earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
              Today's Classes
            </CardTitle>
            <CardDescription>
              Your schedule for {currentTime.toLocaleDateString()}
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
                      {cls.instructorName}
                    </p>
                  </div>
                  {cls.status === 'current' && (
                    <Button size="sm" style={{ backgroundColor: '#36BA91' }}>
                      <PlayCircle className="mr-1 h-3 w-3" />
                      Join Class
                    </Button>
                  )}
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

        {/* Assignments Due */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
              Assignments Due
            </CardTitle>
            <CardDescription>
              Upcoming assignments and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignmentsDue.length > 0 ? (
              assignmentsDue.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{assignment.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {assignment.courseName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`text-xs ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('-', ' ')}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>All caught up! No assignments due soon.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Grades and Progress */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
              Recent Grades
            </CardTitle>
            <CardDescription>
              Your latest assignment results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentGrades.length > 0 ? (
              recentGrades.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{grade.assignmentName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {grade.courseName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Graded: {new Date(grade.gradedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: grade.percentage >= 80 ? '#36BA91' : grade.percentage >= 70 ? '#F39C12' : '#E74C3C' }}>
                      {grade.letterGrade}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {grade.grade}/{grade.maxPoints} ({grade.percentage}%)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No recent grades available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
              Progress Overview
            </CardTitle>
            <CardDescription>
              Your academic progress summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall GPA</span>
                <span className="font-medium">{studentStats.currentGPA.toFixed(2)}/4.0</span>
              </div>
              <Progress value={(studentStats.currentGPA / 4.0) * 100} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attendance Rate</span>
                <span className="font-medium">{studentStats.attendanceRate}%</span>
              </div>
              <Progress value={studentStats.attendanceRate} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Assignment Completion</span>
                <span className="font-medium">
                  {Math.round((studentStats.completedAssignments / studentStats.totalAssignments) * 100)}%
                </span>
              </div>
              <Progress value={(studentStats.completedAssignments / studentStats.totalAssignments) * 100} />
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
                    {studentStats.creditsEarned}
                  </div>
                  <p className="text-xs text-muted-foreground">Credits Earned</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: studentStats.overdueTasks > 0 ? '#E74C3C' : '#36BA91' }}>
                    {studentStats.overdueTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">Overdue Tasks</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used features and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Submit Assignment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Award className="h-6 w-6" />
              <span className="text-sm">View Grades</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Class Schedule</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Study Groups</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudentDashboard
