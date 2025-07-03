import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  Upload,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Star,
  Settings,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'

interface Assignment {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  courseCode: string
  instructorId: string
  instructorName: string
  type: 'homework' | 'quiz' | 'exam' | 'project' | 'lab'
  status: 'draft' | 'published' | 'closed' | 'graded'
  dueDate: string
  publishDate: string
  maxPoints: number
  submissionCount: number
  gradedCount: number
  averageScore: number
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number
  allowLateSubmission: boolean
  instructions?: string
  attachments?: string[]
}

interface Submission {
  id: string
  assignmentId: string
  studentId: string
  studentName: string
  submissionDate: string
  status: 'submitted' | 'late' | 'graded' | 'returned'
  score?: number
  feedback?: string
  attachments?: string[]
  attempts: number
}

interface AssignmentFilters {
  course: string
  status: string
  type: string
  searchTerm: string
}

interface AssignmentStats {
  totalAssignments: number
  publishedAssignments: number
  totalSubmissions: number
  averageScore: number
  pendingGrading: number
}

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats>({
    totalAssignments: 0,
    publishedAssignments: 0,
    totalSubmissions: 0,
    averageScore: 0,
    pendingGrading: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('assignments')
  const [filters, setFilters] = useState<AssignmentFilters>({
    course: '',
    status: '',
    type: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadAssignments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [assignments, filters])

  const loadAssignments = async () => {
    try {
      setIsLoading(true)
      
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Calculus Problem Set 1',
          description: 'Solve problems related to limits, derivatives, and basic integration',
          courseId: 'MATH201',
          courseName: 'Advanced Mathematics',
          courseCode: 'MATH201',
          instructorId: 'INS001',
          instructorName: 'Dr. Sarah Johnson',
          type: 'homework',
          status: 'published',
          dueDate: '2024-02-15T23:59:00',
          publishDate: '2024-01-15T09:00:00',
          maxPoints: 100,
          submissionCount: 25,
          gradedCount: 20,
          averageScore: 82,
          difficulty: 'medium',
          estimatedTime: 120,
          allowLateSubmission: true,
          instructions: 'Complete all problems showing your work. Late submissions will be penalized 10% per day.',
          attachments: ['problem_set_1.pdf', 'formula_sheet.pdf']
        },
        {
          id: '2',
          title: 'Physics Lab Report',
          description: 'Analyze experimental data from the pendulum motion lab',
          courseId: 'PHYS101',
          courseName: 'General Physics',
          courseCode: 'PHYS101',
          instructorId: 'INS002',
          instructorName: 'Prof. Ahmed Hassan',
          type: 'lab',
          status: 'published',
          dueDate: '2024-02-20T23:59:00',
          publishDate: '2024-01-20T09:00:00',
          maxPoints: 150,
          submissionCount: 22,
          gradedCount: 15,
          averageScore: 88,
          difficulty: 'hard',
          estimatedTime: 180,
          allowLateSubmission: false,
          instructions: 'Submit a complete lab report including data analysis, graphs, and conclusions.'
        },
        {
          id: '3',
          title: 'Literature Essay',
          description: 'Critical analysis of themes in contemporary Arabic literature',
          courseId: 'ENG201',
          courseName: 'English Literature',
          courseCode: 'ENG201',
          instructorId: 'INS003',
          instructorName: 'Ms. Jennifer Smith',
          type: 'project',
          status: 'published',
          dueDate: '2024-03-01T23:59:00',
          publishDate: '2024-02-01T09:00:00',
          maxPoints: 200,
          submissionCount: 18,
          gradedCount: 10,
          averageScore: 85,
          difficulty: 'hard',
          estimatedTime: 300,
          allowLateSubmission: true,
          instructions: 'Write a 2000-word essay analyzing themes in at least three works.'
        },
        {
          id: '4',
          title: 'Programming Quiz 1',
          description: 'Basic programming concepts and syntax',
          courseId: 'CS101',
          courseName: 'Computer Science Fundamentals',
          courseCode: 'CS101',
          instructorId: 'INS004',
          instructorName: 'Dr. Omar Al-Rashid',
          type: 'quiz',
          status: 'published',
          dueDate: '2024-02-10T14:00:00',
          publishDate: '2024-02-10T13:00:00',
          maxPoints: 50,
          submissionCount: 30,
          gradedCount: 30,
          averageScore: 86,
          difficulty: 'easy',
          estimatedTime: 60,
          allowLateSubmission: false,
          instructions: 'Complete the quiz within the time limit. No late submissions accepted.'
        },
        {
          id: '5',
          title: 'Midterm Examination',
          description: 'Comprehensive exam covering first half of semester',
          courseId: 'MATH201',
          courseName: 'Advanced Mathematics',
          courseCode: 'MATH201',
          instructorId: 'INS001',
          instructorName: 'Dr. Sarah Johnson',
          type: 'exam',
          status: 'draft',
          dueDate: '2024-03-15T11:00:00',
          publishDate: '2024-03-15T09:00:00',
          maxPoints: 300,
          submissionCount: 0,
          gradedCount: 0,
          averageScore: 0,
          difficulty: 'hard',
          estimatedTime: 120,
          allowLateSubmission: false,
          instructions: 'Closed book exam. Calculators allowed.'
        }
      ]

      const mockSubmissions: Submission[] = [
        {
          id: '1',
          assignmentId: '1',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          submissionDate: '2024-02-14T20:30:00',
          status: 'graded',
          score: 85,
          feedback: 'Good work overall. Need to show more steps in problem 3.',
          attempts: 1
        },
        {
          id: '2',
          assignmentId: '1',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          submissionDate: '2024-02-15T22:15:00',
          status: 'graded',
          score: 92,
          feedback: 'Excellent work! Clear explanations and correct solutions.',
          attempts: 1
        },
        {
          id: '3',
          assignmentId: '2',
          studentId: 'STU003',
          studentName: 'Omar Hassan',
          submissionDate: '2024-02-19T18:45:00',
          status: 'submitted',
          attempts: 1
        }
      ]

      setAssignments(mockAssignments)
      setSubmissions(mockSubmissions)

      const stats: AssignmentStats = {
        totalAssignments: mockAssignments.length,
        publishedAssignments: mockAssignments.filter(a => a.status === 'published').length,
        totalSubmissions: mockAssignments.reduce((sum, a) => sum + a.submissionCount, 0),
        averageScore: mockAssignments.filter(a => a.averageScore > 0).reduce((sum, a) => sum + a.averageScore, 0) / mockAssignments.filter(a => a.averageScore > 0).length,
        pendingGrading: mockAssignments.reduce((sum, a) => sum + (a.submissionCount - a.gradedCount), 0)
      }
      setAssignmentStats(stats)

    } catch {
      toast.error('Failed to load assignments')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = assignments

    if (filters.course) {
      filtered = filtered.filter(assignment => assignment.courseCode === filters.course)
    }

    if (filters.status) {
      filtered = filtered.filter(assignment => assignment.status === filters.status)
    }

    if (filters.type) {
      filtered = filtered.filter(assignment => assignment.type === filters.type)
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(searchLower) ||
        assignment.description.toLowerCase().includes(searchLower) ||
        assignment.courseName.toLowerCase().includes(searchLower) ||
        assignment.instructorName.toLowerCase().includes(searchLower)
      )
    }

    setFilteredAssignments(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'graded': return 'bg-blue-100 text-blue-800'
      case 'submitted': return 'bg-yellow-100 text-yellow-800'
      case 'late': return 'bg-orange-100 text-orange-800'
      case 'returned': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'homework': return 'bg-blue-100 text-blue-800'
      case 'quiz': return 'bg-green-100 text-green-800'
      case 'exam': return 'bg-red-100 text-red-800'
      case 'project': return 'bg-purple-100 text-purple-800'
      case 'lab': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#36BA91'
    if (score >= 80) return '#F39C12'
    if (score >= 70) return '#E67E22'
    return '#E74C3C'
  }

  const handleAssignmentAction = async (action: 'publish' | 'close' | 'duplicate' | 'delete') => {
    try {
      switch (action) {
        case 'publish':
          toast.success('Assignment published successfully')
          break
        case 'close':
          toast.success('Assignment closed successfully')
          break
        case 'duplicate':
          toast.success('Assignment duplicated successfully')
          break
        case 'delete':
          toast.success('Assignment deleted successfully')
          break
      }
      loadAssignments()
    } catch {
      toast.error(`Failed to ${action} assignment`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Assignment Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and grade assignments across all courses
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Assignments
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {assignmentStats.totalAssignments}
            </div>
            <p className="text-xs text-muted-foreground">
              All assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {assignmentStats.publishedAssignments}
            </div>
            <p className="text-xs text-muted-foreground">
              Active assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {assignmentStats.totalSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">
              Total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#E67E22' }}>
              {assignmentStats.pendingGrading}
            </div>
            <p className="text-xs text-muted-foreground">
              Need grading
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {assignmentStats.averageScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filter Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assignments..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filters.course}
                  onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Courses</option>
                  <option value="MATH201">MATH201</option>
                  <option value="PHYS101">PHYS101</option>
                  <option value="ENG201">ENG201</option>
                  <option value="CS101">CS101</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                  <option value="graded">Graded</option>
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Types</option>
                  <option value="homework">Homework</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                  <option value="lab">Lab</option>
                </select>

                <Button variant="outline" onClick={() => setFilters({ course: '', status: '', type: '', searchTerm: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assignments List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading assignments...</p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                          <Badge className={getTypeColor(assignment.type)}>
                            {assignment.type}
                          </Badge>
                          <Badge className={getDifficultyColor(assignment.difficulty)}>
                            {assignment.difficulty}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {assignment.courseName} ({assignment.courseCode}) • {assignment.instructorName}
                        </CardDescription>
                        <p className="text-sm text-muted-foreground mt-2">
                          {assignment.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Due Date</span>
                        <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(assignment.dueDate).toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Points</span>
                        <p className="font-medium">{assignment.maxPoints}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Submissions</span>
                        <p className="font-medium">{assignment.submissionCount}</p>
                        <p className="text-xs text-muted-foreground">Graded: {assignment.gradedCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Average Score</span>
                        <p className="font-medium" style={{ color: getScoreColor(assignment.averageScore) }}>
                          {assignment.averageScore > 0 ? `${assignment.averageScore}%` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Time</span>
                        <p className="font-medium">{assignment.estimatedTime} min</p>
                      </div>
                    </div>

                    {assignment.submissionCount > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Grading Progress</span>
                          <span>{assignment.gradedCount}/{assignment.submissionCount}</span>
                        </div>
                        <Progress value={(assignment.gradedCount / assignment.submissionCount) * 100} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAssignmentAction('duplicate')}>
                          <Copy className="mr-1 h-3 w-3" />
                          Duplicate
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {assignment.status === 'draft' && (
                          <Button size="sm" onClick={() => handleAssignmentAction('publish')} style={{ backgroundColor: '#36BA91' }}>
                            Publish
                          </Button>
                        )}
                        {assignment.status === 'published' && (
                          <Button size="sm" variant="outline" onClick={() => handleAssignmentAction('close')}>
                            Close
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Settings className="mr-1 h-3 w-3" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {filteredAssignments.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No assignments found matching your criteria</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>
                Latest student submissions requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{submission.studentName}</h4>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Assignment: {assignments.find(a => a.id === submission.assignmentId)?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.submissionDate).toLocaleDateString()}
                      </p>
                      {submission.feedback && (
                        <p className="text-sm text-muted-foreground">
                          Feedback: {submission.feedback}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {submission.score !== undefined ? (
                        <div className="text-lg font-bold" style={{ color: getScoreColor(submission.score) }}>
                          {submission.score}%
                        </div>
                      ) : (
                        <Button size="sm" style={{ backgroundColor: '#36BA91' }}>
                          Grade
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Assignment Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Assignment Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Score</span>
                    <span className="font-medium" style={{ color: '#36BA91' }}>
                      {assignmentStats.averageScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={assignmentStats.averageScore} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Submission Rate</span>
                    <span className="font-medium">
                      {((assignmentStats.totalSubmissions / (assignmentStats.publishedAssignments * 30)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">On-Time Submissions</span>
                    <span className="font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grading Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
                  Grading Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Grading</span>
                    <span className="font-medium" style={{ color: '#E67E22' }}>
                      {assignmentStats.pendingGrading}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Graded This Week</span>
                    <span className="font-medium">45</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Grading Time</span>
                    <span className="font-medium">2.5 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {['homework', 'quiz', 'exam', 'project', 'lab'].map((type) => {
                  const count = assignments.filter(a => a.type === type).length
                  const percentage = (count / assignments.length) * 100
                  return (
                    <div key={type} className="text-center">
                      <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
                        {count}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{type}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AssignmentsPage
