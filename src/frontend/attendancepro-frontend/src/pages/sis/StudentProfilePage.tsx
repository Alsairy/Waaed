import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  ArrowLeft,
  User, 
  Phone,
  Mail,
  MapPin,
  Users,
  BookOpen,
  Award,
  Clock,
  Edit,
  Download,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface StudentProfile {
  id: string
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth: string
  grade: string
  enrollmentStatus: 'active' | 'inactive' | 'graduated' | 'transferred'
  enrollmentDate: string
  gpa?: number
  address?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  profilePicture?: string
  emergencyContact?: string
  emergencyPhone?: string
  medicalInfo?: string
  notes?: string
}

interface CourseEnrollment {
  id: string
  courseId: string
  courseName: string
  courseCode: string
  instructor: string
  grade?: string
  credits: number
  status: 'enrolled' | 'completed' | 'dropped'
  enrollmentDate: string
}

interface Grade {
  id: string
  courseName: string
  assignmentName: string
  grade: string
  percentage: number
  date: string
  type: 'assignment' | 'quiz' | 'exam' | 'project'
}

interface AttendanceRecord {
  id: string
  date: string
  courseName: string
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
}

const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [courses, setCourses] = useState<CourseEnrollment[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (studentId) {
      loadStudentData()
    }
  }, [studentId])

  const loadStudentData = async () => {
    try {
      setIsLoading(true)
      
      const mockStudent: StudentProfile = {
        id: '1',
        studentId: 'STU001',
        firstName: 'Ahmed',
        lastName: 'Al-Rashid',
        email: 'ahmed.alrashid@student.waaed.edu',
        phone: '+966501234567',
        dateOfBirth: '2005-03-15',
        grade: '11',
        enrollmentStatus: 'active',
        enrollmentDate: '2023-09-01',
        gpa: 3.2,
        address: '123 King Fahd Road, Riyadh, Saudi Arabia',
        parentName: 'Mohammed Al-Rashid',
        parentPhone: '+966501234568',
        parentEmail: 'mohammed.alrashid@email.com',
        emergencyContact: 'Fatima Al-Rashid',
        emergencyPhone: '+966501234569',
        medicalInfo: 'No known allergies',
        notes: 'Excellent student with strong analytical skills'
      }

      const mockCourses: CourseEnrollment[] = [
        {
          id: '1',
          courseId: 'MATH101',
          courseName: 'Advanced Mathematics',
          courseCode: 'MATH101',
          instructor: 'Dr. Sarah Johnson',
          grade: 'B+',
          credits: 4,
          status: 'enrolled',
          enrollmentDate: '2023-09-01'
        },
        {
          id: '2',
          courseId: 'PHYS101',
          courseName: 'Physics',
          courseCode: 'PHYS101',
          instructor: 'Prof. Ahmed Hassan',
          grade: 'A-',
          credits: 4,
          status: 'enrolled',
          enrollmentDate: '2023-09-01'
        },
        {
          id: '3',
          courseId: 'CHEM101',
          courseName: 'Chemistry',
          courseCode: 'CHEM101',
          instructor: 'Dr. Layla Mahmoud',
          grade: 'B',
          credits: 3,
          status: 'enrolled',
          enrollmentDate: '2023-09-01'
        },
        {
          id: '4',
          courseId: 'ENG101',
          courseName: 'English Literature',
          courseCode: 'ENG101',
          instructor: 'Ms. Jennifer Smith',
          grade: 'A',
          credits: 3,
          status: 'enrolled',
          enrollmentDate: '2023-09-01'
        }
      ]

      const mockGrades: Grade[] = [
        {
          id: '1',
          courseName: 'Advanced Mathematics',
          assignmentName: 'Calculus Quiz 1',
          grade: 'B+',
          percentage: 85,
          date: '2024-01-15',
          type: 'quiz'
        },
        {
          id: '2',
          courseName: 'Physics',
          assignmentName: 'Lab Report 1',
          grade: 'A-',
          percentage: 90,
          date: '2024-01-20',
          type: 'assignment'
        },
        {
          id: '3',
          courseName: 'Chemistry',
          assignmentName: 'Midterm Exam',
          grade: 'B',
          percentage: 82,
          date: '2024-01-25',
          type: 'exam'
        },
        {
          id: '4',
          courseName: 'English Literature',
          assignmentName: 'Essay Assignment',
          grade: 'A',
          percentage: 95,
          date: '2024-01-30',
          type: 'assignment'
        }
      ]

      const mockAttendance: AttendanceRecord[] = [
        {
          id: '1',
          date: '2024-01-15',
          courseName: 'Advanced Mathematics',
          status: 'present'
        },
        {
          id: '2',
          date: '2024-01-15',
          courseName: 'Physics',
          status: 'present'
        },
        {
          id: '3',
          date: '2024-01-16',
          courseName: 'Chemistry',
          status: 'late',
          notes: 'Arrived 10 minutes late'
        },
        {
          id: '4',
          date: '2024-01-16',
          courseName: 'English Literature',
          status: 'absent',
          notes: 'Sick leave'
        }
      ]

      setStudent(mockStudent)
      setCourses(mockCourses)
      setGrades(mockGrades)
      setAttendance(mockAttendance)

    } catch (error) {
      console.error('Error loading student data:', error)
      toast.error('Failed to load student data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'graduated': return 'bg-blue-100 text-blue-800'
      case 'transferred': return 'bg-yellow-100 text-yellow-800'
      case 'present': return 'bg-green-100 text-green-800'
      case 'absent': return 'bg-red-100 text-red-800'
      case 'late': return 'bg-yellow-100 text-yellow-800'
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

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0
    const presentCount = attendance.filter(a => a.status === 'present').length
    return (presentCount / attendance.length) * 100
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={() => navigate('/sis/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/sis/students')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
              {student.firstName} {student.lastName}
            </h1>
            <p className="text-muted-foreground">
              Student ID: {student.studentId} • Grade {student.grade}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Profile
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Student Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {student.gpa?.toFixed(2) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 4.0
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
              {calculateAttendanceRate().toFixed(1)}%
            </div>
            <Progress value={calculateAttendanceRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {courses.filter(c => c.status === 'enrolled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(student.enrollmentStatus)}>
              {student.enrollmentStatus}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Since {new Date(student.enrollmentDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">First Name</label>
                    <p className="font-medium">{student.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                    <p className="font-medium">{student.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="font-medium">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Grade</label>
                    <p className="font-medium">Grade {student.grade}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p className="font-medium">{student.address}</p>
                </div>
                {student.medicalInfo && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Medical Information</label>
                    <p className="font-medium">{student.medicalInfo}</p>
                  </div>
                )}
                {student.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="font-medium">{student.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Academic Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current GPA</span>
                    <span className="font-medium" style={{ color: '#36BA91' }}>
                      {student.gpa?.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={(student.gpa || 0) / 4 * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Attendance Rate</span>
                    <span className="font-medium" style={{ color: '#36BA91' }}>
                      {calculateAttendanceRate().toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={calculateAttendanceRate()} className="h-2" />
                  
                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Courses</span>
                        <p className="font-medium">{courses.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recent Grades</span>
                        <p className="font-medium">{grades.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
              <CardDescription>
                Current and past course enrollments for {student.firstName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{course.courseName}</h4>
                        <Badge className="bg-blue-100 text-blue-800">
                          {course.courseCode}
                        </Badge>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Instructor: {course.instructor} • {course.credits} credits
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Enrolled: {new Date(course.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {course.grade && (
                        <div className="text-lg font-bold" style={{ color: '#36BA91' }}>
                          {course.grade}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>
                Latest assignment and exam grades for {student.firstName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {grades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{grade.assignmentName}</h4>
                        <Badge className="bg-gray-100 text-gray-800">
                          {grade.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {grade.courseName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(grade.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: getGradeColor(grade.percentage) }}>
                        {grade.grade}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {grade.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Daily attendance tracking for {student.firstName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{record.courseName}</h4>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground">
                          Note: {record.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {record.status === 'present' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : record.status === 'absent' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                  Student Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{student.email}</p>
                    <p className="text-sm text-muted-foreground">Primary Email</p>
                  </div>
                </div>
                {student.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{student.phone}</p>
                      <p className="text-sm text-muted-foreground">Mobile Phone</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{student.address}</p>
                    <p className="text-sm text-muted-foreground">Home Address</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent/Guardian Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                  Parent/Guardian Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.parentName && (
                  <div>
                    <p className="font-medium">{student.parentName}</p>
                    <p className="text-sm text-muted-foreground">Primary Guardian</p>
                  </div>
                )}
                {student.parentPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{student.parentPhone}</p>
                      <p className="text-sm text-muted-foreground">Guardian Phone</p>
                    </div>
                  </div>
                )}
                {student.parentEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{student.parentEmail}</p>
                      <p className="text-sm text-muted-foreground">Guardian Email</p>
                    </div>
                  </div>
                )}
                
                {/* Emergency Contact */}
                {student.emergencyContact && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Emergency Contact</h4>
                    <div>
                      <p className="font-medium">{student.emergencyContact}</p>
                      {student.emergencyPhone && (
                        <div className="flex items-center space-x-3 mt-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{student.emergencyPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudentProfilePage
