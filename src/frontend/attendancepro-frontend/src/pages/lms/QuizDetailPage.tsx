import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { LoadingState } from '../../components/ui/error-display'
import { useAsync } from '../../hooks/use-async'
import { handleApiError } from '../../utils/error-handler'
import { useTranslation } from '../../lib/i18n/LanguageContext'
import { Quiz, QuizType, QuizAttempt, AttemptStatus, ScoringPolicy } from '../../services/quizService'
import { formatDate, formatDateTime, formatDuration } from '../../utils/date-utils'
import { 
  BookOpen, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Play,
  Eye,
  Edit,
  Settings,
  BarChart3,
  ArrowLeft,
  FileText,
  Target,
  Timer,
  Shuffle
} from 'lucide-react'

const QuizDetailPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: quiz, loading: quizLoading, error: quizError } = useAsync(
    async () => {
      if (!quizId) throw new Error('Quiz ID is required')
      
      try {
        const mockQuiz: Quiz = {
          id: quizId,
          title: 'Mathematics Quiz - Chapter 5',
          description: 'Test your understanding of algebraic equations and functions. This comprehensive quiz covers linear equations, quadratic functions, polynomial operations, and graphing techniques.',
          courseId: 'course-1',
          courseName: 'Advanced Mathematics',
          type: QuizType.Graded,
          questionsCount: 15,
          points: 100,
          timeLimit: 45,
          dueDate: '2024-07-15T23:59:59Z',
          availableFrom: '2024-07-01T00:00:00Z',
          availableUntil: '2024-07-15T23:59:59Z',
          isPublished: true,
          allowMultipleAttempts: false,
          maxAttempts: 1,
          attemptsCount: 0,
          shuffleQuestions: true,
          shuffleAnswers: true,
          showCorrectAnswers: true,
          scoringPolicy: ScoringPolicy.KeepLatest,
          createdAt: '2024-06-25T10:00:00Z',
          updatedAt: '2024-06-25T10:00:00Z'
        }
        
        return mockQuiz
      } catch (error) {
        throw handleApiError(error)
      }
    },
    [quizId]
  )

  const { data: attempts } = useAsync(
    async () => {
      if (!quizId) return []
      
      try {
        const mockAttempts: QuizAttempt[] = [
          {
            id: 'attempt-1',
            quizId: quizId,
            userId: 'user-1',
            userName: 'John Doe',
            status: AttemptStatus.Submitted,
            score: 85,
            maxScore: 100,
            startedAt: '2024-07-10T14:30:00Z',
            submittedAt: '2024-07-10T15:15:00Z',
            timeSpent: 45,
            responses: []
          }
        ]
        
        return mockAttempts
      } catch (error) {
        throw handleApiError(error)
      }
    },
    [quizId]
  )

  const getQuizTypeColor = (type: QuizType) => {
    switch (type) {
      case QuizType.Graded:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case QuizType.Practice:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case QuizType.Survey:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: AttemptStatus) => {
    switch (status) {
      case AttemptStatus.Submitted:
      case AttemptStatus.Graded:
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case AttemptStatus.InProgress:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case AttemptStatus.Expired:
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const isAvailable = () => {
    if (!quiz) return false
    const now = new Date()
    const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null
    const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null
    
    if (availableFrom && now < availableFrom) return false
    if (availableUntil && now > availableUntil) return false
    return quiz.isPublished
  }

  const canTakeQuiz = () => {
    if (!quiz || !isAvailable()) return false
    if (quiz.attemptsCount === 0) return true
    if (!quiz.allowMultipleAttempts) return false
    if (quiz.maxAttempts && quiz.attemptsCount >= quiz.maxAttempts) return false
    return true
  }

  const handleTakeQuiz = () => {
    if (quiz) {
      navigate(`/lms/quizzes/${quiz.id}/take`)
    }
  }

  const handleEditQuiz = () => {
    if (quiz) {
      navigate(`/lms/quizzes/${quiz.id}/edit`)
    }
  }

  if (quizError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.education.errorLoading}</h2>
          <Button onClick={() => navigate('/lms/quizzes')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.common.back}
          </Button>
        </div>
      </div>
    )
  }

  if (quizLoading || !quiz) {
    return <LoadingState isLoading={true}>Loading quiz...</LoadingState>
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/lms/quizzes')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.back}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <Badge className={getQuizTypeColor(quiz.type)}>
              {t.education.quiz}
            </Badge>
          </div>
          <p className="text-gray-600">{quiz.courseName}</p>
        </div>

        <div className="flex gap-2">
          {canTakeQuiz() && (
            <Button onClick={handleTakeQuiz} className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-2" />
              {quiz.attemptsCount > 0 ? t.education.retakeQuiz : t.education.startQuiz}
            </Button>
          )}
          
          <Button variant="outline" onClick={handleEditQuiz}>
            <Edit className="h-4 w-4 mr-2" />
            {t.education.editQuiz}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{quiz.description}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Questions</p>
                    <p className="font-medium">{quiz.questionsCount} Questions</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">{t.education.points}</p>
                    <p className="font-medium">{quiz.points} {t.education.points}</p>
                  </div>
                </div>

                {quiz.timeLimit && (
                  <div className="flex items-center gap-3">
                    <Timer className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">{t.education.timeLimit}</p>
                      <p className="font-medium">{formatDuration(quiz.timeLimit)}</p>
                    </div>
                  </div>
                )}

                {quiz.dueDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">{t.education.dueDate}</p>
                      <p className="font-medium">{formatDateTime(quiz.dueDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">{t.common.settings}</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${quiz.allowMultipleAttempts ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Allow Multiple Attempts</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shuffle className={`h-4 w-4 ${quiz.shuffleQuestions ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Shuffle Questions</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Shuffle className={`h-4 w-4 ${quiz.shuffleAnswers ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Shuffle Answers</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Eye className={`h-4 w-4 ${quiz.showCorrectAnswers ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Show Correct Answers</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {attempts && attempts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(attempt.status)}
                        <div>
                          <p className="font-medium">{attempt.userName}</p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(attempt.startedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {attempt.score !== undefined && (
                          <p className="font-bold text-lg">
                            {attempt.score}%
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {formatDuration(attempt.timeSpent || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t.education.quizStatistics}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant={quiz.isPublished ? 'default' : 'secondary'}>
                  {quiz.isPublished ? t.education.published : t.education.draft}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attempts</span>
                <span className="font-medium">{quiz.attemptsCount}</span>
              </div>

              {quiz.maxAttempts && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Max Attempts</span>
                  <span className="font-medium">{quiz.maxAttempts}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created</span>
                <span className="font-medium">{formatDate(quiz.createdAt)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Updated</span>
                <span className="font-medium">{formatDate(quiz.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {quiz.availableFrom || quiz.availableUntil ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quiz.availableFrom && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available From</p>
                    <p className="font-medium">{formatDateTime(quiz.availableFrom)}</p>
                  </div>
                )}

                {quiz.availableUntil && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available Until</p>
                    <p className="font-medium">{formatDateTime(quiz.availableUntil)}</p>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {isAvailable() ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          Available
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          Not Available
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default QuizDetailPage
