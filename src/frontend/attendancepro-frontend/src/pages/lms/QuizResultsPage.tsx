import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  BarChart3, 
  ArrowLeft,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quizService } from '../../services/quizService';

interface QuizResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  attemptNumber: number;
  status: 'InProgress' | 'Submitted' | 'Graded';
  startedAt: string;
  submittedAt?: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  timeLimit: number;
  grade?: string;
  feedback?: string;
  showCorrectAnswers: boolean;
  showCorrectAnswersAt?: string;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  questionType: string;
  points: number;
  studentResponse: string;
  correctAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  feedback?: string;
}

interface QuizStatistics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTimeSpent: number;
  completionRate: number;
  questionStatistics: {
    questionId: string;
    correctPercentage: number;
    averagePoints: number;
  }[];
}

export default function QuizResultsPage() {
  const { courseId, quizId, attemptId } = useParams<{ 
    courseId: string; 
    quizId: string; 
    attemptId?: string; 
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [result, setResult] = useState<QuizResult | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [statistics, setStatistics] = useState<QuizStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'statistics'>('overview');

  const loadResults = useCallback(async () => {
    if (!courseId || !quizId) return;

    try {
      setLoading(true);
      
      let resultData: QuizResult;
      if (attemptId) {
        resultData = await quizService.getQuizResult(attemptId);
      } else {
        const latestAttempt = await quizService.getLatestAttempt(courseId, quizId);
        if (!latestAttempt) {
          throw new Error('No quiz attempts found');
        }
        resultData = await quizService.getQuizResult(latestAttempt.id);
      }
      
      setResult(resultData);

      if (resultData.status === 'Graded' || resultData.showCorrectAnswers) {
        const canShowAnswers = !resultData.showCorrectAnswersAt || 
          new Date() >= new Date(resultData.showCorrectAnswersAt);
        
        if (canShowAnswers) {
          const questionResultsData = await quizService.getQuestionResults(resultData.attemptId);
          setQuestionResults(questionResultsData);
          setShowAnswers(true);
        }
      }

      const statsData = await quizService.getQuizStatistics(courseId, quizId);
      setStatistics(statsData);

    } catch (error) {
      console.error('Error loading quiz results:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz results. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, quizId, attemptId, toast]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const downloadResults = async () => {
    if (!result) return;

    try {
      const blob = await quizService.downloadQuizResults(result.attemptId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `quiz-results-${result.quizTitle}-attempt-${result.attemptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Quiz results downloaded successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error downloading results:', error);
      toast({
        title: 'Error',
        description: 'Failed to download quiz results.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Quiz results not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/courses/${courseId}/quizzes`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{result.quizTitle}</h1>
              <p className="text-gray-600">Quiz Results - Attempt {result.attemptNumber}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={downloadResults}>
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
            {showAnswers && (
              <Button variant="outline" onClick={() => setActiveTab('details')}>
                <Eye className="h-4 w-4 mr-2" />
                Review Answers
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Award },
                { id: 'details', label: 'Question Details', icon: Eye },
                { id: 'statistics', label: 'Statistics', icon: BarChart3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as 'overview' | 'details' | 'statistics')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Your Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getGradeColor(result.percentage)}`}>
                    {getGradeLetter(result.percentage)}
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900">
                      {result.score} / {result.maxScore}
                    </div>
                    <div className="text-xl text-gray-600">
                      {result.percentage.toFixed(1)}%
                    </div>
                  </div>
                  <Progress value={result.percentage} className="h-3" />
                  {result.grade && (
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      Grade: {result.grade}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Attempt Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={result.status === 'Graded' ? 'default' : 'secondary'}>
                    {result.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Attempt:</span>
                  <span className="font-medium">{result.attemptNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Spent:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{formatTime(result.timeSpent)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time Limit:</span>
                  <span className="font-medium">{formatTime(result.timeLimit * 60)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium">
                    {result.submittedAt 
                      ? new Date(result.submittedAt).toLocaleString()
                      : 'Not submitted'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Card */}
            {result.feedback && (
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Instructor Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{result.feedback}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {showAnswers ? (
              questionResults.map((questionResult, index) => (
                <Card key={questionResult.questionId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Question {index + 1}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={questionResult.isCorrect ? 'default' : 'destructive'}>
                          {questionResult.pointsEarned} / {questionResult.points} points
                        </Badge>
                        {questionResult.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose max-w-none">
                      <p className="text-gray-900 font-medium">{questionResult.questionText}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                        <div className={`p-3 rounded-md ${
                          questionResult.isCorrect 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <p className="text-sm">{questionResult.studentResponse || 'No answer provided'}</p>
                        </div>
                      </div>
                      
                      {questionResult.correctAnswer && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Correct Answer:</h4>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm">{questionResult.correctAnswer}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {questionResult.feedback && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Feedback:</h4>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-sm text-gray-700">{questionResult.feedback}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Answer Review Not Available
                  </h3>
                  <p className="text-gray-600">
                    {result.showCorrectAnswersAt 
                      ? `Answers will be available after ${new Date(result.showCorrectAnswersAt).toLocaleString()}`
                      : 'The instructor has not enabled answer review for this quiz.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && statistics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Attempts:</span>
                  <span className="font-medium">{statistics.totalAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-medium">{statistics.averageScore.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Highest Score:</span>
                  <span className="font-medium">{statistics.highestScore.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Lowest Score:</span>
                  <span className="font-medium">{statistics.lowestScore.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completion Rate:</span>
                  <span className="font-medium">{statistics.completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Time:</span>
                  <span className="font-medium">{formatTime(statistics.averageTimeSpent)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Performance vs Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Your Score</span>
                      <span>{result.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Class Average</span>
                      <span>{statistics.averageScore.toFixed(1)}%</span>
                    </div>
                    <Progress value={statistics.averageScore} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      {result.percentage > statistics.averageScore 
                        ? `You scored ${(result.percentage - statistics.averageScore).toFixed(1)} points above the class average.`
                        : result.percentage < statistics.averageScore
                        ? `You scored ${(statistics.averageScore - result.percentage).toFixed(1)} points below the class average.`
                        : 'You scored exactly at the class average.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
