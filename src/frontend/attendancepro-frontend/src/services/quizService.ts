import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'

export interface Quiz {
  id: string;
  courseId: string;
  courseName?: string;
  title: string;
  description: string;
  type: QuizType;
  points: number;
  timeLimit?: number;
  availableFrom?: string;
  availableUntil?: string;
  dueDate?: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  showCorrectAnswersAfter?: string;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  scoringPolicy: ScoringPolicy;
  isPublished: boolean;
  questionsCount: number;
  attemptsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  correctAnswers: string[];
  options?: string[];
  explanation?: string;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  userName?: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  maxScore: number;
  status: AttemptStatus;
  timeSpent?: number;
  responses: QuestionResponse[];
}

export interface QuestionResponse {
  id: string;
  attemptId: string;
  questionId: string;
  userAnswer: string[];
  isCorrect: boolean;
  pointsEarned: number;
}

export interface CreateQuizDto {
  courseId: string;
  title: string;
  description: string;
  type: QuizType;
  points: number;
  timeLimit?: number;
  availableFrom?: string;
  availableUntil?: string;
  dueDate?: string;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  showCorrectAnswersAfter?: string;
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  scoringPolicy: ScoringPolicy;
}

export interface CreateQuestionDto {
  questionText: string;
  questionType: QuestionType;
  points: number;
  correctAnswers: string[];
  options?: string[];
  explanation?: string;
  order: number;
}

export interface SubmitQuizAttemptDto {
  responses: {
    questionId: string;
    userAnswer: string[];
  }[];
}

export enum QuizType {
  Practice = 'Practice',
  Graded = 'Graded',
  Survey = 'Survey'
}

export enum QuestionType {
  MultipleChoice = 'MultipleChoice',
  MultipleSelect = 'MultipleSelect',
  TrueFalse = 'TrueFalse',
  ShortAnswer = 'ShortAnswer',
  Essay = 'Essay',
  Matching = 'Matching',
  FillInTheBlank = 'FillInTheBlank'
}

export enum ScoringPolicy {
  KeepHighest = 'KeepHighest',
  KeepLatest = 'KeepLatest',
  Average = 'Average'
}

export enum AttemptStatus {
  InProgress = 'InProgress',
  Submitted = 'Submitted',
  Graded = 'Graded',
  Expired = 'Expired'
}

class QuizService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getQuizzesByCourse(courseId: string, page: number = 1, pageSize: number = 10): Promise<{ data: Quiz[], totalCount: number }> {
    try {
      const response: AxiosResponse<{ data: Quiz[], totalCount: number }> = await this.api.get(
        `/lms/courses/${courseId}/quizzes?page=${page}&pageSize=${pageSize}`
      );
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quizzes');
    }
  }

  async getQuizById(courseId: string, quizId: string): Promise<Quiz> {
    try {
      const response: AxiosResponse<{ data: Quiz }> = await this.api.get(`/lms/courses/${courseId}/quizzes/${quizId}`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz');
    }
  }

  async createQuiz(quiz: CreateQuizDto): Promise<Quiz> {
    try {
      const response: AxiosResponse<{ data: Quiz }> = await this.api.post(`/lms/courses/${quiz.courseId}/quizzes`, quiz);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to create quiz');
    }
  }

  async updateQuiz(courseId: string, quizId: string, quiz: Partial<CreateQuizDto>): Promise<Quiz> {
    try {
      const response: AxiosResponse<{ data: Quiz }> = await this.api.put(`/lms/courses/${courseId}/quizzes/${quizId}`, quiz);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to update quiz');
    }
  }

  async deleteQuiz(courseId: string, quizId: string): Promise<void> {
    try {
      await this.api.delete(`/lms/courses/${courseId}/quizzes/${quizId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to delete quiz');
    }
  }

  async publishQuiz(courseId: string, quizId: string): Promise<void> {
    try {
      await this.api.post(`/lms/courses/${courseId}/quizzes/${quizId}/publish`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to publish quiz');
    }
  }

  async getQuizQuestions(courseId: string, quizId: string): Promise<Question[]> {
    try {
      const response: AxiosResponse<{ data: Question[] }> = await this.api.get(`/lms/courses/${courseId}/quizzes/${quizId}/questions`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz questions');
    }
  }

  async addQuestionToQuiz(courseId: string, quizId: string, question: CreateQuestionDto): Promise<Question> {
    try {
      const response: AxiosResponse<{ data: Question }> = await this.api.post(`/lms/courses/${courseId}/quizzes/${quizId}/questions`, question);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to add question to quiz');
    }
  }

  async updateQuestion(courseId: string, quizId: string, questionId: string, question: Partial<CreateQuestionDto>): Promise<Question> {
    try {
      const response: AxiosResponse<{ data: Question }> = await this.api.put(`/lms/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`, question);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to update question');
    }
  }

  async deleteQuestion(courseId: string, quizId: string, questionId: string): Promise<void> {
    try {
      await this.api.delete(`/lms/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to delete question');
    }
  }

  async startQuizAttempt(courseId: string, quizId: string): Promise<QuizAttempt> {
    try {
      const response: AxiosResponse<{ data: QuizAttempt }> = await this.api.post(`/lms/courses/${courseId}/quizzes/${quizId}/attempts`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to start quiz attempt');
    }
  }

  async submitQuizAttempt(courseId: string, quizId: string, attemptId: string, submission: SubmitQuizAttemptDto): Promise<QuizAttempt> {
    try {
      const response: AxiosResponse<{ data: QuizAttempt }> = await this.api.post(`/lms/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}/submit`, submission);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to submit quiz attempt');
    }
  }

  async getQuizAttempts(courseId: string, quizId: string, userId?: string): Promise<QuizAttempt[]> {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response: AxiosResponse<{ data: QuizAttempt[] }> = await this.api.get(`/lms/courses/${courseId}/quizzes/${quizId}/attempts${params}`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz attempts');
    }
  }

  async getQuizAttempt(courseId: string, quizId: string, attemptId: string): Promise<QuizAttempt> {
    try {
      const response: AxiosResponse<{ data: QuizAttempt }> = await this.api.get(`/lms/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz attempt');
    }
  }

  async getQuizStatistics(courseId: string, quizId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
    averageTimeSpent: number;
  }> {
    try {
      const response: AxiosResponse<{ data: any }> = await this.api.get(`/lms/courses/${courseId}/quizzes/${quizId}/statistics`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch quiz statistics');
    }
  }
}

export const quizService = new QuizService();
export type { QuizService };
