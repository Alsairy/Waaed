import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Question, QuestionType } from '../../services/quizService';
import { useTranslation } from '../../lib/i18n/LanguageContext';

interface QuestionComponentProps {
  question: Question;
  userAnswer?: string[];
  onAnswerChange?: (questionId: string, answer: string[]) => void;
  showCorrectAnswer?: boolean;
  showExplanation?: boolean;
  isReadOnly?: boolean;
  questionNumber?: number;
  className?: string;
}

export const QuestionComponent: React.FC<QuestionComponentProps> = ({
  question,
  userAnswer = [],
  onAnswerChange,
  showCorrectAnswer = false,
  showExplanation = false,
  isReadOnly = false,
  questionNumber,
  className = ''
}) => {
  const { t } = useTranslation();
  const [localAnswer, setLocalAnswer] = useState<string[]>(userAnswer);

  const handleAnswerChange = (newAnswer: string[]) => {
    setLocalAnswer(newAnswer);
    onAnswerChange?.(question.id, newAnswer);
  };

  const isCorrectAnswer = (option: string) => {
    return question.correctAnswers.includes(option);
  };

  const isUserAnswerCorrect = () => {
    if (!showCorrectAnswer) return null;
    
    const sortedUserAnswer = [...localAnswer].sort();
    const sortedCorrectAnswer = [...question.correctAnswers].sort();
    
    return JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
  };

  const getAnswerStatus = (option: string) => {
    if (!showCorrectAnswer) return null;
    
    const isCorrect = isCorrectAnswer(option);
    const isSelected = localAnswer.includes(option);
    
    if (isCorrect && isSelected) return 'correct-selected';
    if (isCorrect && !isSelected) return 'correct-unselected';
    if (!isCorrect && isSelected) return 'incorrect-selected';
    return null;
  };

  const renderMultipleChoice = () => (
    <RadioGroup
      value={localAnswer[0] || ''}
      onValueChange={(value) => handleAnswerChange([value])}
      disabled={isReadOnly}
      className="space-y-3"
    >
      {question.options?.map((option, index) => {
        const status = getAnswerStatus(option);
        return (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
              status === 'correct-selected'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : status === 'correct-unselected'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : status === 'incorrect-selected'
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <RadioGroupItem value={option} id={`${question.id}-${index}`} />
            <Label
              htmlFor={`${question.id}-${index}`}
              className="flex-1 cursor-pointer"
            >
              {option}
            </Label>
            {showCorrectAnswer && isCorrectAnswer(option) && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {t.education.correct}
              </Badge>
            )}
          </div>
        );
      })}
    </RadioGroup>
  );

  const renderMultipleSelect = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => {
        const status = getAnswerStatus(option);
        return (
          <div
            key={index}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
              status === 'correct-selected'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : status === 'correct-unselected'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : status === 'incorrect-selected'
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Checkbox
              id={`${question.id}-${index}`}
              checked={localAnswer.includes(option)}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleAnswerChange([...localAnswer, option]);
                } else {
                  handleAnswerChange(localAnswer.filter(a => a !== option));
                }
              }}
              disabled={isReadOnly}
            />
            <Label
              htmlFor={`${question.id}-${index}`}
              className="flex-1 cursor-pointer"
            >
              {option}
            </Label>
            {showCorrectAnswer && isCorrectAnswer(option) && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {t.education.correct}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTrueFalse = () => (
    <RadioGroup
      value={localAnswer[0] || ''}
      onValueChange={(value) => handleAnswerChange([value])}
      disabled={isReadOnly}
      className="space-y-3"
    >
      {['True', 'False'].map((option) => {
        const status = getAnswerStatus(option);
        return (
          <div
            key={option}
            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
              status === 'correct-selected'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : status === 'correct-unselected'
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : status === 'incorrect-selected'
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <RadioGroupItem value={option} id={`${question.id}-${option}`} />
            <Label
              htmlFor={`${question.id}-${option}`}
              className="flex-1 cursor-pointer"
            >
              {option === 'True' ? t.education.true : t.education.false}
            </Label>
            {showCorrectAnswer && isCorrectAnswer(option) && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {t.education.correct}
              </Badge>
            )}
          </div>
        );
      })}
    </RadioGroup>
  );

  const renderShortAnswer = () => (
    <div className="space-y-2">
      <Input
        value={localAnswer[0] || ''}
        onChange={(e) => handleAnswerChange([e.target.value])}
        placeholder={t.education.enterAnswer}
        disabled={isReadOnly}
        className={
          showCorrectAnswer
            ? isUserAnswerCorrect()
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : ''
        }
      />
      {showCorrectAnswer && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{t.education.correctAnswer}: </span>
          {question.correctAnswers.join(', ')}
        </div>
      )}
    </div>
  );

  const renderEssay = () => (
    <div className="space-y-2">
      <Textarea
        value={localAnswer[0] || ''}
        onChange={(e) => handleAnswerChange([e.target.value])}
        placeholder={t.education.enterEssayAnswer}
        disabled={isReadOnly}
        rows={6}
        className="min-h-[120px]"
      />
      {showCorrectAnswer && question.correctAnswers[0] && (
        <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="font-medium">{t.education.sampleAnswer}: </span>
          <p className="mt-1">{question.correctAnswers[0]}</p>
        </div>
      )}
    </div>
  );

  const renderFillInTheBlank = () => {
    const parts = question.questionText.split('___');
    
    return (
      <div className="space-y-4">
        <div className="text-base">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && (
                <Input
                  value={localAnswer[index] || ''}
                  onChange={(e) => {
                    const newAnswer = [...localAnswer];
                    newAnswer[index] = e.target.value;
                    handleAnswerChange(newAnswer);
                  }}
                  className={`inline-block w-32 mx-2 ${
                    showCorrectAnswer
                      ? localAnswer[index] === question.correctAnswers[index]
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : ''
                  }`}
                  disabled={isReadOnly}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        {showCorrectAnswer && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{t.education.correctAnswers}: </span>
            {question.correctAnswers.join(', ')}
          </div>
        )}
      </div>
    );
  };

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case QuestionType.MultipleChoice:
        return renderMultipleChoice();
      case QuestionType.MultipleSelect:
        return renderMultipleSelect();
      case QuestionType.TrueFalse:
        return renderTrueFalse();
      case QuestionType.ShortAnswer:
        return renderShortAnswer();
      case QuestionType.Essay:
        return renderEssay();
      case QuestionType.FillInTheBlank:
        return renderFillInTheBlank();
      default:
        return <div>{t.education.unsupportedQuestionType}</div>;
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-3">
            {questionNumber && (
              <Badge variant="outline" className="text-sm">
                {questionNumber}
              </Badge>
            )}
            <div className="flex-1">
              {question.questionType === QuestionType.FillInTheBlank ? (
                <div className="text-base font-normal">
                  {question.questionText.includes('___') ? '' : question.questionText}
                </div>
              ) : (
                question.questionText
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {question.points} {question.points === 1 ? t.education.point : t.education.points}
            </Badge>
            {showCorrectAnswer && (
              <Badge
                variant={isUserAnswerCorrect() ? 'default' : 'destructive'}
                className={
                  isUserAnswerCorrect()
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }
              >
                {isUserAnswerCorrect() ? t.education.correct : t.education.incorrect}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {renderQuestionContent()}
        
        {showExplanation && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              {t.education.explanation}
            </h4>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {question.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionComponent;
