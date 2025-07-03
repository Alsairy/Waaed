import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { TrendingUp, TrendingDown, Minus, Award, Target } from 'lucide-react'

interface GradeDisplayProps {
  grade: {
    subject: string
    currentGrade: number
    maxGrade: number
    letterGrade?: string
    gpa?: number
    trend?: 'up' | 'down' | 'stable'
    previousGrade?: number
    assignments?: {
      completed: number
      total: number
      averageScore: number
    }
    attendance?: number
  }
  showDetails?: boolean
  className?: string
}

const GradeDisplay: React.FC<GradeDisplayProps> = ({
  grade,
  showDetails = true,
  className = ''
}) => {
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200'
    if (percentage >= 80) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (percentage >= 60) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getGradeLevel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent'
    if (percentage >= 80) return 'Good'
    if (percentage >= 70) return 'Satisfactory'
    if (percentage >= 60) return 'Needs Improvement'
    return 'Poor'
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const percentage = Math.round((grade.currentGrade / grade.maxGrade) * 100)
  const gradeColorClass = getGradeColor(percentage)
  const gradeLevel = getGradeLevel(percentage)

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {grade.subject}
          </CardTitle>
          <div className="flex items-center gap-2">
            {grade.trend && getTrendIcon(grade.trend)}
            <Badge className={gradeColorClass}>
              {grade.letterGrade || `${percentage}%`}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Main Grade Display */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {grade.currentGrade.toFixed(1)}/{grade.maxGrade}
            </div>
            <div className={`text-sm font-medium ${gradeColorClass.split(' ')[0]}`}>
              {gradeLevel}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  percentage >= 90 ? 'bg-green-500' :
                  percentage >= 80 ? 'bg-blue-500' :
                  percentage >= 70 ? 'bg-yellow-500' :
                  percentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {showDetails && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              {/* GPA Display */}
              {grade.gpa && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    <span>GPA</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {grade.gpa.toFixed(2)}/4.0
                  </span>
                </div>
              )}

              {/* Assignments Progress */}
              {grade.assignments && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Target className="h-4 w-4 mr-2" />
                      <span>Assignments</span>
                    </div>
                    <span className="font-medium">
                      {grade.assignments.completed}/{grade.assignments.total} completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Average Score</span>
                    <span className="font-medium">
                      {grade.assignments.averageScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Attendance */}
              {grade.attendance && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Attendance</span>
                  <span className={`font-medium ${grade.attendance >= 90 ? 'text-green-600' : grade.attendance >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {grade.attendance}%
                  </span>
                </div>
              )}

              {/* Trend Information */}
              {grade.trend && grade.previousGrade && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Previous Grade</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {grade.previousGrade.toFixed(1)}
                    </span>
                    <span className={`text-xs ${
                      grade.trend === 'up' ? 'text-green-600' :
                      grade.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {grade.trend === 'up' ? '+' : grade.trend === 'down' ? '-' : ''}
                      {Math.abs(grade.currentGrade - grade.previousGrade).toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default GradeDisplay
