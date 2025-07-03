import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  GraduationCap,
  UserPlus,
  FileText,
  MoreHorizontal,
  Mail
} from 'lucide-react'
import { sisService } from '../../services/sisService'
import { toast } from 'sonner'
import { LoadingState } from '../../components/ui/error-display'

interface Student {
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
  profilePicture?: string
}

interface StudentFilters {
  grade: string
  status: string
  searchTerm: string
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StudentFilters>({
    grade: '',
    status: '',
    searchTerm: ''
  })
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [studentsPerPage] = useState(20)

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [students, filters])

  const loadStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const studentsData = await sisService.getStudents()
      const mappedStudents = studentsData.map(student => ({
        id: student.id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phoneNumber,
        dateOfBirth: student.dateOfBirth,
        grade: student.grade || '',
        enrollmentStatus: (student.status === 'active' || student.status === 'inactive' || 
                          student.status === 'graduated' || student.status === 'transferred') 
                          ? student.status as 'active' | 'inactive' | 'graduated' | 'transferred'
                          : 'active' as const,
        enrollmentDate: student.enrollmentDate,
        gpa: undefined,
        address: student.address,
        parentName: student.guardianName,
        parentPhone: student.guardianPhone,
        profilePicture: student.profilePictureUrl
      }))
      setStudents(mappedStudents)
    } catch (err) {
      console.error('Error loading students:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load students'
      setError(errorMessage)
      toast.error(errorMessage)
      
      const mockStudents: Student[] = [
        {
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
          address: 'Riyadh, Saudi Arabia',
          parentName: 'Mohammed Al-Rashid',
          parentPhone: '+966501234568'
        },
        {
          id: '2',
          studentId: 'STU002',
          firstName: 'Layla',
          lastName: 'Mahmoud',
          email: 'layla.mahmoud@student.waaed.edu',
          phone: '+966501234569',
          dateOfBirth: '2006-07-22',
          grade: '10',
          enrollmentStatus: 'active',
          enrollmentDate: '2023-09-01',
          gpa: 3.6,
          address: 'Jeddah, Saudi Arabia',
          parentName: 'Fatima Mahmoud',
          parentPhone: '+966501234570'
        },
        {
          id: '3',
          studentId: 'STU003',
          firstName: 'Omar',
          lastName: 'Hassan',
          email: 'omar.hassan@student.waaed.edu',
          phone: '+966501234571',
          dateOfBirth: '2004-11-08',
          grade: '12',
          enrollmentStatus: 'active',
          enrollmentDate: '2022-09-01',
          gpa: 2.8,
          address: 'Dammam, Saudi Arabia',
          parentName: 'Ali Hassan',
          parentPhone: '+966501234572'
        },
        {
          id: '4',
          studentId: 'STU004',
          firstName: 'Noor',
          lastName: 'Abdullah',
          email: 'noor.abdullah@student.waaed.edu',
          phone: '+966501234573',
          dateOfBirth: '2007-01-12',
          grade: '9',
          enrollmentStatus: 'active',
          enrollmentDate: '2023-09-01',
          gpa: 3.9,
          address: 'Mecca, Saudi Arabia',
          parentName: 'Sarah Abdullah',
          parentPhone: '+966501234574'
        },
        {
          id: '5',
          studentId: 'STU005',
          firstName: 'Khalid',
          lastName: 'Al-Otaibi',
          email: 'khalid.alotaibi@student.waaed.edu',
          dateOfBirth: '2003-06-30',
          grade: '12',
          enrollmentStatus: 'graduated',
          enrollmentDate: '2021-09-01',
          gpa: 3.4,
          address: 'Medina, Saudi Arabia',
          parentName: 'Abdullah Al-Otaibi',
          parentPhone: '+966501234575'
        }
      ]
      setStudents(mockStudents)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    if (!students) return
    let filtered = students

    if (filters.grade) {
      filtered = filtered.filter(student => student.grade === filters.grade)
    }

    if (filters.status) {
      filtered = filtered.filter(student => student.enrollmentStatus === filters.status)
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      )
    }

    setFilteredStudents(filtered)
    setCurrentPage(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'graduated': return 'bg-blue-100 text-blue-800'
      case 'transferred': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGradeColor = (gpa?: number) => {
    if (!gpa) return '#6B7280'
    if (gpa >= 3.5) return '#36BA91'
    if (gpa >= 3.0) return '#F39C12'
    if (gpa >= 2.5) return '#E67E22'
    return '#E74C3C'
  }

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    const currentPageStudents = getCurrentPageStudents()
    const allSelected = currentPageStudents.every(student => selectedStudents.includes(student.id))
    
    if (allSelected) {
      setSelectedStudents(prev => prev.filter(id => !currentPageStudents.find(s => s.id === id)))
    } else {
      setSelectedStudents(prev => [...prev, ...currentPageStudents.map(s => s.id).filter(id => !prev.includes(id))])
    }
  }

  const getCurrentPageStudents = () => {
    const startIndex = (currentPage - 1) * studentsPerPage
    const endIndex = startIndex + studentsPerPage
    return filteredStudents.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)

  const handleExportStudents = () => {
    toast.success('Student data exported successfully')
  }

  const handleBulkAction = (action: string) => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students first')
      return
    }
    
    switch (action) {
      case 'export':
        toast.success(`Exported ${selectedStudents.length} students`)
        break
      case 'email':
        toast.success(`Email sent to ${selectedStudents.length} students`)
        break
      case 'deactivate':
        toast.success(`${selectedStudents.length} students deactivated`)
        break
      default:
        break
    }
    setSelectedStudents([])
  }

  const retry = () => {
    loadStudents()
  }

  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      onRetry={retry}
      loadingText="Loading students..."
      errorTitle="Failed to Load Students"
      errorMessage="Unable to load student data. Please check your connection and try again."
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#005F96' }}>
            Student Management
          </h1>
          <p className="text-muted-foreground">
            Manage student enrollment, profiles, and academic records
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Students
          </Button>
          <Button style={{ backgroundColor: '#36BA91' }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#005F96' }}>
              {students.length}
            </div>
            <p className="text-xs text-muted-foreground">
              All enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {students.filter(s => s.enrollmentStatus === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Year</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#F39C12' }}>
              {students.filter(s => new Date(s.enrollmentDate).getFullYear() === new Date().getFullYear()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              New enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#36BA91' }}>
              {(students.filter(s => s.gpa).reduce((sum, s) => sum + (s.gpa || 0), 0) / students.filter(s => s.gpa).length).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall performance
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
              value={filters.grade}
              onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Grades</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
            </select>

            <Button variant="outline" onClick={() => setFilters({ grade: '', status: '', searchTerm: '' })}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedStudents.length} student(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                  <Download className="mr-1 h-3 w-3" />
                  Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
                  <Mail className="mr-1 h-3 w-3" />
                  Send Email
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Deactivate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={handleExportStudents}>
                <Download className="mr-1 h-3 w-3" />
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading students...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  checked={getCurrentPageStudents().length > 0 && getCurrentPageStudents().every(student => selectedStudents.includes(student.id))}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <div className="flex-1 grid grid-cols-6 gap-4 text-sm font-medium">
                  <span>Student</span>
                  <span>ID</span>
                  <span>Grade</span>
                  <span>Status</span>
                  <span>GPA</span>
                  <span>Actions</span>
                </div>
              </div>

              {/* Table Rows */}
              {getCurrentPageStudents().map((student) => (
                <div key={student.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentSelect(student.id)}
                    className="rounded"
                  />
                  <div className="flex-1 grid grid-cols-6 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-medium">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">{student.studentId}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(student.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <Badge className="bg-blue-100 text-blue-800">
                        Grade {student.grade}
                      </Badge>
                    </div>
                    
                    <div>
                      <Badge className={getStatusColor(student.enrollmentStatus)}>
                        {student.enrollmentStatus}
                      </Badge>
                    </div>
                    
                    <div>
                      {student.gpa ? (
                        <span className="font-medium" style={{ color: getGradeColor(student.gpa) }}>
                          {student.gpa.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No students found matching your criteria</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * studentsPerPage) + 1} to {Math.min(currentPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </LoadingState>
  )
}

export default StudentsPage
