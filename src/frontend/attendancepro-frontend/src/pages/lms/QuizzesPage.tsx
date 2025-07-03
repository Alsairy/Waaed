import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { LoadingState } from '../../components/ui/error-display'
import { useAsync } from '../../hooks/use-async'
import { handleApiError } from '../../utils/error-handler'
import { useTranslation } from '../../lib/i18n/LanguageContext'
import { QuizCard } from '../../components/educational/QuizCard'
import { Quiz, QuizType, ScoringPolicy } from '../../services/quizService'
import { 
  BookOpen, 
  Search, 
  Plus, 
  Filter, 
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'

interface QuizFilters {
  type: QuizType | 'all'
  status: 'all' | 'available' | 'completed' | 'expired'
  search: string
}

interface QuizStats {
  total: number
  available: number
  completed: number
  inProgress: number
  averageScore: number
}

const QuizzesPage: React.FC = () => {
  const { t } = useTranslation()
  const [quizStats, setQuizStats] = useState<QuizStats>({
    total: 0,
    available: 0,
    completed: 0,
    inProgress: 0,
    averageScore: 0
  })
  
  const [filters, setFilters] = useState<QuizFilters>({
    type: 'all',
    status: 'all',
    search: ''
  })

  const { data: quizzes, loading: isLoading, error, retry } = useAsync(
    async () => {
      try {
        const mockQuizzes: Quiz[] = [
          {
            id: '1',
            title: 'Mathematics Quiz - Chapter 5',
            description: 'Test your understanding of algebraic equations and functions',
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
            scoringPolicy: ScoringPolicy.KeepHighest,
            createdAt: '2024-06-25T10:00:00Z',
            updatedAt: '2024-06-25T10:00:00Z'
          },
          {
            id: '2',
            title: 'Science Practice Quiz',
            description: 'Practice questions on physics and chemistry concepts',
            courseId: 'course-2',
            courseName: 'General Science',
            type: QuizType.Practice,
            questionsCount: 20,
            points: 50,
            timeLimit: 30,
            isPublished: true,
            allowMultipleAttempts: true,
            maxAttempts: 3,
            attemptsCount: 1,
            shuffleQuestions: false,
            shuffleAnswers: true,
            showCorrectAnswers: true,
            scoringPolicy: ScoringPolicy.KeepLatest,
            createdAt: '2024-06-20T14:30:00Z',
            updatedAt: '2024-06-20T14:30:00Z'
          },
          {
            id: '3',
            title: 'Course Feedback Survey',
            description: 'Please provide your feedback on the course content and delivery',
            courseId: 'course-1',
            courseName: 'Advanced Mathematics',
            type: QuizType.Survey,
            questionsCount: 10,
            points: 0,
            isPublished: true,
            allowMultipleAttempts: false,
            maxAttempts: 1,
            attemptsCount: 0,
            shuffleQuestions: false,
            shuffleAnswers: false,
            showCorrectAnswers: false,
            scoringPolicy: ScoringPolicy.KeepHighest,
            createdAt: '2024-06-18T09:15:00Z',
            updatedAt: '2024-06-18T09:15:00Z'
          }
        ]

        const stats: QuizStats = {
          total: mockQuizzes.length,
          available: mockQuizzes.filter(q => q.isPublished).length,
          completed: 1,
          inProgress: 0,
          averageScore: 85.5
        }

        setQuizStats(stats)
        return mockQuizzes
      } catch (error) {
        throw handleApiError(error)
      }
    },
    []
  )

  const applyFilters = (quizzes: Quiz[]) => {
    if (!quizzes) return []
    
    let filtered = quizzes.filter(quiz => {
      if (filters.type !== 'all' && quiz.type !== filters.type) return false
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!quiz.title.toLowerCase().includes(searchLower) && 
            !quiz.description?.toLowerCase().includes(searchLower) &&
            !quiz.courseName?.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      return true
    })

    if (filters.status !== 'all') {
      const now = new Date()
      filtered = filtered.filter(quiz => {
        const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null
        const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null
        
        switch (filters.status) {
          case 'available':
            return quiz.isPublished && 
                   (!availableFrom || now >= availableFrom) && 
                   (!availableUntil || now <= availableUntil)
          case 'completed':
            return quiz.attemptsCount > 0
          case 'expired':
            return availableUntil && now > availableUntil
          default:
            return true
        }
      })
    }

    return filtered
  }


  const handleTakeQuiz = (quizId: string) => {
    window.location.href = `/lms/quizzes/${quizId}/take`
  }

  const handleViewResults = (quizId: string, attemptId: string) => {
    window.location.href = `/lms/quizzes/${quizId}/results/${attemptId}`
  }

  const handleEditQuiz = (quizId: string) => {
    window.location.href = `/lms/quizzes/${quizId}/edit`
  }


  const filteredQuizzes = applyFilters(quizzes || [])

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Quizzes</h2>
          <Button onClick={retry} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.education.quizzes}
          </h1>
          <p className="text-gray-600">
            Quizzes and Assessments
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => window.location.href = '/lms/quizzes/create'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t.education.createQuiz}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{quizStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.education.completed}</p>
                <p className="text-2xl font-bold text-gray-900">{quizStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.education.inProgress}</p>
                <p className="text-2xl font-bold text-gray-900">{quizStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.education.score}</p>
                <p className="text-2xl font-bold text-gray-900">{quizStats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-blue-600" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.common.search}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t.education.searchQuizzes}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.education.quizType}
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as QuizType | 'all' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t.education.allTypes}</option>
                <option value={QuizType.Graded}>{t.education.quiz}</option>
                <option value={QuizType.Practice}>{t.education.test}</option>
                <option value={QuizType.Survey}>{t.education.assessment}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t.common.all}</option>
                <option value="available">Available</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ type: 'all', status: 'all', search: '' })}
                className="w-full"
              >
                {t.common.clear}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState isLoading={true}>Loading quizzes...</LoadingState>
      ) : (
        <div className="space-y-6">
          {filteredQuizzes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filters.search || filters.type !== 'all' || filters.status !== 'all' 
                    ? t.education.noQuizzesFound 
                    : t.education.noQuizzesYet}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.type !== 'all' || filters.status !== 'all'
                    ? t.education.tryDifferentSearch
                    : t.education.checkBackLater}
                </p>
                {(!filters.search && filters.type === 'all' && filters.status === 'all') && (
                  <Button
                    onClick={() => window.location.href = '/lms/quizzes/create'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t.education.createFirstQuiz}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onTakeQuiz={handleTakeQuiz}
                  onViewResults={handleViewResults}
                  onEditQuiz={handleEditQuiz}
                  isTeacher={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default QuizzesPage
