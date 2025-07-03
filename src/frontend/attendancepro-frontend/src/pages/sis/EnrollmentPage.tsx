import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  FileText,
  BarChart3,
  TrendingUp,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface EnrollmentRequest {
  id: string
  studentId: string
  studentName: string
  courseId: string
  courseName: string
  courseCode: string
  requestDate: string
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
  priority: number
  notes?: string
  approvedBy?: string
  approvedDate?: string
}

interface CourseCapacity {
  courseId: string
  courseName: string
  courseCode: string
  maxCapacity: number
  currentEnrollment: number
  waitlistCount: number
  availableSpots: number
  enrollmentStatus: 'open' | 'full' | 'closed'
}

interface EnrollmentPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  allowedGrades: string[]
  description?: string
}

interface EnrollmentStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  waitlistedRequests: number
  totalStudents: number
  enrolledStudents: number
}

const EnrollmentPage: React.FC = () => {
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([])
  const [courseCapacities, setCourseCapacities] = useState<CourseCapacity[]>([])
  const [enrollmentPeriods, setEnrollmentPeriods] = useState<EnrollmentPeriod[]>([])
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    waitlistedRequests: 0,
    totalStudents: 0,
    enrolledStudents: 0
  })
  const [, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('requests')
  const [filters, setFilters] = useState({
    status: '',
    course: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadEnrollmentData()
  }, [])

  const loadEnrollmentData = async () => {
    try {
      setIsLoading(true)
      
      const mockRequests: EnrollmentRequest[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Ahmed Al-Rashid',
          courseId: 'MATH201',
          courseName: 'Advanced Calculus',
          courseCode: 'MATH201',
          requestDate: '2024-01-15',
          status: 'pending',
          priority: 1,
          notes: 'Student has completed prerequisites'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Layla Mahmoud',
          courseId: 'PHYS101',
          courseName: 'General Physics',
          courseCode: 'PHYS101',
          requestDate: '2024-01-14',
          status: 'approved',
          priority: 2,
          approvedBy: 'Dr. Sarah Johnson',
          approvedDate: '2024-01-16'
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Omar Hassan',
          courseId: 'CHEM101',
          courseName: 'General Chemistry',
          courseCode: 'CHEM101',
          requestDate: '2024-01-13',
          status: 'waitlisted',
          priority: 3,
          notes: 'Course at capacity, added to waitlist'
        },
        {
          id: '4',
          studentId: 'STU004',
          studentName: 'Noor Abdullah',
          courseId: 'ENG201',
          courseName: 'Advanced Literature',
          courseCode: 'ENG201',
          requestDate: '2024-01-12',
          status: 'rejected',
          priority: 1,
          notes: 'Prerequisites not met'
        }
      ]

      const mockCapacities: CourseCapacity[] = [
        {
          courseId: 'MATH201',
          courseName: 'Advanced Calculus',
          courseCode: 'MATH201',
          maxCapacity: 30,
          currentEnrollment: 28,
          waitlistCount: 5,
          availableSpots: 2,
          enrollmentStatus: 'open'
        },
        {
          courseId: 'PHYS101',
          courseName: 'General Physics',
          courseCode: 'PHYS101',
          maxCapacity: 25,
          currentEnrollment: 25,
          waitlistCount: 8,
          availableSpots: 0,
          enrollmentStatus: 'full'
        },
        {
          courseId: 'CHEM101',
          courseName: 'General Chemistry',
          courseCode: 'CHEM101',
          maxCapacity: 20,
          currentEnrollment: 20,
          waitlistCount: 12,
          availableSpots: 0,
          enrollmentStatus: 'full'
        },
        {
          courseId: 'ENG201',
          courseName: 'Advanced Literature',
          courseCode: 'ENG201',
          maxCapacity: 15,
          currentEnrollment: 10,
          waitlistCount: 0,
          availableSpots: 5,
          enrollmentStatus: 'open'
        }
      ]

      const mockPeriods: EnrollmentPeriod[] = [
        {
          id: '1',
          name: 'Spring 2024 Enrollment',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          isActive: true,
          allowedGrades: ['9', '10', '11', '12'],
          description: 'Regular enrollment period for Spring 2024 semester'
        },
        {
          id: '2',
          name: 'Late Enrollment',
          startDate: '2024-02-01',
          endDate: '2024-02-15',
          isActive: false,
          allowedGrades: ['9', '10', '11', '12'],
          description: 'Late enrollment with additional fees'
        }
      ]

      setEnrollmentRequests(mockRequests)
      setCourseCapacities(mockCapacities)
      setEnrollmentPeriods(mockPeriods)

      const stats: EnrollmentStats = {
        totalRequests: mockRequests.length,
        pendingRequests: mockRequests.filter(r => r.status === 'pending').length,
        approvedRequests: mockRequests.filter(r => r.status === 'approved').length,
        rejectedRequests: mockRequests.filter(r => r.status === 'rejected').length,
        waitlistedRequests: mockRequests.filter(r => r.status === 'waitlisted').length,
        totalStudents: 150, // Mock data
        enrolledStudents: 142 // Mock data
      }
      setEnrollmentStats(stats)

    } catch (error) {
      console.error('Error loading enrollment data:', error)
      toast.error('Failed to load enrollment data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'waitlisted': return 'bg-blue-100 text-blue-800'
      case 'open': return 'bg-green-100 text-green-800'
      case 'full': return 'bg-red-100 text-red-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'waitlisted': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject' | 'waitlist') => {
    try {
      const updatedRequests = enrollmentRequests.map(request => 
        request.id === requestId 
          ? { 
              ...request, 
              status: (action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'waitlisted') as 'pending' | 'approved' | 'rejected' | 'waitlisted',
              approvedBy: action === 'approve' ? 'Current User' : undefined,
              approvedDate: action === 'approve' ? new Date().toISOString() : undefined
            }
          : request
      )
      setEnrollmentRequests(updatedRequests)
      toast.success(`Request ${action}d successfully`)
    } catch (error) {
      toast.error(`Failed to ${action} request`)
    }
  }

  const filteredRequests = enrollmentRequests.filter(request => {
    if (filters.status && request.status !== filters.status) return false
    if (filters.course && !request.courseName.toLowerCase().includes(filters.course.toLowerCase())) return false
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return request.studentName.toLowerCase().includes(searchLower) ||
             request.courseName.toLowerCase().includes(searchLower) ||
             request.courseCode.toLowerCase().includes(searchLower)
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Course Enrollment Management
          </h1>
          <p className="text-muted-foreground">
            Manage student course enrollments, waitlists, and capacity planning
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Enroll
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }}>
            <Plus className="mr-2 h-4 w-4" />
            New Enrollment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {enrollmentStats.totalRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              All enrollment requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {enrollmentStats.pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {enrollmentStats.enrolledStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {((enrollmentStats.enrolledStudents / enrollmentStats.totalStudents) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of total students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">Enrollment Requests</TabsTrigger>
          <TabsTrigger value="capacity">Course Capacity</TabsTrigger>
          <TabsTrigger value="periods">Enrollment Periods</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" style={{ color: '#005F96' }} />
                Filter Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="waitlisted">Waitlisted</option>
                </select>

                <Input
                  placeholder="Filter by course..."
                  value={filters.course}
                  onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                />

                <Button variant="outline" onClick={() => setFilters({ status: '', course: '', searchTerm: '' })}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Requests ({filteredRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{request.studentName}</h4>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Course: {request.courseName} ({request.courseCode})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Requested: {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                      {request.notes && (
                        <p className="text-sm text-muted-foreground">
                          Notes: {request.notes}
                        </p>
                      )}
                      {request.approvedBy && (
                        <p className="text-sm text-muted-foreground">
                          Approved by: {request.approvedBy} on {new Date(request.approvedDate!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleRequestAction(request.id, 'approve')} style={{ backgroundColor: '#36BA91' }}>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRequestAction(request.id, 'waitlist')}>
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Waitlist
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRequestAction(request.id, 'reject')}>
                            <XCircle className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Capacity Overview</CardTitle>
              <CardDescription>
                Monitor enrollment capacity and waitlists for all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseCapacities.map((course) => (
                  <div key={course.courseId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{course.courseName}</h4>
                        <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                      </div>
                      <Badge className={getStatusColor(course.enrollmentStatus)}>
                        {course.enrollmentStatus}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Enrolled</span>
                        <p className="font-medium">{course.currentEnrollment}/{course.maxCapacity}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Available</span>
                        <p className="font-medium" style={{ color: course.availableSpots > 0 ? '#36BA91' : '#E74C3C' }}>
                          {course.availableSpots}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Waitlist</span>
                        <p className="font-medium">{course.waitlistCount}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Utilization</span>
                        <p className="font-medium">
                          {((course.currentEnrollment / course.maxCapacity) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(course.currentEnrollment / course.maxCapacity) * 100}%`,
                            backgroundColor: course.enrollmentStatus === 'full' ? '#E74C3C' : '#36BA91'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Enrollment Periods</CardTitle>
                <Button style={{ backgroundColor: '#36BA91' }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Period
                </Button>
              </div>
              <CardDescription>
                Manage enrollment periods and registration windows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollmentPeriods.map((period) => (
                  <div key={period.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{period.name}</h4>
                        <p className="text-sm text-muted-foreground">{period.description}</p>
                      </div>
                      <Badge className={period.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {period.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start Date</span>
                        <p className="font-medium">{new Date(period.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date</span>
                        <p className="font-medium">{new Date(period.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Allowed Grades</span>
                        <p className="font-medium">{period.allowedGrades.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="mr-1 h-3 w-3" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" style={{ color: '#36BA91' }} />
                Enrollment Reports
              </CardTitle>
              <CardDescription>
                Generate and download enrollment reports and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">Enrollment Summary</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">Waitlist Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">Capacity Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">Enrollment Trends</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnrollmentPage
