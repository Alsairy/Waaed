import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  ArrowLeft,
  BookOpen, 
  Users, 
  Calendar,
  Clock,
  Award,
  FileText,
  Video,
  Download,
  Edit,
  Settings,
  Play,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Upload,
  Plus
} from 'lucide-react'
import { coursesService } from '../../services/coursesService'
import { assignmentsService } from '../../services/assignmentsService'
import { gradesService } from '../../services/gradesService'
import { toast } from 'sonner'

interface CourseDetail {
  id: string
  title: string
  description: string
  code: string
  credits: number
  instructorId: string
  instructorName: string
  instructorEmail: string
  semester: string
  year: number
  status: 'active' | 'inactive' | 'completed' | 'draft'
  startDate: string
  endDate: string
  maxStudents: number
  enrolledStudents: number
  completionRate: number
  averageGrade: number
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
  syllabus?: string
  objectives?: string[]
  schedule?: CourseSchedule[]
}

interface CourseSchedule {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  room?: string
  building?: string
}

interface CourseModule {
  id: string
  title: string
  description: string
  order: number
  isPublished: boolean
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document' | 'quiz' | 'assignment'
  duration?: number
  isCompleted: boolean
  url?: string
}

interface StudentEnrollment {
  id: string
  studentId: string
  studentName: string
  email: string
  enrollmentDate: string
  progress: number
  lastAccessed: string
  grade?: string
  status: 'active' | 'completed' | 'dropped'
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxPoints: number
  submissionCount: number
  averageScore: number
  status: 'draft' | 'published' | 'closed'
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [modules, setModules] = useState<CourseModule[]>([])
  const [students, setStudents] = useState<StudentEnrollment[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (courseId) {
      loadCourseData(courseId)
    }
  }, [courseId])

  const loadCourseData = async (id: string) => {
    try {
      setIsLoading(true)
      
      const mockCourse: CourseDetail = {
        id: '1',
        title: 'Advanced Mathematics',
        description: 'Comprehensive course covering calculus, linear algebra, and differential equations. This course is designed for advanced students who have completed prerequisite mathematics courses.',
        code: 'MATH201',
        credits: 4,
        instructorId: 'INS001',
        instructorName: 'Dr. Sarah Johnson',
        instructorEmail: 'sarah.johnson@waaed.edu',
        semester: 'Spring',
        year: 2024,
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-05-15',
        maxStudents: 30,
        enrolledStudents: 28,
        completionRate: 85,
        averageGrade: 82,
        category: 'Mathematics',
        difficulty: 'advanced',
        prerequisites: ['MATH101', 'MATH102'],
        syllabus: 'This course covers advanced mathematical concepts including calculus, linear algebra, and differential equations.',
        objectives: [
          'Master advanced calculus concepts',
          'Understand linear algebra principles',
          'Solve differential equations',
          'Apply mathematical concepts to real-world problems'
        ],
        schedule: [
          {
            id: '1',
            dayOfWeek: 'Monday',
            startTime: '09:00',
            endTime: '10:30',
            room: '201',
            building: 'Mathematics Building'
          },
          {
            id: '2',
            dayOfWeek: 'Wednesday',
            startTime: '09:00',
            endTime: '10:30',
            room: '201',
            building: 'Mathematics Building'
          },
          {
            id: '3',
            dayOfWeek: 'Friday',
            startTime: '09:00',
            endTime: '10:30',
            room: '201',
            building: 'Mathematics Building'
          }
        ]
      }

      const mockModules: CourseModule[] = [
        {
          id: '1',
          title: 'Introduction to Calculus',
          description: 'Basic concepts of differential and integral calculus',
          order: 1,
          isPublished: true,
          lessons: [
            {
              id: '1',
              title: 'Limits and Continuity',
              type: 'video',
              duration: 45,
              isCompleted: true,
              url: '/videos/limits-continuity.mp4'
            },
            {
              id: '2',
              title: 'Derivatives',
              type: 'video',
              duration: 60,
              isCompleted: true,
              url: '/videos/derivatives.mp4'
            },
            {
              id: '3',
              title: 'Calculus Quiz 1',
              type: 'quiz',
              isCompleted: false
            }
          ]
        },
        {
          id: '2',
          title: 'Linear Algebra Fundamentals',
          description: 'Vectors, matrices, and linear transformations',
          order: 2,
          isPublished: true,
          lessons: [
            {
              id: '4',
              title: 'Vector Spaces',
              type: 'video',
              duration: 50,
              isCompleted: false,
              url: '/videos/vector-spaces.mp4'
            },
            {
              id: '5',
              title: 'Matrix Operations',
              type: 'document',
              isCompleted: false,
              url: '/documents/matrix-operations.pdf'
            }
          ]
        }
      ]

      const mockStudents: StudentEnrollment[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          email: 'ahmed.alrashid@student.waaed.edu',
          enrollmentDate: '2024-01-15',
          progress: 75,
          lastAccessed: '2024-01-30',
          grade: 'B+',
          status: 'active'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          email: 'layla.mahmoud@student.waaed.edu',
          enrollmentDate: '2024-01-15',
          progress: 90,
          lastAccessed: '2024-01-31',
          grade: 'A',
          status: 'active'
        }
      ]

      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Calculus Problem Set 1',
          description: 'Solve problems related to limits and derivatives',
          dueDate: '2024-02-15',
          maxPoints: 100,
          submissionCount: 25,
          averageScore: 82,
          status: 'published'
        }
      ]

      setCourse(mockCourse)
      setModules(mockModules)
      setStudents(mockStudents)
      setAssignments(mockAssignments)

    } catch (error) {
      console.error('Error loading course data:', error)
      toast.error('Failed to load course data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'dropped': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'quiz': return <CheckCircle className="h-4 w-4" />
      case 'assignment': return <Edit className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Course not found</p>
        <Button onClick={() => navigate('/lms/courses')} className="mt-4">
          Back to Courses
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/lms/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
              {course.title}
            </h1>
            <p className="text-muted-foreground">
              {course.code} • {course.credits} credits • {course.instructorName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
          </Button>
        </div>
      </div>

      {/* Course Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {course.enrolledStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              of {course.maxStudents} max
            </p>
            <Progress value={(course.enrolledStudents / course.maxStudents) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {course.completionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average progress
            </p>
            <Progress value={course.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {course.averageGrade}%
            </div>
            <p className="text-xs text-muted-foreground">
              Class average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(course.status)}>
              {course.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {course.semester} {course.year}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="font-medium">{course.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="font-medium">{course.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="font-medium">{new Date(course.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    <p className="font-medium">{new Date(course.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Prerequisites</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {course.prerequisites.map((prereq, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {course.objectives && course.objectives.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Learning Objectives</label>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      {course.objectives.map((objective, index) => (
                        <li key={index} className="text-sm">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Class Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Instructor</label>
                  <p className="font-medium">{course.instructorName}</p>
                  <p className="text-sm text-muted-foreground">{course.instructorEmail}</p>
                </div>
                {course.schedule && course.schedule.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Weekly Schedule</label>
                    <div className="space-y-2 mt-2">
                      {course.schedule.map((schedule) => (
                        <div key={schedule.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{schedule.dayOfWeek}</p>
                            <p className="text-sm text-muted-foreground">
                              {schedule.startTime} - {schedule.endTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{schedule.room}</p>
                            <p className="text-sm text-muted-foreground">{schedule.building}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Course Content</h3>
            <Button style={{ backgroundColor: '#36BA91' }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </div>
          
          <div className="space-y-4">
            {modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={module.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {module.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getLessonIcon(lesson.type)}
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Badge className="bg-gray-100 text-gray-800">
                                {lesson.type}
                              </Badge>
                              {lesson.duration && (
                                <span>{lesson.duration} min</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {lesson.isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                          <Button size="sm" variant="outline">
                            <Play className="mr-1 h-3 w-3" />
                            {lesson.type === 'video' ? 'Play' : 'Open'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Enrolled Students ({students.length})</h3>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export List
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-medium">
                        {student.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium">{student.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={student.progress} className="w-20" />
                            <span className="text-sm font-medium">{student.progress}%</span>
                          </div>
                        </div>
                        {student.grade && (
                          <div>
                            <p className="text-sm text-muted-foreground">Grade</p>
                            <p className="font-medium" style={{ color: '#36BA91' }}>{student.grade}</p>
                          </div>
                        )}
                        <div>
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Assignments ({assignments.length})</h3>
            <Button style={{ backgroundColor: '#36BA91' }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </div>
          
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>{assignment.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Due Date</span>
                      <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Points</span>
                      <p className="font-medium">{assignment.maxPoints}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submissions</span>
                      <p className="font-medium">{assignment.submissionCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Score</span>
                      <p className="font-medium">{assignment.averageScore}%</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-3 w-3" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Engagement Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Student Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Progress</span>
                    <span className="font-medium">{course.completionRate}%</span>
                  </div>
                  <Progress value={course.completionRate} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Students</span>
                    <span className="font-medium">{students.filter(s => s.status === 'active').length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Assignment Completion</span>
                    <span className="font-medium">
                      {assignments.reduce((sum, a) => sum + a.submissionCount, 0)} / {assignments.length * students.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" style={{ color: '#F39C12' }} />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Class Average</span>
                    <span className="font-medium" style={{ color: '#36BA91' }}>{course.averageGrade}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Top Performer</span>
                    <span className="font-medium">
                      {students.reduce((top, student) => 
                        student.progress > (top?.progress || 0) ? student : top, students[0]
                      )?.studentName || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-medium">{course.completionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Assignment submitted</p>
                    <p className="text-sm text-muted-foreground">Layla Mahmoud submitted "Calculus Problem Set 1"</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Play className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Video completed</p>
                    <p className="text-sm text-muted-foreground">Ahmed Al-Rashid completed "Derivatives"</p>
                  </div>
                  <span className="text-sm text-muted-foreground">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Discussion post</p>
                    <p className="text-sm text-muted-foreground">Omar Hassan posted in "Calculus Questions"</p>
                  </div>
                  <span className="text-sm text-muted-foreground">6 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CourseDetailPage
