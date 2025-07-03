import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { useAsync } from '../../hooks/use-async'
import { handleApiError } from '../../utils/error-handler'
import { useTranslation } from '../../lib/i18n/LanguageContext'
import { QuestionComponent } from '../../components/educational/QuestionComponent'
import { Quiz, Question, QuestionType, QuizType, ScoringPolicy } from '../../services/quizService'
import { 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle,
  Flag,
  Save,
  Send,
  Timer,
  BookOpen
} from 'lucide-react'

interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, any>
  flaggedQuestions: Set<string>
  timeRemaining: number
  isSubmitting: boolean
  showConfirmSubmit: boolean
}

const TakeQuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    flaggedQuestions: new Set(),
    timeRemaining: 0,
    isSubmitting: false,
    showConfirmSubmit: false
  })

  const { data: quiz, loading: quizLoading, error: quizError } = useAsync(
    async () => {
      if (!quizId) throw new Error('Quiz ID is required')
      
      try {
        const mockQuiz: Quiz = {
          id: quizId,
          title: 'Mathematics Quiz - Chapter 5',
          description: 'Test your understanding of algebraic equations and functions',
          courseId: 'course-1',
          courseName: 'Advanced Mathematics',
          type: QuizType.Graded,
          questionsCount: 5,
          points: 100,
          timeLimit: 30,
          isPublished: true,
          allowMultipleAttempts: false,
          maxAttempts: 1,
          attemptsCount: 0,
          shuffleQuestions: true,
          shuffleAnswers: true,
          showCorrectAnswers: false,
          scoringPolicy: ScoringPolicy.KeepHighest,
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

  const { data: questions, loading: questionsLoading } = useAsync(
    async () => {
      if (!quizId) return []
      
      try {
        const mockQuestions: Question[] = [
          {
            id: 'q1',
            quizId: quizId,
            questionType: QuestionType.MultipleChoice,
            questionText: 'What is the solution to the equation 2x + 5 = 13?',
            points: 20,
            order: 1,
            correctAnswers: ['x = 4'],
            options: ['x = 3', 'x = 4', 'x = 5', 'x = 6']
          },
          {
            id: 'q2',
            quizId: quizId,
            questionType: QuestionType.MultipleSelect,
            questionText: 'Which of the following are prime numbers? (Select all that apply)',
            points: 20,
            order: 2,
            correctAnswers: ['2', '7', '11'],
            options: ['2', '4', '7', '9', '11']
          },
          {
            id: 'q3',
            quizId: quizId,
            questionType: QuestionType.TrueFalse,
            questionText: 'The quadratic formula can be used to solve any quadratic equation.',
            points: 20,
            order: 3,
            correctAnswers: ['True'],
            options: ['True', 'False']
          },
          {
            id: 'q4',
            quizId: quizId,
            questionType: QuestionType.ShortAnswer,
            questionText: 'Simplify the expression: 3x² + 2x - 5x² + 7x',
            points: 20,
            order: 4,
            correctAnswers: ['-2x² + 9x']
          },
          {
            id: 'q5',
            quizId: quizId,
            questionType: QuestionType.Essay,
            questionText: 'Explain the relationship between linear equations and their graphical representations. Include examples in your answer.',
            points: 20,
            order: 5,
            correctAnswers: []
          }
        ]
        
        return mockQuestions
      } catch (error) {
        throw handleApiError(error)
      }
    },
    [quizId]
  )

  useEffect(() => {
    if (quiz?.timeLimit && quizState.timeRemaining === 0) {
      setQuizState(prev => ({ ...prev, timeRemaining: quiz.timeLimit! * 60 }))
    }
  }, [quiz?.timeLimit, quizState.timeRemaining])

  useEffect(() => {
    if (quizState.timeRemaining > 0) {
      const timer = setInterval(() => {
        setQuizState(prev => {
          if (prev.timeRemaining <= 1) {
            handleAutoSubmit()
            return { ...prev, timeRemaining: 0 }
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 }
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizState.timeRemaining])

  const handleAutoSubmit = useCallback(async () => {
    if (quizState.isSubmitting) return
    
    setQuizState(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      await submitQuiz()
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Auto-submit Failed',
        fallbackMessage: 'Quiz auto-submission failed. Please submit manually.'
      });
    }
  }, [quizState.isSubmitting])

  const handleAnswerChange = (questionId: string, answer: any) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }))
  }

  const handleFlagQuestion = (questionId: string) => {
    setQuizState(prev => {
      const newFlagged = new Set(prev.flaggedQuestions)
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId)
      } else {
        newFlagged.add(questionId)
      }
      return { ...prev, flaggedQuestions: newFlagged }
    })
  }

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < (questions?.length || 0)) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: index }))
    }
  }

  const submitQuiz = async () => {
    if (!quiz || !questions) return
    
    try {
      setQuizState(prev => ({ ...prev, isSubmitting: true }))
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      navigate(`/lms/quizzes/${quiz.id}/results`)
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Quiz Submission Failed',
        fallbackMessage: 'Could not submit quiz. Please try again.'
      });
      setQuizState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleSubmit = () => {
    setQuizState(prev => ({ ...prev, showConfirmSubmit: true }))
  }

  const confirmSubmit = () => {
    setQuizState(prev => ({ ...prev, showConfirmSubmit: false }))
    submitQuiz()
  }

  const getAnsweredCount = () => {
    return Object.keys(quizState.answers).length
  }

  const getProgressPercentage = () => {
    if (!questions?.length) return 0
    return (getAnsweredCount() / questions.length) * 100
  }

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
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

  if (quizLoading || questionsLoading || !quiz || !questions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[quizState.currentQuestionIndex]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/lms/quizzes/${quiz.id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.common.back}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.courseName}</p>
            </div>
          </div>

          {quiz.timeLimit && (
            <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
              <Timer className="h-5 w-5 text-yellow-600" />
              <span className="font-mono text-lg font-bold text-yellow-800">
                {formatTimeRemaining(quizState.timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {t.education.question} {quizState.currentQuestionIndex + 1} {t.education.of} {questions.length}
            </span>
            <span>
              {getAnsweredCount()} {t.education.of} {questions.length} {t.education.answered}
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {t.education.question} {quizState.currentQuestionIndex + 1}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlagQuestion(currentQuestion.id)}
                    className={quizState.flaggedQuestions.has(currentQuestion.id) ? 'bg-yellow-100 text-yellow-800' : ''}
                  >
                    <Flag className="h-4 w-4" />
                    {quizState.flaggedQuestions.has(currentQuestion.id) ? t.education.flagged : t.education.flag}
                  </Button>
                  <Badge variant="outline">
                    {currentQuestion.points} {t.education.points}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <QuestionComponent
                question={currentQuestion}
                userAnswer={quizState.answers[currentQuestion.id] ? [quizState.answers[currentQuestion.id]] : []}
                onAnswerChange={(questionId, answer) => handleAnswerChange(questionId, answer[0])}
                showCorrectAnswer={false}
                isReadOnly={false}
              />
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => navigateToQuestion(quizState.currentQuestionIndex - 1)}
              disabled={quizState.currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.common.previous}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Auto-saving...')
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                {t.common.save}
              </Button>

              {quizState.currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={quizState.isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {quizState.isSubmitting ? t.education.submitting : t.education.submitQuiz}
                </Button>
              ) : (
                <Button
                  onClick={() => navigateToQuestion(quizState.currentQuestionIndex + 1)}
                >
                  {t.common.next}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.common.questions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = quizState.answers[question.id] !== undefined
                  const isCurrent = index === quizState.currentQuestionIndex
                  const isFlagged = quizState.flaggedQuestions.has(question.id)

                  return (
                    <button
                      key={question.id}
                      onClick={() => navigateToQuestion(index)}
                      className={`
                        relative p-2 text-sm font-medium rounded-md border transition-colors
                        ${isCurrent 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : isAnswered 
                            ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }
                      `}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                  <span>{t.education.answered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
                  <span>{t.education.notAnswered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-yellow-500" />
                  <span>{t.education.flagged}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={quizState.isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {quizState.isSubmitting ? t.education.submitting : t.education.submitQuiz}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {quizState.showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                {t.education.submitQuiz}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{t.education.confirmSubmit}</p>
              
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>{t.education.answered}:</span>
                  <span className="font-medium">{getAnsweredCount()} / {questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.education.unanswered}:</span>
                  <span className="font-medium">{questions.length - getAnsweredCount()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setQuizState(prev => ({ ...prev, showConfirmSubmit: false }))}
                  className="flex-1"
                >
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={confirmSubmit}
                  disabled={quizState.isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {quizState.isSubmitting ? t.education.submitting : t.common.confirm}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TakeQuizPage
