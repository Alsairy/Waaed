import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  BarChart3, 
  Download, 
  Users,
  Clock,
  Award,
  Target,
  CheckCircle,
  AlertCircle,
  FileText,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'

interface StudentProgress {
  studentId: string
  studentName: string
  email: string
  grade: string
  overallGPA: number
  semesterGPA: number
  creditsCompleted: number
  creditsInProgress: number
  totalCreditsRequired: number
  attendanceRate: number
  courseProgress: CourseProgress[]
  academicStanding: 'excellent' | 'good' | 'satisfactory' | 'probation' | 'warning'
  lastUpdated: string
}

interface CourseProgress {
  courseId: string
  courseName: string
  courseCode: string
  instructor: string
  currentGrade: number
  letterGrade: string
  credits: number
  completionRate: number
  attendanceRate: number
  assignmentsCompleted: number
  totalAssignments: number
  lastActivity: string
  status: 'on_track' | 'behind' | 'at_risk' | 'completed'
}

interface AcademicMilestone {
  id: string
  title: string
  description: string
  targetDate: string
  completionDate?: string
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue'
  category: 'assignment' | 'exam' | 'project' | 'graduation' | 'enrollment'
  courseId?: string
  courseName?: string
}

interface ProgressFilters {
  grade: string
  academicStanding: string
  course: string
  searchTerm: string
}

interface ProgressStats {
  totalStudents: number
  onTrackStudents: number
  atRiskStudents: number
  averageGPA: number
  averageAttendance: number
}

const ProgressReportsPage: React.FC = () => {
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([])
  const [milestones, setMilestones] = useState<AcademicMilestone[]>([])
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    totalStudents: 0,
    onTrackStudents: 0,
    atRiskStudents: 0,
    averageGPA: 0,
    averageAttendance: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [,] = useState<ProgressFilters>({
    grade: '',
    academicStanding: '',
    course: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      setIsLoading(true)
      
      const mockStudentProgress: StudentProgress[] = [
        {
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          email: 'ahmed.alrashid@student.waaed.edu',
          grade: '11',
          overallGPA: 3.2,
          semesterGPA: 3.4,
          creditsCompleted: 45,
          creditsInProgress: 18,
          totalCreditsRequired: 120,
          attendanceRate: 92,
          academicStanding: 'good',
          lastUpdated: '2024-01-30T10:00:00',
          courseProgress: [
            {
              courseId: 'MATH201',
              courseName: 'Advanced Mathematics',
              courseCode: 'MATH201',
              instructor: 'Dr. Sarah Johnson',
              currentGrade: 85,
              letterGrade: 'B+',
              credits: 4,
              completionRate: 75,
              attendanceRate: 95,
              assignmentsCompleted: 6,
              totalAssignments: 8,
              lastActivity: '2024-01-29T14:30:00',
              status: 'on_track'
            }
          ]
        }
      ]

      const mockMilestones: AcademicMilestone[] = [
        {
          id: '1',
          title: 'Midterm Examinations',
          description: 'Midterm exams for all courses',
          targetDate: '2024-03-15',
          status: 'upcoming',
          category: 'exam'
        }
      ]

      setStudentProgress(mockStudentProgress)
      setMilestones(mockMilestones)

      const stats: ProgressStats = {
        totalStudents: mockStudentProgress.length,
        onTrackStudents: mockStudentProgress.filter(s => 
          s.courseProgress.every(c => c.status === 'on_track' || c.status === 'completed')
        ).length,
        atRiskStudents: mockStudentProgress.filter(s => 
          s.academicStanding === 'probation' || s.academicStanding === 'warning' ||
          s.courseProgress.some(c => c.status === 'at_risk')
        ).length,
        averageGPA: mockStudentProgress.reduce((sum, s) => sum + s.semesterGPA, 0) / mockStudentProgress.length,
        averageAttendance: mockStudentProgress.reduce((sum, s) => sum + s.attendanceRate, 0) / mockStudentProgress.length
      }
      setProgressStats(stats)

    } catch {
      toast.error('Failed to load progress data')
    } finally {
      setIsLoading(false)
    }
  }

  const getAcademicStandingColor = (standing: string) => {
    switch (standing) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'satisfactory': return 'bg-yellow-100 text-yellow-800'
      case 'probation': return 'bg-orange-100 text-orange-800'
      case 'warning': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800'
      case 'behind': return 'bg-yellow-100 text-yellow-800'
      case 'at_risk': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'upcoming': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGradeColor = (gpa: number) => {
    if (gpa >= 3.5) return '#36BA91'
    if (gpa >= 3.0) return '#F39C12'
    if (gpa >= 2.5) return '#E67E22'
    return '#E74C3C'
  }

  const handleGenerateReport = async (type: 'individual' | 'class' | 'detailed') => {
    try {
      switch (type) {
        case 'individual':
          toast.success('Individual progress reports generated')
          break
        case 'class':
          toast.success('Class progress report generated')
          break
        case 'detailed':
          toast.success('Detailed analytics report generated')
          break
      }
    } catch {
      toast.error(`Failed to generate ${type} report`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Progress Reports
          </h1>
          <p className="text-muted-foreground">
            Track student academic progress, milestones, and performance analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => handleGenerateReport('class')}>
            <Download className="mr-2 h-4 w-4" />
            Class Report
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }} onClick={() => handleGenerateReport('detailed')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {progressStats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {progressStats.onTrackStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Students on track
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
              {progressStats.atRiskStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getGradeColor(progressStats.averageGPA) }}>
              {progressStats.averageGPA.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Class average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {progressStats.averageAttendance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average attendance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Progress</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Academic Standing Distribution and other overview content */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Academic Standing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['excellent', 'good', 'satisfactory', 'probation', 'warning'].map((standing) => {
                    const count = studentProgress.filter(s => s.academicStanding === standing).length
                    const percentage = (count / (studentProgress.length || 1)) * 100
                    return (
                      <div key={standing} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getAcademicStandingColor(standing)}>
                            {standing}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm font-medium w-12">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                  Course Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Course performance metrics will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Overview</CardTitle>
              <CardDescription>
                Detailed view of individual student academic progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading progress data...</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Student progress details will be displayed here</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                Academic Milestones
              </CardTitle>
              <CardDescription>
                Track important academic deadlines and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4" />
                      <div>
                        <h4 className="font-medium">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Target Date</p>
                          <p className="font-medium">{new Date(milestone.targetDate).toLocaleDateString()}</p>
                        </div>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed analytics and performance metrics will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProgressReportsPage
