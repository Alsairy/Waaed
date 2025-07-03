import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Users, BookOpen, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Quiz, QuizType, AttemptStatus } from '../../services/quizService';
import { formatDate, formatDuration } from '../../utils/date-utils';

interface QuizCardProps {
  quiz: Quiz;
  userAttempt?: {
    id: string;
    status: AttemptStatus;
    score?: number;
    submittedAt?: string;
  };
  onTakeQuiz?: (quizId: string) => void;
  onViewResults?: (quizId: string, attemptId: string) => void;
  onEditQuiz?: (quizId: string) => void;
  isTeacher?: boolean;
  className?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  userAttempt,
  onTakeQuiz,
  onViewResults,
  onEditQuiz,
  isTeacher = false,
  className = ''
}) => {

  const getQuizTypeColor = (type: QuizType) => {
    switch (type) {
      case QuizType.Graded:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case QuizType.Practice:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case QuizType.Survey:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = () => {
    if (!userAttempt) return null;
    
    switch (userAttempt.status) {
      case AttemptStatus.Submitted:
      case AttemptStatus.Graded:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case AttemptStatus.InProgress:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case AttemptStatus.Expired:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const isAvailable = () => {
    const now = new Date();
    const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
    const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null;
    
    if (availableFrom && now < availableFrom) return false;
    if (availableUntil && now > availableUntil) return false;
    return quiz.isPublished;
  };

  const canTakeQuiz = () => {
    if (!isAvailable()) return false;
    if (!userAttempt) return true;
    if (!quiz.allowMultipleAttempts) return userAttempt.status === AttemptStatus.InProgress;
    if (quiz.maxAttempts && quiz.attemptsCount >= quiz.maxAttempts) return false;
    return userAttempt.status !== AttemptStatus.InProgress;
  };

  const getActionButton = () => {
    if (isTeacher) {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditQuiz?.(quiz.id)}
          className="w-full"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Edit Quiz
        </Button>
      );
    }

    if (userAttempt?.status === AttemptStatus.InProgress) {
      return (
        <Button
          onClick={() => onTakeQuiz?.(quiz.id)}
          className="w-full"
        >
          Continue Quiz
        </Button>
      );
    }

    if (userAttempt && (userAttempt.status === AttemptStatus.Submitted || userAttempt.status === AttemptStatus.Graded)) {
      return (
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewResults?.(quiz.id, userAttempt.id)}
            className="w-full"
          >
            View Results
          </Button>
          {canTakeQuiz() && (
            <Button
              onClick={() => onTakeQuiz?.(quiz.id)}
              size="sm"
              className="w-full"
            >
              Retake Quiz
            </Button>
          )}
        </div>
      );
    }

    if (canTakeQuiz()) {
      return (
        <Button
          onClick={() => onTakeQuiz?.(quiz.id)}
          className="w-full"
        >
          Start Quiz
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        disabled
        className="w-full"
      >
        {!isAvailable() ? 'Not Available' : 'Completed'}
      </Button>
    );
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {quiz.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getQuizTypeColor(quiz.type)}>
                {quiz.type}
              </Badge>
              {getStatusIcon()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {quiz.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {quiz.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <span>{quiz.questionsCount} Questions</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{quiz.points} Points</span>
          </div>

          {quiz.timeLimit && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{formatDuration(quiz.timeLimit)}</span>
            </div>
          )}

          {quiz.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{formatDate(quiz.dueDate)}</span>
            </div>
          )}
        </div>

        {userAttempt && userAttempt.score !== undefined && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Your Score</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {userAttempt.score}%
              </span>
            </div>
            {userAttempt.submittedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Submitted on {formatDate(userAttempt.submittedAt)}
              </p>
            )}
          </div>
        )}

        {isTeacher && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Attempts: </span>
                <span>{quiz.attemptsCount}</span>
              </div>
              <div>
                <span className="font-medium">Published: </span>
                <span>{quiz.isPublished ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCard;
