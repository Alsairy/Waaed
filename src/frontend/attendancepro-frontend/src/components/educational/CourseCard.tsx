import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { BookOpen, Clock, Users, Calendar } from 'lucide-react'

interface CourseCardProps {
  course: {
    id: string
    title: string
    code: string
    instructor: string
    description?: string
    enrolledStudents: number
    maxStudents: number
    schedule: string
    status: 'active' | 'completed' | 'upcoming'
    progress?: number
    nextClass?: string
  }
  onViewDetails?: (courseId: string) => void
  onEnroll?: (courseId: string) => void
  showEnrollButton?: boolean
  className?: string
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewDetails,
  onEnroll,
  showEnrollButton = false,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {course.title}
            </CardTitle>
            <p className="text-sm text-gray-600 font-medium">{course.code}</p>
          </div>
          <Badge className={`ml-2 ${getStatusColor(course.status)}`}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mt-2">
          <Users className="h-4 w-4 mr-1" />
          <span className="mr-4">{course.instructor}</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>{course.schedule}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {course.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Enrollment</span>
            <span className="font-medium">
              {course.enrolledStudents}/{course.maxStudents} students
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
            />
          </div>

          {course.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}

          {course.nextClass && (
            <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              <span>Next class: {course.nextClass}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(course.id)}
            className="flex-1"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {showEnrollButton && course.enrolledStudents < course.maxStudents && (
            <Button
              size="sm"
              onClick={() => onEnroll?.(course.id)}
              className="flex-1"
              style={{ backgroundColor: '#005F96', borderColor: '#005F96' }}
            >
              Enroll
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseCard
