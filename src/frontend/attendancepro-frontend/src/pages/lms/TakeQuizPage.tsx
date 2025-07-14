import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { quizService } from '../../services/quizService';

interface Question {
  id: string;
  text: string;
  type: 'MultipleChoice' | 'TrueFalse' | 'FillInTheBlank' | 'Essay' | 'Matching' | 'Ordering' | 'Numerical' | 'FileUpload';
  points: number;
  position: number;
  answerChoices?: string[];
  correctAnswer?: string;
  feedback?: string;
}

interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  attemptNumber: number;
  status: 'InProgress' | 'Submitted' | 'Graded';
  startedAt: string;
  submittedAt?: string;
  score: number;
  timeSpent: number;
}

interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  type: string;
  points: number;
  timeLimit: number;
  allowedAttempts: number;
  scoringPolicy: string;
  availableFrom?: string;
  availableUntil?: string;
  dueDate?: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  showCorrectAnswersAt?: string;
  oneQuestionAtATime: boolean;
  cantGoBack: boolean;
  accessCode: string;
  requireLockdownBrowser: boolean;
  questions: Question[];
}

interface QuestionResponse {
  questionId: string;
  response: string;
  isCorrect?: boolean;
  points?: number;
}

export default function TakeQuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  const loadQuiz = useCallback(async () => {
    if (!courseId || !quizId) return;

    try {
      setLoading(true);
      const quizData = await quizService.getQuiz(courseId, quizId);
      setQuiz(quizData);

      if (quizData.accessCode && !accessCode) {
        setShowAccessCodeDialog(true);
        return;
      }

      const existingAttempt = await quizService.getCurrentAttempt(courseId, quizId);
      if (existingAttempt && existingAttempt.status === 'InProgress') {
        setAttempt(existingAttempt);
        const savedResponses = await quizService.getAttemptResponses(existingAttempt.id);
        const responsesMap: Record<string, QuestionResponse> = {};
        savedResponses.forEach((response: QuestionResponse) => {
          responsesMap[response.questionId] = response;
        });
        setResponses(responsesMap);
        
        const elapsed = Math.floor((Date.now() - new Date(existingAttempt.startedAt).getTime()) / 1000);
        setTimeRemaining(Math.max(0, (quizData.timeLimit * 60) - elapsed));
      } else {
        const newAttempt = await quizService.startQuizAttempt(courseId, quizId, accessCode);
        setAttempt(newAttempt);
        setTimeRemaining(quizData.timeLimit * 60);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, quizId, accessCode, toast]);

  const handleAutoSubmit = useCallback(async () => {
    if (!attempt) return;

    try {
      await quizService.submitQuizAttempt(attempt.id, Object.values(responses));
      toast({
        title: 'Quiz Auto-Submitted',
        description: 'Time expired. Your quiz has been automatically submitted.',
        variant: 'default',
      });
      navigate(`/courses/${courseId}/quizzes/${quizId}/results`);
    } catch (error) {
      console.error('Auto-submit failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to auto-submit quiz. Please try submitting manually.',
        variant: 'destructive',
      });
    }
  }, [attempt, responses, toast, navigate, courseId, quizId]);

  const autoSaveResponses = useCallback(async () => {
    if (!attempt) return;

    try {
      setAutoSaveStatus('saving');
      await quizService.saveResponses(attempt.id, Object.values(responses));
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [attempt, responses]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (timeRemaining > 0 && attempt?.status === 'InProgress') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, attempt?.status, handleAutoSubmit]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (attempt && Object.keys(responses).length > 0) {
        autoSaveResponses();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [attempt, responses, autoSaveResponses]);

  const handleResponseChange = (questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        response,
      }
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0 && quiz && !quiz.cantGoBack) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;

    const unansweredQuestions = quiz?.questions.filter(q => !responses[q.id]) || [];
    
    if (unansweredQuestions.length > 0) {
      const confirmed = window.confirm(
        `You have ${unansweredQuestions.length} unanswered questions. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    try {
      setIsSubmitting(true);
      await quizService.submitQuizAttempt(attempt.id, Object.values(responses));
      toast({
        title: 'Quiz Submitted',
        description: 'Your quiz has been submitted successfully.',
        variant: 'default',
      });
      navigate(`/courses/${courseId}/quizzes/${quizId}/results`);
    } catch (error) {
      console.error('Submit failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessCodeSubmit = () => {
    if (accessCode.trim()) {
      setShowAccessCodeDialog(false);
      loadQuiz();
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question) => {
    const response = responses[question.id]?.response || '';

    switch (question.type) {
      case 'MultipleChoice':
        return (
          <div className="space-y-3">
            {question.answerChoices?.map((choice, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice}
                  checked={response === choice}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{choice}</span>
              </label>
            ))}
          </div>
        );

      case 'TrueFalse':
        return (
          <div className="space-y-3">
            {['True', 'False'].map((choice) => (
              <label key={choice} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={choice}
                  checked={response === choice}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">{choice}</span>
              </label>
            ))}
          </div>
        );

      case 'FillInTheBlank':
      case 'Numerical':
        return (
          <input
            type={question.type === 'Numerical' ? 'number' : 'text'}
            value={response}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your answer..."
          />
        );

      case 'Essay':
        return (
          <textarea
            value={response}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Enter your essay response..."
          />
        );

      case 'FileUpload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleResponseChange(question.id, file.name);
                }
              }}
              className="hidden"
              id={`file-${question.id}`}
            />
            <label htmlFor={`file-${question.id}`} className="cursor-pointer">
              <div className="text-gray-500">
                <p>Click to upload a file</p>
                {response && <p className="mt-2 text-sm text-blue-600">Selected: {response}</p>}
              </div>
            </label>
          </div>
        );

      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (showAccessCodeDialog) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Code Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This quiz requires an access code to begin.
            </p>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter access code"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleAccessCodeSubmit} className="w-full">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Quiz not found or unable to start attempt.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(responses).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                <span className={timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <p className="text-sm text-gray-500">Time Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Auto-save Status */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2 text-sm">
              {autoSaveStatus === 'saved' && (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Auto-saved</span>
                </>
              )}
              {autoSaveStatus === 'saving' && (
                <>
                  <Save className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-blue-600">Saving...</span>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Save failed</span>
                </>
              )}
            </div>
            <Badge variant="outline">
              Attempt {attempt.attemptNumber} of {quiz.allowedAttempts}
            </Badge>
          </div>
        </div>

        {/* Question Card */}
        {quiz.oneQuestionAtATime ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {currentQuestion.position}
                </CardTitle>
                <Badge variant="secondary">
                  {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <p className="text-gray-900 leading-relaxed">{currentQuestion.text}</p>
              </div>
              {renderQuestion(currentQuestion)}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {quiz.questions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Question {question.position}
                    </CardTitle>
                    <Badge variant="secondary">
                      {question.points} {question.points === 1 ? 'point' : 'points'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-900 leading-relaxed">{question.text}</p>
                  </div>
                  {renderQuestion(question)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {quiz.oneQuestionAtATime && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0 || quiz.cantGoBack}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === quiz.questions.length - 1}
                  >
                    Next
                  </Button>
                </>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={autoSaveResponses}
                disabled={autoSaveStatus === 'saving'}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </Button>
              <Button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
