import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { FileText, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface AssignmentCardProps {
  assignment: {
    id: string
    title: string
    course: string
    description?: string
    dueDate: string
    submittedDate?: string
    status: 'pending' | 'submitted' | 'graded' | 'overdue'
    grade?: number
    maxGrade?: number
    priority: 'low' | 'medium' | 'high'
    type: 'homework' | 'quiz' | 'project' | 'exam'
    attachments?: number
  }
  onViewDetails?: (assignmentId: string) => void
  onSubmit?: (assignmentId: string) => void
  showSubmitButton?: boolean
  className?: string
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onViewDetails,
  onSubmit,
  showSubmitButton = false,
  className = ''
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />
      case 'project':
        return <FileText className="h-4 w-4" />
      case 'exam':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getDaysUntilDue = () => {
    const dueDate = new Date(assignment.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDue = getDaysUntilDue()
  const isOverdue = daysUntilDue < 0
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className} ${isOverdue ? 'border-red-200' : isDueSoon ? 'border-yellow-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {assignment.title}
            </CardTitle>
            <p className="text-sm text-gray-600 font-medium">{assignment.course}</p>
          </div>
          <div className="flex gap-2 ml-2">
            <Badge className={`${getStatusColor(assignment.status)}`}>
              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
          <div className="flex items-center">
            {getTypeIcon(assignment.type)}
            <span className="ml-1 capitalize">{assignment.type}</span>
          </div>
          <div className={`flex items-center ${getPriorityColor(assignment.priority)}`}>
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="capitalize">{assignment.priority} Priority</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {assignment.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {assignment.description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
            {(isOverdue || isDueSoon) && (
              <div className={`flex items-center text-sm ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}>
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`}
                </span>
              </div>
            )}
          </div>

          {assignment.submittedDate && (
            <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-md">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Submitted on {new Date(assignment.submittedDate).toLocaleDateString()}</span>
            </div>
          )}

          {assignment.grade !== undefined && assignment.maxGrade && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Grade</span>
              <span className={`font-medium ${assignment.grade >= assignment.maxGrade * 0.8 ? 'text-green-600' : assignment.grade >= assignment.maxGrade * 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                {assignment.grade}/{assignment.maxGrade} ({Math.round((assignment.grade / assignment.maxGrade) * 100)}%)
              </span>
            </div>
          )}

          {assignment.attachments && assignment.attachments > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-2" />
              <span>{assignment.attachments} attachment{assignment.attachments > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(assignment.id)}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {showSubmitButton && assignment.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => onSubmit?.(assignment.id)}
              className="flex-1"
              style={{ backgroundColor: '#36BA91', borderColor: '#36BA91' }}
            >
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AssignmentCard
