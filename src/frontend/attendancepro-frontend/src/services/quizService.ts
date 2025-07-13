import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export interface Quiz {
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
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  questionCount: number;
  attemptCount: number;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'MultipleChoice' | 'TrueFalse' | 'FillInTheBlank' | 'Essay' | 'Matching' | 'Ordering' | 'Numerical' | 'FileUpload';
  points: number;
  position: number;
  answerChoices?: string[];
  correctAnswer?: string;
  feedback?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  attemptNumber: number;
  status: 'InProgress' | 'Submitted' | 'Graded';
  startedAt: string;
  submittedAt?: string;
  score: number;
  timeSpent: number;
  workflowState: string;
}

export interface QuestionResponse {
  questionId: string;
  response: string;
  isCorrect?: boolean;
  points?: number;
}

export interface QuizResult {
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

export interface QuestionResult {
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

export interface QuizStatistics {
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

export interface CreateQuizDto {
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
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  instructions?: string;
  type?: string;
  points?: number;
  timeLimit?: number;
  allowedAttempts?: number;
  scoringPolicy?: string;
  availableFrom?: string;
  availableUntil?: string;
  dueDate?: string;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  showCorrectAnswers?: boolean;
  showCorrectAnswersAt?: string;
  oneQuestionAtATime?: boolean;
  cantGoBack?: boolean;
  accessCode?: string;
  requireLockdownBrowser?: boolean;
}

class QuizService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/lms`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getQuizzes(courseId: string, page = 1, pageSize = 10): Promise<{ data: Quiz[]; totalCount: number }> {
    try {
      const response: AxiosResponse<{success: boolean; data: { data: Quiz[]; totalCount: number }; message: string}> = await this.api.get(`/courses/${courseId}/quizzes`, {
        params: { page, pageSize }
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quizzes');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quizzes');
    }
  }

  async getQuiz(courseId: string, quizId: string): Promise<Quiz> {
    try {
      const response: AxiosResponse<{success: boolean; data: Quiz; message: string}> = await this.api.get(`/courses/${courseId}/quizzes/${quizId}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quiz');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz');
    }
  }

  async createQuiz(courseId: string, quiz: CreateQuizDto): Promise<Quiz> {
    try {
      const response: AxiosResponse<{success: boolean; data: Quiz; message: string}> = await this.api.post(`/courses/${courseId}/quizzes`, quiz);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create quiz');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create quiz');
    }
  }

  async updateQuiz(courseId: string, quizId: string, quiz: UpdateQuizDto): Promise<Quiz> {
    try {
      const response: AxiosResponse<{success: boolean; data: Quiz; message: string}> = await this.api.put(`/courses/${courseId}/quizzes/${quizId}`, quiz);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update quiz');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update quiz');
    }
  }

  async deleteQuiz(courseId: string, quizId: string): Promise<void> {
    try {
      await this.api.delete(`/courses/${courseId}/quizzes/${quizId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete quiz');
    }
  }

  async startQuizAttempt(courseId: string, quizId: string, accessCode?: string): Promise<QuizAttempt> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuizAttempt; message: string}> = await this.api.post(`/courses/${courseId}/quizzes/${quizId}/attempts`, {
        accessCode
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to start quiz attempt');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to start quiz attempt');
    }
  }

  async getCurrentAttempt(courseId: string, quizId: string): Promise<QuizAttempt | null> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuizAttempt; message: string}> = await this.api.get(`/courses/${courseId}/quizzes/${quizId}/attempts/current`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return null;
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } }
      if (errorObj.response?.status === 404) {
        return null;
      }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch current attempt');
    }
  }

  async getLatestAttempt(courseId: string, quizId: string): Promise<QuizAttempt | null> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuizAttempt; message: string}> = await this.api.get(`/courses/${courseId}/quizzes/${quizId}/attempts/latest`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return null;
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { status?: number; data?: { message?: string } } }
      if (errorObj.response?.status === 404) {
        return null;
      }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch latest attempt');
    }
  }

  async getAttemptResponses(attemptId: string): Promise<QuestionResponse[]> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuestionResponse[]; message: string}> = await this.api.get(`/quiz-attempts/${attemptId}/responses`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch attempt responses');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch attempt responses');
    }
  }

  async saveResponses(attemptId: string, responses: QuestionResponse[]): Promise<void> {
    try {
      await this.api.post(`/quiz-attempts/${attemptId}/responses`, {
        responses
      });
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to save responses');
    }
  }

  async submitQuizAttempt(attemptId: string, responses: QuestionResponse[]): Promise<QuizResult> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuizResult; message: string}> = await this.api.post(`/quiz-attempts/${attemptId}/submit`, {
        responses
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to submit quiz attempt');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to submit quiz attempt');
    }
  }

  async getQuizResult(attemptId: string): Promise<QuizResult> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuizResult; message: string}> = await this.api.get(`/quiz-attempts/${attemptId}/result`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quiz result');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz result');
    }
  }

  async getQuestionResults(attemptId: string): Promise<QuestionResult[]> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuestionResult[]; message: string}> = await this.api.get(`/quiz-attempts/${attemptId}/question-results`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch question results');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch question results');
    }
  }

  async getQuizStatistics(courseId: string, quizId: string): Promise<QuizStatistics> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuizStatistics; message: string}> = await this.api.get(`/courses/${courseId}/quizzes/${quizId}/statistics`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quiz statistics');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz statistics');
    }
  }

  async downloadQuizResults(attemptId: string): Promise<Blob> {
    try {
      const response = await this.api.get(`/quiz-attempts/${attemptId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to download quiz results');
    }
  }

  async getQuizQuestions(courseId: string, quizId: string): Promise<Question[]> {
    try {
      const response: AxiosResponse<{success: boolean; data: Question[]; message: string}> = await this.api.get(`/courses/${courseId}/quizzes/${quizId}/questions`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quiz questions');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz questions');
    }
  }

  async createQuestion(courseId: string, quizId: string, question: Partial<Question>): Promise<Question> {
    try {
      const response: AxiosResponse<{success: boolean; data: Question; message: string}> = await this.api.post(`/courses/${courseId}/quizzes/${quizId}/questions`, question);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create question');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to create question');
    }
  }

  async updateQuestion(courseId: string, quizId: string, questionId: string, question: Partial<Question>): Promise<Question> {
    try {
      const response: AxiosResponse<{success: boolean; data: Question; message: string}> = await this.api.put(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`, question);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update question');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to update question');
    }
  }

  async deleteQuestion(courseId: string, quizId: string, questionId: string): Promise<void> {
    try {
      await this.api.delete(`/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to delete question');
    }
  }

  async getStudentQuizzes(courseId: string): Promise<Quiz[]> {
    try {
      const response: AxiosResponse<{success: boolean; data: Quiz[]; message: string}> = await this.api.get(`/courses/${courseId}/quizzes/student`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch student quizzes');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch student quizzes');
    }
  }

  async getInstructorQuizzes(courseId: string): Promise<Quiz[]> {
    try {
      const response: AxiosResponse<{success: boolean; data: Quiz[]; message: string}> = await this.api.get(`/courses/${courseId}/quizzes/instructor`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch instructor quizzes');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch instructor quizzes');
    }
  }

  async getQuizAttempts(courseId: string, quizId: string): Promise<QuizAttempt[]> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuizAttempt[]; message: string}> = await this.api.get(`/courses/${courseId}/quizzes/${quizId}/attempts`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch quiz attempts');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz attempts');
    }
  }

  async gradeQuizAttempt(attemptId: string, grade: number, feedback?: string): Promise<QuizResult> {
    try {
      const response: AxiosResponse<{success: boolean; data: QuizResult; message: string}> = await this.api.post(`/quiz-attempts/${attemptId}/grade`, {
        grade,
        feedback
      });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to grade quiz attempt');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to grade quiz attempt');
    }
  }

  async publishQuiz(courseId: string, quizId: string): Promise<Quiz> {
    try {
      const response: AxiosResponse<{success: boolean; data: Quiz; message: string}> = await this.api.post(`/courses/${courseId}/quizzes/${quizId}/publish`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to publish quiz');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to publish quiz');
    }
  }

  async unpublishQuiz(courseId: string, quizId: string): Promise<Quiz> {
    try {
      const response: AxiosResponse<{success: boolean; data: Quiz; message: string}> = await this.api.post(`/courses/${courseId}/quizzes/${quizId}/unpublish`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to unpublish quiz');
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } }
      throw new Error(errorObj.response?.data?.message || 'Failed to unpublish quiz');
    }
  }
}

export const quizService = new QuizService();
