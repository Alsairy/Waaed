import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { 
  Search, 
  Users, 
  UserCheck, 
  BookOpen,
  X
} from 'lucide-react'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  studentId: string
  grade: string
  class: string
  avatar?: string
  status: 'active' | 'inactive' | 'graduated'
  gpa?: number
  courses?: string[]
  parentName?: string
  parentEmail?: string
}

interface StudentSelectorProps {
  students: Student[]
  selectedStudents?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  onStudentSelect?: (student: Student) => void
  multiSelect?: boolean
  showFilters?: boolean
  maxHeight?: string
  placeholder?: string
  className?: string
}

const StudentSelector: React.FC<StudentSelectorProps> = ({
  students,
  selectedStudents = [],
  onSelectionChange,
  onStudentSelect,
  multiSelect = false,
  showFilters = true,
  maxHeight = '400px',
  placeholder = 'Search students...',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students)

  useEffect(() => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(student => student.grade === gradeFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter)
    }

    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.class === classFilter)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, gradeFilter, statusFilter, classFilter])

  const handleStudentToggle = (student: Student) => {
    if (multiSelect) {
      const newSelection = selectedStudents.includes(student.id)
        ? selectedStudents.filter(id => id !== student.id)
        : [...selectedStudents, student.id]
      onSelectionChange?.(newSelection)
    } else {
      onStudentSelect?.(student)
      onSelectionChange?.([student.id])
    }
  }

  const handleSelectAll = () => {
    if (multiSelect) {
      const allIds = filteredStudents.map(student => student.id)
      onSelectionChange?.(allIds)
    }
  }

  const handleClearSelection = () => {
    onSelectionChange?.([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'graduated':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const uniqueGrades = [...new Set(students.map(s => s.grade))].sort()
  const uniqueClasses = [...new Set(students.map(s => s.class))].sort()

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2" style={{ color: '#005F96' }} />
            Student Selector
          </CardTitle>
          {multiSelect && selectedStudents.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedStudents.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {uniqueGrades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map(className => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Bulk Actions */}
          {multiSelect && filteredStudents.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-8"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Select All
              </Button>
            </div>
          )}

          {/* Students List */}
          <div 
            className="space-y-2 overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No students found</p>
                {searchTerm && (
                  <p className="text-xs mt-1">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            ) : (
              filteredStudents.map(student => {
                const isSelected = selectedStudents.includes(student.id)
                return (
                  <div
                    key={student.id}
                    onClick={() => handleStudentToggle(student)}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} alt={student.firstName} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {student.firstName} {student.lastName}
                          </h4>
                          <div className="flex items-center gap-2">
                            {student.gpa && (
                              <span className="text-xs text-gray-600">
                                GPA: {student.gpa.toFixed(1)}
                              </span>
                            )}
                            <Badge className={getStatusColor(student.status)}>
                              {student.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-1 flex items-center text-xs text-gray-600 space-x-4">
                          <span>ID: {student.studentId}</span>
                          <span>Grade: {student.grade}</span>
                          <span>Class: {student.class}</span>
                        </div>

                        <div className="mt-1 text-xs text-gray-500 truncate">
                          {student.email}
                        </div>

                        {student.courses && student.courses.length > 0 && (
                          <div className="mt-2 flex items-center text-xs text-gray-600">
                            <BookOpen className="h-3 w-3 mr-1" />
                            <span>{student.courses.length} course{student.courses.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}

                        {student.parentName && (
                          <div className="mt-1 text-xs text-gray-500">
                            Parent: {student.parentName}
                          </div>
                        )}
                      </div>

                      {multiSelect && (
                        <div className="flex-shrink-0">
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center
                            ${isSelected 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300'
                            }
                          `}>
                            {isSelected && (
                              <UserCheck className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Selected Students Summary */}
          {multiSelect && selectedStudents.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Selected Students:</span>
                <span className="font-medium text-gray-900">
                  {selectedStudents.length} of {students.length}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedStudents.slice(0, 5).map(studentId => {
                  const student = students.find(s => s.id === studentId)
                  return student ? (
                    <Badge key={studentId} variant="outline" className="text-xs">
                      {student.firstName} {student.lastName}
                    </Badge>
                  ) : null
                })}
                {selectedStudents.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedStudents.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StudentSelector
