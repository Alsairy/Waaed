import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  Search, 
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Save,
  Users,
  BarChart3,
  TrendingUp,
  Star,
  CheckCircle,
  Calculator,
  FileText,
  Settings,
  Mail,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'

interface GradeEntry {
  id: string
  studentId: string
  studentName: string
  assignmentId: string
  assignmentTitle: string
  assignmentType: 'homework' | 'quiz' | 'exam' | 'project' | 'lab'
  maxPoints: number
  earnedPoints?: number
  percentage?: number
  letterGrade?: string
  status: 'not_submitted' | 'submitted' | 'graded' | 'late' | 'excused'
  submissionDate?: string
  gradedDate?: string
  feedback?: string
  rubricScores?: RubricScore[]
}

interface RubricScore {
  criteriaId: string
  criteriaName: string
  maxPoints: number
  earnedPoints: number
  feedback?: string
}

interface StudentGradeSummary {
  studentId: string
  studentName: string
  email: string
  currentGrade: number
  letterGrade: string
  totalPoints: number
  earnedPoints: number
  assignmentCount: number
  submissionRate: number
  lastActivity: string
  trend: 'improving' | 'declining' | 'stable'
}

interface Assignment {
  id: string
  title: string
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'lab'
  maxPoints: number
  dueDate: string
  category: string
  weight: number
  isPublished: boolean
}

interface GradeBookFilters {
  assignment: string
  student: string
  status: string
  searchTerm: string
}

interface GradeBookStats {
  totalStudents: number
  totalAssignments: number
  averageGrade: number
  submissionRate: number
  gradingProgress: number
}

const GradeBookPage: React.FC = () => {
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [students, setStudents] = useState<StudentGradeSummary[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [gradeBookStats, setGradeBookStats] = useState<GradeBookStats>({
    totalStudents: 0,
    totalAssignments: 0,
    averageGrade: 0,
    submissionRate: 0,
    gradingProgress: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('gradebook')
  const [filters, setFilters] = useState<GradeBookFilters>({
    assignment: '',
    student: '',
    status: '',
    searchTerm: ''
  })
  const [selectedCourse, setSelectedCourse] = useState('MATH201')
  const [editingGrade, setEditingGrade] = useState<string | null>(null)
  const [gradeInput, setGradeInput] = useState('')

  useEffect(() => {
    loadGradeBookData()
  }, [selectedCourse])

  const loadGradeBookData = async () => {
    try {
      setIsLoading(true)
      
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Calculus Problem Set 1',
          type: 'homework',
          maxPoints: 100,
          dueDate: '2024-02-15',
          category: 'Homework',
          weight: 0.3,
          isPublished: true
        },
        {
          id: '2',
          title: 'Midterm Exam',
          type: 'exam',
          maxPoints: 200,
          dueDate: '2024-03-15',
          category: 'Exams',
          weight: 0.4,
          isPublished: true
        },
        {
          id: '3',
          title: 'Linear Algebra Quiz',
          type: 'quiz',
          maxPoints: 50,
          dueDate: '2024-02-28',
          category: 'Quizzes',
          weight: 0.2,
          isPublished: true
        },
        {
          id: '4',
          title: 'Final Project',
          type: 'project',
          maxPoints: 150,
          dueDate: '2024-05-10',
          category: 'Projects',
          weight: 0.1,
          isPublished: false
        }
      ]

      const mockGrades: GradeEntry[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          assignmentId: '1',
          assignmentTitle: 'Calculus Problem Set 1',
          assignmentType: 'homework',
          maxPoints: 100,
          earnedPoints: 85,
          percentage: 85,
          letterGrade: 'B+',
          status: 'graded',
          submissionDate: '2024-02-14T20:30:00',
          gradedDate: '2024-02-16T10:15:00',
          feedback: 'Good work overall. Need to show more steps in problem 3.'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          assignmentId: '1',
          assignmentTitle: 'Calculus Problem Set 1',
          assignmentType: 'homework',
          maxPoints: 100,
          earnedPoints: 92,
          percentage: 92,
          letterGrade: 'A-',
          status: 'graded',
          submissionDate: '2024-02-15T22:15:00',
          gradedDate: '2024-02-16T11:30:00',
          feedback: 'Excellent work! Clear explanations and correct solutions.'
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Omar Hassan',
          assignmentId: '1',
          assignmentTitle: 'Calculus Problem Set 1',
          assignmentType: 'homework',
          maxPoints: 100,
          earnedPoints: 78,
          percentage: 78,
          letterGrade: 'C+',
          status: 'graded',
          submissionDate: '2024-02-16T23:45:00',
          gradedDate: '2024-02-17T09:20:00',
          feedback: 'Late submission. Review derivative rules for better accuracy.'
        },
        {
          id: '4',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          assignmentId: '3',
          assignmentTitle: 'Linear Algebra Quiz',
          assignmentType: 'quiz',
          maxPoints: 50,
          earnedPoints: 42,
          percentage: 84,
          letterGrade: 'B',
          status: 'graded',
          submissionDate: '2024-02-28T14:30:00',
          gradedDate: '2024-02-28T16:00:00',
          feedback: 'Good understanding of matrix operations.'
        },
        {
          id: '5',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          assignmentId: '3',
          assignmentTitle: 'Linear Algebra Quiz',
          assignmentType: 'quiz',
          maxPoints: 50,
          earnedPoints: 48,
          percentage: 96,
          letterGrade: 'A',
          status: 'graded',
          submissionDate: '2024-02-28T14:15:00',
          gradedDate: '2024-02-28T15:45:00',
          feedback: 'Perfect execution of vector calculations.'
        },
        {
          id: '6',
          studentId: 'STU003',
          studentName: 'Omar Hassan',
          assignmentId: '2',
          assignmentTitle: 'Midterm Exam',
          assignmentType: 'exam',
          maxPoints: 200,
          status: 'submitted',
          submissionDate: '2024-03-15T11:00:00'
        }
      ]

      const mockStudents: StudentGradeSummary[] = [
        {
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          email: 'ahmed.alrashid@student.waaed.edu',
          currentGrade: 84.5,
          letterGrade: 'B',
          totalPoints: 150,
          earnedPoints: 127,
          assignmentCount: 2,
          submissionRate: 100,
          lastActivity: '2024-02-28T14:30:00',
          trend: 'stable'
        },
        {
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          email: 'layla.mahmoud@student.waaed.edu',
          currentGrade: 94,
          letterGrade: 'A',
          totalPoints: 150,
          earnedPoints: 140,
          assignmentCount: 2,
          submissionRate: 100,
          lastActivity: '2024-02-28T14:15:00',
          trend: 'improving'
        },
        {
          studentId: 'STU003',
          studentName: 'Omar Hassan',
          email: 'omar.hassan@student.waaed.edu',
          currentGrade: 78,
          letterGrade: 'C+',
          totalPoints: 300,
          earnedPoints: 78,
          assignmentCount: 2,
          submissionRate: 67,
          lastActivity: '2024-03-15T11:00:00',
          trend: 'declining'
        }
      ]

      setAssignments(mockAssignments)
      setGrades(mockGrades)
      setStudents(mockStudents)

      const stats: GradeBookStats = {
        totalStudents: mockStudents.length,
        totalAssignments: mockAssignments.filter(a => a.isPublished).length,
        averageGrade: mockStudents.reduce((sum, s) => sum + s.currentGrade, 0) / mockStudents.length,
        submissionRate: mockStudents.reduce((sum, s) => sum + s.submissionRate, 0) / mockStudents.length,
        gradingProgress: (mockGrades.filter(g => g.status === 'graded').length / mockGrades.length) * 100
      }
      setGradeBookStats(stats)

    } catch (error) {
      console.error('Error loading gradebook data:', error)
      toast.error('Failed to load gradebook data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800'
      case 'submitted': return 'bg-yellow-100 text-yellow-800'
      case 'late': return 'bg-orange-100 text-orange-800'
      case 'not_submitted': return 'bg-red-100 text-red-800'
      case 'excused': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#36BA91'
    if (percentage >= 80) return '#F39C12'
    if (percentage >= 70) return '#E67E22'
    return '#E74C3C'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
      case 'stable': return <TrendingUp className="h-4 w-4 text-gray-500 rotate-90" />
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />
    }
  }

  const handleGradeEdit = (gradeId: string, currentGrade: number) => {
    setEditingGrade(gradeId)
    setGradeInput(currentGrade.toString())
  }

  const handleGradeSave = async (gradeId: string) => {
    try {
      const newGrade = parseFloat(gradeInput)
      if (isNaN(newGrade) || newGrade < 0 || newGrade > 100) {
        toast.error('Please enter a valid grade between 0 and 100')
        return
      }

      setGrades(prev => prev.map(grade => 
        grade.id === gradeId 
          ? { 
              ...grade, 
              earnedPoints: (grade.maxPoints * newGrade) / 100,
              percentage: newGrade,
              letterGrade: getLetterGrade(newGrade),
              status: 'graded' as const,
              gradedDate: new Date().toISOString()
            }
          : grade
      ))

      setEditingGrade(null)
      setGradeInput('')
      toast.success('Grade updated successfully')
    } catch (error) {
      console.error('Grade update error:', error)
      toast.error('Failed to update grade')
    }
  }

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 97) return 'A+'
    if (percentage >= 93) return 'A'
    if (percentage >= 90) return 'A-'
    if (percentage >= 87) return 'B+'
    if (percentage >= 83) return 'B'
    if (percentage >= 80) return 'B-'
    if (percentage >= 77) return 'C+'
    if (percentage >= 73) return 'C'
    if (percentage >= 70) return 'C-'
    if (percentage >= 67) return 'D+'
    if (percentage >= 63) return 'D'
    if (percentage >= 60) return 'D-'
    return 'F'
  }

  const handleBulkAction = async (action: 'export' | 'email' | 'publish') => {
    try {
      switch (action) {
        case 'export':
          toast.success('Gradebook exported successfully')
          break
        case 'email':
          toast.success('Grade reports sent to students')
          break
        case 'publish':
          toast.success('Grades published to students')
          break
      }
    } catch (error) {
      console.error('Bulk action error:', error)
      toast.error(`Failed to ${action} grades`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Grade Book
          </h1>
          <p className="text-muted-foreground">
            Manage grades, track student progress, and generate reports
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="MATH201">MATH201 - Advanced Mathematics</option>
            <option value="PHYS101">PHYS101 - General Physics</option>
            <option value="ENG201">ENG201 - English Literature</option>
            <option value="CS101">CS101 - Computer Science</option>
          </select>
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }} onClick={() => handleBulkAction('publish')}>
            <Upload className="mr-2 h-4 w-4" />
            Publish Grades
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
              {gradeBookStats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {gradeBookStats.totalAssignments}
            </div>
            <p className="text-xs text-muted-foreground">
              Published assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {gradeBookStats.averageGrade.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submission Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {gradeBookStats.submissionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              On-time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grading Progress</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {gradeBookStats.gradingProgress.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Graded submissions
            </p>
            <Progress value={gradeBookStats.gradingProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gradebook">Grade Book</TabsTrigger>
          <TabsTrigger value="students">Student Summary</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="gradebook" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filter Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filters.assignment}
                  onChange={(e) => setFilters(prev => ({ ...prev, assignment: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Assignments</option>
                  {assignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Status</option>
                  <option value="graded">Graded</option>
                  <option value="submitted">Submitted</option>
                  <option value="not_submitted">Not Submitted</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>

                <Button variant="outline" onClick={() => setFilters({ assignment: '', student: '', status: '', searchTerm: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Grade Book Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Grade Entries</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                    <Mail className="mr-1 h-3 w-3" />
                    Email Reports
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="mr-1 h-3 w-3" />
                    Grade Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading grades...</p>
                  </div>
                ) : (
                  grades.map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{grade.studentName}</h4>
                          <Badge className={getStatusColor(grade.status)}>
                            {grade.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {grade.assignmentTitle} ({grade.assignmentType})
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>Max Points: {grade.maxPoints}</span>
                          {grade.submissionDate && (
                            <span>Submitted: {new Date(grade.submissionDate).toLocaleDateString()}</span>
                          )}
                          {grade.gradedDate && (
                            <span>Graded: {new Date(grade.gradedDate).toLocaleDateString()}</span>
                          )}
                        </div>
                        {grade.feedback && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Feedback: {grade.feedback}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {grade.status === 'graded' && grade.percentage !== undefined ? (
                          <div className="flex items-center space-x-3">
                            {editingGrade === grade.id ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={gradeInput}
                                  onChange={(e) => setGradeInput(e.target.value)}
                                  className="w-20"
                                  min="0"
                                  max="100"
                                />
                                <Button size="sm" onClick={() => handleGradeSave(grade.id)}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingGrade(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div className="text-lg font-bold" style={{ color: getGradeColor(grade.percentage) }}>
                                    {grade.percentage}%
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {grade.letterGrade} ({grade.earnedPoints}/{grade.maxPoints})
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleGradeEdit(grade.id, grade.percentage || 0)}>
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        ) : grade.status === 'submitted' ? (
                          <Button size="sm" style={{ backgroundColor: '#36BA91' }} onClick={() => handleGradeEdit(grade.id, 0)}>
                            Grade
                          </Button>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {grade.status === 'not_submitted' ? 'Not Submitted' : 'Pending'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {grades.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No grades found for the selected course</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Grade Summary</CardTitle>
              <CardDescription>
                Overview of each student's performance and progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-medium">
                        {student.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium">{student.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Last Activity: {new Date(student.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Grade</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold" style={{ color: getGradeColor(student.currentGrade) }}>
                              {student.currentGrade}%
                            </span>
                            <span className="text-sm text-muted-foreground">({student.letterGrade})</span>
                            {getTrendIcon(student.trend)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Points</p>
                          <p className="font-medium">{student.earnedPoints}/{student.totalPoints}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Submission Rate</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={student.submissionRate} className="w-16" />
                            <span className="text-sm font-medium">{student.submissionRate}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D', 'F'].map((grade) => {
                    const count = students.filter(s => s.letterGrade.startsWith(grade)).length
                    const percentage = (count / students.length) * 100
                    return (
                      <div key={grade} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{grade} Grade</span>
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

            {/* Assignment Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
                  Assignment Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {assignments.filter(a => a.isPublished).map((assignment) => {
                    const assignmentGrades = grades.filter(g => g.assignmentId === assignment.id && g.status === 'graded')
                    const avgScore = assignmentGrades.length > 0 
                      ? assignmentGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / assignmentGrades.length 
                      : 0
                    return (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{assignment.title}</span>
                          <p className="text-xs text-muted-foreground">{assignment.type}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium" style={{ color: getGradeColor(avgScore) }}>
                            {avgScore.toFixed(1)}%
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {assignmentGrades.length}/{students.length} graded
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Class Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
                    {students.filter(s => s.trend === 'improving').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Improving</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
                    {students.filter(s => s.trend === 'stable').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Stable</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#E74C3C' }}>
                    {students.filter(s => s.trend === 'declining').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Declining</p>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
                    {students.filter(s => s.submissionRate < 80).length}
                  </div>
                  <p className="text-sm text-muted-foreground">At Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GradeBookPage
