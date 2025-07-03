import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Progress } from '../../components/ui/progress'
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Users,
  Calendar,
  Clock,
  Award,
  BarChart3,
  TrendingUp,
  Star,
  ChevronRight,
  PlayCircle,
  FileText,
  Settings
} from 'lucide-react'
import { coursesService } from '../../services/coursesService'
import { lmsService } from '../../services/lmsService'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
  description: string
  code: string
  credits: number
  instructorId: string
  instructorName: string
  semester: string
  year: number
  status: 'active' | 'inactive' | 'completed' | 'draft'
  startDate: string
  endDate: string
  maxStudents: number
  enrolledStudents: number
  completionRate: number
  averageGrade: number
  thumbnail?: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
  tags?: string[]
}

interface CourseFilters {
  category: string
  status: string
  instructor: string
  difficulty: string
  searchTerm: string
}

interface CourseStats {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  averageCompletion: number
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [courseStats, setCourseStats] = useState<CourseStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    averageCompletion: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<CourseFilters>({
    category: '',
    status: '',
    instructor: '',
    difficulty: '',
    searchTerm: ''
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [courses, filters])

  const loadCourses = async () => {
    try {
      setIsLoading(true)
      
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Advanced Mathematics',
          description: 'Comprehensive course covering calculus, linear algebra, and differential equations',
          code: 'MATH201',
          credits: 4,
          instructorId: 'INS001',
          instructorName: 'Dr. Sarah Johnson',
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
          tags: ['calculus', 'algebra', 'equations']
        },
        {
          id: '2',
          title: 'General Physics',
          description: 'Introduction to mechanics, thermodynamics, and electromagnetism',
          code: 'PHYS101',
          credits: 4,
          instructorId: 'INS002',
          instructorName: 'Prof. Ahmed Hassan',
          semester: 'Spring',
          year: 2024,
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-05-15',
          maxStudents: 25,
          enrolledStudents: 25,
          completionRate: 92,
          averageGrade: 88,
          category: 'Science',
          difficulty: 'intermediate',
          prerequisites: ['MATH101'],
          tags: ['mechanics', 'thermodynamics', 'physics']
        },
        {
          id: '3',
          title: 'English Literature',
          description: 'Study of classic and contemporary literature with critical analysis',
          code: 'ENG201',
          credits: 3,
          instructorId: 'INS003',
          instructorName: 'Ms. Jennifer Smith',
          semester: 'Spring',
          year: 2024,
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-05-15',
          maxStudents: 20,
          enrolledStudents: 18,
          completionRate: 78,
          averageGrade: 85,
          category: 'Literature',
          difficulty: 'intermediate',
          tags: ['literature', 'analysis', 'writing']
        },
        {
          id: '4',
          title: 'Computer Science Fundamentals',
          description: 'Introduction to programming, algorithms, and data structures',
          code: 'CS101',
          credits: 4,
          instructorId: 'INS004',
          instructorName: 'Dr. Omar Al-Rashid',
          semester: 'Spring',
          year: 2024,
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-05-15',
          maxStudents: 35,
          enrolledStudents: 32,
          completionRate: 88,
          averageGrade: 86,
          category: 'Computer Science',
          difficulty: 'beginner',
          tags: ['programming', 'algorithms', 'data structures']
        },
        {
          id: '5',
          title: 'Arabic Language & Culture',
          description: 'Advanced Arabic language skills with cultural context',
          code: 'ARAB301',
          credits: 3,
          instructorId: 'INS005',
          instructorName: 'Dr. Fatima Al-Zahra',
          semester: 'Spring',
          year: 2024,
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-05-15',
          maxStudents: 15,
          enrolledStudents: 12,
          completionRate: 95,
          averageGrade: 90,
          category: 'Language',
          difficulty: 'advanced',
          prerequisites: ['ARAB201'],
          tags: ['arabic', 'culture', 'language']
        },
        {
          id: '6',
          title: 'Business Administration',
          description: 'Principles of management, marketing, and business strategy',
          code: 'BUS101',
          credits: 3,
          instructorId: 'INS006',
          instructorName: 'Prof. Khalid Al-Mansouri',
          semester: 'Fall',
          year: 2023,
          status: 'completed',
          startDate: '2023-09-01',
          endDate: '2023-12-15',
          maxStudents: 40,
          enrolledStudents: 38,
          completionRate: 87,
          averageGrade: 83,
          category: 'Business',
          difficulty: 'intermediate',
          tags: ['management', 'marketing', 'strategy']
        }
      ]

      setCourses(mockCourses)

      const stats: CourseStats = {
        totalCourses: mockCourses.length,
        activeCourses: mockCourses.filter(c => c.status === 'active').length,
        totalStudents: mockCourses.reduce((sum, c) => sum + c.enrolledStudents, 0),
        averageCompletion: mockCourses.reduce((sum, c) => sum + c.completionRate, 0) / mockCourses.length
      }
      setCourseStats(stats)

    } catch (error) {
      console.error('Error loading courses:', error)
      toast.error('Failed to load courses')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = courses

    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category)
    }

    if (filters.status) {
      filtered = filtered.filter(course => course.status === filters.status)
    }

    if (filters.instructor) {
      filtered = filtered.filter(course => 
        course.instructorName.toLowerCase().includes(filters.instructor.toLowerCase())
      )
    }

    if (filters.difficulty) {
      filtered = filtered.filter(course => course.difficulty === filters.difficulty)
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.instructorName.toLowerCase().includes(searchLower)
      )
    }

    setFilteredCourses(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
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

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return '#36BA91'
    if (grade >= 80) return '#F39C12'
    if (grade >= 70) return '#E67E22'
    return '#E74C3C'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Course Management
          </h1>
          <p className="text-muted-foreground">
            Manage courses, track progress, and monitor student engagement
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Courses
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {courseStats.totalCourses}
            </div>
            <p className="text-xs text-muted-foreground">
              All courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {courseStats.activeCourses}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {courseStats.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {courseStats.averageCompletion.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Course completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Categories</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Literature">Literature</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Language">Language</option>
              <option value="Business">Business</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <Button variant="outline" onClick={() => setFilters({ category: '', status: '', instructor: '', difficulty: '', searchTerm: '' })}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredCourses.length} course(s) found
        </p>
      </div>

      {/* Courses Display */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading courses...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {course.code} • {course.credits} credits
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Instructor</span>
                        <span className="font-medium">{course.instructorName}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Enrollment</span>
                        <span className="font-medium">
                          {course.enrolledStudents}/{course.maxStudents}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium">{course.completionRate}%</span>
                      </div>
                    </div>

                    <Progress value={(course.enrolledStudents / course.maxStudents) * 100} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800">
                          {course.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium" style={{ color: getGradeColor(course.averageGrade) }}>
                          {course.averageGrade}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Courses List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{course.title}</h4>
                          <Badge className="bg-blue-100 text-blue-800">
                            {course.code}
                          </Badge>
                          <Badge className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>Instructor: {course.instructorName}</span>
                          <span>Students: {course.enrolledStudents}/{course.maxStudents}</span>
                          <span>Completion: {course.completionRate}%</span>
                          <span>Avg Grade: {course.averageGrade}%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="mr-1 h-3 w-3" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No courses found matching your criteria</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CoursesPage
