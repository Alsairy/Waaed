import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  Play,
  BarChart3
} from 'lucide-react';
import { quizService, Quiz, Question, QuizAttempt } from '../../services/quizService';

interface CreateQuizRequest {
  title: string;
  description: string;
  courseId: string;
  timeLimit: number;
  maxAttempts: number;
  passingScore: number;
  isPublished: boolean;
  availableFrom: string;
  availableUntil: string;
  instructions: string;
}

interface CreateQuestionRequest {
  questionText: string;
  questionType: 'MultipleChoice' | 'TrueFalse' | 'Essay' | 'FillInTheBlank';
  points: number;
  options: string[];
  correctAnswers: string[];
  explanation?: string;
}

export function QuizManagementPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  
  const [showCreateQuizDialog, setShowCreateQuizDialog] = useState(false);
  const [showCreateQuestionDialog, setShowCreateQuestionDialog] = useState(false);
  const [showQuizDetailsDialog, setShowQuizDetailsDialog] = useState(false);
  const [showAttemptsDialog, setShowAttemptsDialog] = useState(false);
  
  const [newQuiz, setNewQuiz] = useState<CreateQuizRequest>({
    title: '',
    description: '',
    courseId: '',
    timeLimit: 60,
    maxAttempts: 3,
    passingScore: 70,
    isPublished: false,
    availableFrom: '',
    availableUntil: '',
    instructions: ''
  });
  
  const [newQuestion, setNewQuestion] = useState<CreateQuestionRequest>({
    questionText: '',
    questionType: 'MultipleChoice',
    points: 1,
    options: ['', '', '', ''],
    correctAnswers: [],
    explanation: ''
  });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      const quizzesData = await quizService.getQuizzes();
      setQuizzes(quizzesData);
    } catch (err) {
      setError('Failed to load quizzes');
      console.error('Error loading quizzes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuizQuestions = async (quizId: string) => {
    try {
      const questionsData = await quizService.getQuizQuestions(quizId);
      setQuestions(questionsData);
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  const loadQuizAttempts = async (quizId: string) => {
    try {
      const attemptsData = await quizService.getQuizAttempts(quizId);
      setAttempts(attemptsData);
    } catch (err) {
      console.error('Error loading attempts:', err);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      await quizService.createQuiz(newQuiz);
      setShowCreateQuizDialog(false);
      setNewQuiz({
        title: '',
        description: '',
        courseId: '',
        timeLimit: 60,
        maxAttempts: 3,
        passingScore: 70,
        isPublished: false,
        availableFrom: '',
        availableUntil: '',
        instructions: ''
      });
      loadQuizzes();
    } catch (err) {
      setError('Failed to create quiz');
      console.error('Error creating quiz:', err);
    }
  };

  const handleCreateQuestion = async () => {
    if (!selectedQuiz) return;
    
    try {
      await quizService.createQuestion(selectedQuiz.id, newQuestion);
      setShowCreateQuestionDialog(false);
      setNewQuestion({
        questionText: '',
        questionType: 'MultipleChoice',
        points: 1,
        options: ['', '', '', ''],
        correctAnswers: [],
        explanation: ''
      });
      loadQuizQuestions(selectedQuiz.id);
    } catch (err) {
      setError('Failed to create question');
      console.error('Error creating question:', err);
    }
  };

  const handlePublishQuiz = async (quizId: string) => {
    try {
      await quizService.publishQuiz(quizId);
      loadQuizzes();
    } catch (err) {
      setError('Failed to publish quiz');
      console.error('Error publishing quiz:', err);
    }
  };

  const handleUnpublishQuiz = async (quizId: string) => {
    try {
      await quizService.unpublishQuiz(quizId);
      loadQuizzes();
    } catch (err) {
      setError('Failed to unpublish quiz');
      console.error('Error unpublishing quiz:', err);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizService.deleteQuiz(quizId);
        loadQuizzes();
      } catch (err) {
        setError('Failed to delete quiz');
        console.error('Error deleting quiz:', err);
      }
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await quizService.deleteQuestion(questionId);
        if (selectedQuiz) {
          loadQuizQuestions(selectedQuiz.id);
        }
      } catch (err) {
        setError('Failed to delete question');
        console.error('Error deleting question:', err);
      }
    }
  };

  const handleViewQuizDetails = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    await loadQuizQuestions(quiz.id);
    setShowQuizDetailsDialog(true);
  };

  const handleViewAttempts = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    await loadQuizAttempts(quiz.id);
    setShowAttemptsDialog(true);
  };

  const getStatusColor = (isPublished: boolean, availableFrom: string, availableUntil: string) => {
    const now = new Date();
    const startDate = new Date(availableFrom);
    const endDate = new Date(availableUntil);
    
    if (!isPublished) return 'bg-gray-100 text-gray-800';
    if (now < startDate) return 'bg-yellow-100 text-yellow-800';
    if (now > endDate) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isPublished: boolean, availableFrom: string, availableUntil: string) => {
    const now = new Date();
    const startDate = new Date(availableFrom);
    const endDate = new Date(availableUntil);
    
    if (!isPublished) return 'Draft';
    if (now < startDate) return 'Scheduled';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateQuizStats = (quiz: Quiz) => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quiz.id);
    const totalAttempts = quizAttempts.length;
    const passedAttempts = quizAttempts.filter(attempt => attempt.score >= quiz.passingScore).length;
    const averageScore = totalAttempts > 0 
      ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts 
      : 0;
    
    return {
      totalAttempts,
      passedAttempts,
      passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
      averageScore
    };
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || getStatusText(quiz.isPublished, quiz.availableFrom, quiz.availableUntil) === statusFilter;
    const matchesCourse = !courseFilter || quiz.courseId === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading quizzes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          <p className="text-gray-600">Create and manage quizzes, questions, and track student performance</p>
        </div>
        <Dialog open={showCreateQuizDialog} onOpenChange={setShowCreateQuizDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Quiz Title"
                value={newQuiz.title}
                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
              />
              <Textarea
                placeholder="Quiz Description"
                value={newQuiz.description}
                onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
              />
              <Input
                placeholder="Course ID"
                value={newQuiz.courseId}
                onChange={(e) => setNewQuiz({ ...newQuiz, courseId: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Time Limit (minutes)</label>
                  <Input
                    type="number"
                    value={newQuiz.timeLimit}
                    onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Attempts</label>
                  <Input
                    type="number"
                    value={newQuiz.maxAttempts}
                    onChange={(e) => setNewQuiz({ ...newQuiz, maxAttempts: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Passing Score (%)</label>
                <Input
                  type="number"
                  value={newQuiz.passingScore}
                  onChange={(e) => setNewQuiz({ ...newQuiz, passingScore: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Available From</label>
                  <Input
                    type="datetime-local"
                    value={newQuiz.availableFrom}
                    onChange={(e) => setNewQuiz({ ...newQuiz, availableFrom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Available Until</label>
                  <Input
                    type="datetime-local"
                    value={newQuiz.availableUntil}
                    onChange={(e) => setNewQuiz({ ...newQuiz, availableUntil: e.target.value })}
                  />
                </div>
              </div>
              <Textarea
                placeholder="Instructions for students"
                value={newQuiz.instructions}
                onChange={(e) => setNewQuiz({ ...newQuiz, instructions: e.target.value })}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={newQuiz.isPublished}
                  onCheckedChange={(checked) => setNewQuiz({ ...newQuiz, isPublished: checked as boolean })}
                />
                <label htmlFor="published" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>
              <Button onClick={handleCreateQuiz} className="w-full">
                Create Quiz
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search quizzes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => {
          const stats = calculateQuizStats(quiz);
          return (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {quiz.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                  </div>
                  <Badge className={getStatusColor(quiz.isPublished, quiz.availableFrom, quiz.availableUntil)}>
                    {getStatusText(quiz.isPublished, quiz.availableFrom, quiz.availableUntil)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{quiz.timeLimit} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{stats.totalAttempts} attempts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{stats.passRate.toFixed(1)}% pass rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <span>{stats.averageScore.toFixed(1)}% avg score</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Available: {formatDate(quiz.availableFrom)} - {formatDate(quiz.availableUntil)}</p>
                    <p>Passing Score: {quiz.passingScore}% | Max Attempts: {quiz.maxAttempts}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewQuizDetails(quiz)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAttempts(quiz)}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      View Attempts
                    </Button>

                    {quiz.isPublished ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnpublishQuiz(quiz.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishQuiz(quiz.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showQuizDetailsDialog} onOpenChange={setShowQuizDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {selectedQuiz?.title} - Questions
            </DialogTitle>
          </DialogHeader>
          {selectedQuiz && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">{questions.length} questions</p>
                <Dialog open={showCreateQuestionDialog} onOpenChange={setShowCreateQuestionDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Question Text"
                        value={newQuestion.questionText}
                        onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                      />
                      <Select
                        value={newQuestion.questionType}
                        onValueChange={(value: 'MultipleChoice' | 'TrueFalse' | 'Essay' | 'FillInTheBlank') =>
                          setNewQuestion({ ...newQuestion, questionType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MultipleChoice">Multiple Choice</SelectItem>
                          <SelectItem value="TrueFalse">True/False</SelectItem>
                          <SelectItem value="Essay">Essay</SelectItem>
                          <SelectItem value="FillInTheBlank">Fill in the Blank</SelectItem>
                        </SelectContent>
                      </Select>
                      <div>
                        <label className="text-sm font-medium">Points</label>
                        <Input
                          type="number"
                          value={newQuestion.points}
                          onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                        />
                      </div>
                      {(newQuestion.questionType === 'MultipleChoice' || newQuestion.questionType === 'TrueFalse') && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Options</label>
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Checkbox
                                checked={newQuestion.correctAnswers.includes(option)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewQuestion({
                                      ...newQuestion,
                                      correctAnswers: [...newQuestion.correctAnswers, option]
                                    });
                                  } else {
                                    setNewQuestion({
                                      ...newQuestion,
                                      correctAnswers: newQuestion.correctAnswers.filter(ans => ans !== option)
                                    });
                                  }
                                }}
                              />
                              <Input
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...newQuestion.options];
                                  newOptions[index] = e.target.value;
                                  setNewQuestion({ ...newQuestion, options: newOptions });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <Textarea
                        placeholder="Explanation (Optional)"
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                      />
                      <Button onClick={handleCreateQuestion} className="w-full">
                        Create Question
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">Q{index + 1}.</span>
                          <Badge variant="outline">{question.questionType}</Badge>
                          <Badge variant="outline">{question.points} pts</Badge>
                        </div>
                        <p className="mb-2">{question.questionText}</p>
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`text-sm p-2 rounded ${
                                  question.correctAnswers.includes(option)
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {question.correctAnswers.includes(option) && (
                                  <CheckCircle className="w-4 h-4 inline ml-2" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.explanation && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAttemptsDialog} onOpenChange={setShowAttemptsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {selectedQuiz?.title} - Attempts
            </DialogTitle>
          </DialogHeader>
          {selectedQuiz && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">{attempts.length}</div>
                  <div className="text-sm text-gray-600">Total Attempts</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {attempts.filter(a => a.score >= selectedQuiz.passingScore).length}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="text-2xl font-bold text-yellow-600">
                    {attempts.length > 0 ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {attempts.length > 0 ? ((attempts.filter(a => a.score >= selectedQuiz.passingScore).length / attempts.length) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Pass Rate</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {attempts.map((attempt) => (
                  <Card key={attempt.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{attempt.studentName}</p>
                        <p className="text-sm text-gray-600">
                          Submitted: {formatDate(attempt.submittedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          attempt.score >= selectedQuiz.passingScore ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {attempt.score}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {attempt.score >= selectedQuiz.passingScore ? 'Passed' : 'Failed'}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
