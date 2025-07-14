import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { 
  BookOpen, 
  Calendar, 
  TrendingUp,
  Clock,
  FileText,
  Users,
  AlertCircle,
  Star
} from 'lucide-react'
import { useAuth } from '../../contexts/auth-utils'
import { sisService } from '../../services/sisService'
import { assignmentsService } from '../../services/assignmentsService'
import { gradesService } from '../../services/gradesService'
import { academicCalendarService } from '../../services/academicCalendarService'
import { toast } from 'sonner'

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
  status: 'in-progress' | 'not-started' | 'submitted'
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

const StudentDashboard = () => {
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
  const [loading, setLoading] = useState(true)


  const calculateGPA = (grades: { grade: number; gradePoints?: number; credits?: number }[]) => {
    if (grades.length === 0) return 0
    const totalPoints = grades.reduce((sum, grade) => sum + (grade.gradePoints || grade.grade || 0), 0)
    return totalPoints / grades.length
  }

  const filterTodayClasses = (schedule: { 
    id?: string; 
    startTime: string; 
    endTime: string; 
    dayOfWeek: string | number; 
    courseName?: string; 
    courseCode?: string; 
    location?: string; 
    instructorName?: string; 
  }[]) => {
    const today = new Date().getDay()
    return schedule.filter(cls => cls.dayOfWeek === today || cls.dayOfWeek === today.toString()).map(cls => ({
      id: cls.id || '',
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


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'current': return 'bg-green-100 text-green-800'
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

  const getCurrentSemester = () => {
    const month = new Date().getMonth()
    if (month >= 8 || month <= 0) return 'Fall'
    if (month >= 1 && month <= 4) return 'Spring'
    return 'Summer'
  }

  const getAssignmentStatus = (): 'not-started' | 'in-progress' | 'submitted' | 'overdue' => {
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

  const loadStudentData = async () => {
    try {
      const today = new Date()
      const semester = getCurrentSemester()
      const year = today.getFullYear()
      
      const enrollments = await sisService.getEnrollments(user?.id || '')
      const grades = await gradesService.getStudentGrades(user?.id || '')
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
        creditsEarned: enrollments.reduce((sum: number, e: { credits?: number }) => sum + (e.credits || 0), 0),
      })

      const schedule = await academicCalendarService.getStudentSchedule(
        user?.id || '', 
        semester, 
        year
      )
      const todaySchedule = filterTodayClasses(schedule)
      setTodayClasses(todaySchedule)

      const upcomingAssignments = await assignmentsService.getUpcomingAssignments(user?.id || '')
      const assignmentsDueData = upcomingAssignments.slice(0, 5).map((assignment: { id: string; title: string; courseName?: string; dueDate: string }) => ({
        id: assignment.id,
        title: assignment.title,
        courseName: assignment.courseName || 'Unknown Course',
        dueDate: assignment.dueDate,
        status: getAssignmentStatus() as 'in-progress' | 'not-started' | 'submitted',
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

    } catch (error) {
      console.error('Error loading student data:', error)
      toast.error('Failed to load dashboard data')
      
      setStudentStats({
        currentGPA: 3.2,
        attendanceRate: 94.5,
        completedAssignments: 15,
        totalAssignments: 20,
        enrolledCourses: 5,
        upcomingExams: 3,
        overdueTasks: 2,
        creditsEarned: 18,
      })
      
      const mockSchedule = [
        {
          id: '1',
          startTime: '09:00',
          endTime: '10:00',
          dayOfWeek: new Date().getDay(),
          courseName: 'Mathematics 10A',
          courseCode: 'MATH10A',
          location: 'Room 201',
          instructorName: 'Dr. Sarah Johnson'
        },
        {
          id: '2',
          startTime: '11:00',
          endTime: '12:00',
          dayOfWeek: new Date().getDay(),
          courseName: 'Physics 11B',
          courseCode: 'PHYS11B',
          location: 'Room 305',
          instructorName: 'Prof. Ahmed Ali'
        }
      ]
      const todaySchedule = filterTodayClasses(mockSchedule)
      setTodayClasses(todaySchedule)

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
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          status: 'in-progress',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Physics Lab Report',
          courseName: 'Physics 11B',
          dueDate: new Date(Date.now() + 259200000).toISOString(),
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
    }
  }

  useEffect(() => {
    loadStudentData()
    
    const interval = setInterval(() => {
      loadStudentData()
    }, 300000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.email || 'Student'}!</p>
        </div>
        <Button onClick={loadStudentData} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.currentGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +0.1 from last semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.attendanceRate}%</div>
            <Progress value={studentStats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStats.completedAssignments}/{studentStats.totalAssignments}
            </div>
            <Progress 
              value={(studentStats.completedAssignments / studentStats.totalAssignments) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground">
              {studentStats.creditsEarned} credits earned
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayClasses.length > 0 ? (
                todayClasses.map((classItem) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{classItem.courseName}</h4>
                      <p className="text-sm text-gray-600">{classItem.courseCode} • {classItem.room}</p>
                      <p className="text-sm text-gray-500">{classItem.instructorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{classItem.startTime} - {classItem.endTime}</p>
                      <Badge className={getStatusColor(classItem.status)}>
                        {classItem.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Assignments Due
            </CardTitle>
            <CardDescription>Upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignmentsDue.length > 0 ? (
                assignmentsDue.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{assignment.title}</h4>
                      <p className="text-sm text-gray-600">{assignment.courseName}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge className={getPriorityColor(assignment.priority)}>
                        {assignment.priority}
                      </Badge>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No assignments due soon</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recent Grades
          </CardTitle>
          <CardDescription>Your latest assignment results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGrades.length > 0 ? (
              recentGrades.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{grade.assignmentName}</h4>
                    <p className="text-sm text-gray-600">{grade.courseName}</p>
                    <p className="text-sm text-gray-500">
                      Graded: {new Date(grade.gradedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{grade.letterGrade}</div>
                    <p className="text-sm text-gray-600">
                      {grade.grade}/{grade.maxPoints} ({grade.percentage}%)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent grades available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default StudentDashboard
