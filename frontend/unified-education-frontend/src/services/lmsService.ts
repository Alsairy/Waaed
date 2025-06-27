import { apiClient } from './api';
import { 
  Course, 
  Assignment, 
  Quiz, 
  Discussion, 
  Rubric, 
  LearningOutcome, 
  CourseEnrollment,
  Submission
} from '../types/api';

export const lmsService = {
  getCourses: async (params?: { page?: number; pageSize?: number; status?: string; category?: string }) => {
    const response = await apiClient.get('/api/lms/courses', { params });
    return response.data.data || response.data;
  },
  
  getCourse: async (id: string) => {
    const response = await apiClient.get(`/api/lms/courses/${id}`);
    return response.data.data || response.data;
  },
  
  createCourse: async (courseData: Partial<Course>) => {
    const response = await apiClient.post('/api/lms/courses', courseData);
    return response.data.data || response.data;
  },
  
  updateCourse: async (id: string, courseData: Partial<Course>) => {
    const response = await apiClient.put(`/api/lms/courses/${id}`, courseData);
    return response.data.data || response.data;
  },
  
  deleteCourse: async (id: string) => {
    const response = await apiClient.delete(`/api/lms/courses/${id}`);
    return response.data.data || response.data;
  },

  getAssignments: async (courseId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/assignments`, { params });
    return response.data.data || response.data;
  },

  getAssignment: async (courseId: string, id: string) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/assignments/${id}`);
    return response.data.data || response.data;
  },

  createAssignment: async (courseId: string, assignmentData: Partial<Assignment>) => {
    const response = await apiClient.post(`/api/lms/courses/${courseId}/assignments`, assignmentData);
    return response.data.data || response.data;
  },

  updateAssignment: async (courseId: string, id: string, assignmentData: Partial<Assignment>) => {
    const response = await apiClient.put(`/api/lms/courses/${courseId}/assignments/${id}`, assignmentData);
    return response.data.data || response.data;
  },

  deleteAssignment: async (courseId: string, id: string) => {
    const response = await apiClient.delete(`/api/lms/courses/${courseId}/assignments/${id}`);
    return response.data.data || response.data;
  },

  getSubmissions: async (courseId: string, assignmentId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/assignments/${assignmentId}/submissions`, { params });
    return response.data.data || response.data;
  },

  submitAssignment: async (courseId: string, assignmentId: string, submissionData: Partial<Submission>) => {
    const response = await apiClient.post(`/api/lms/courses/${courseId}/assignments/${assignmentId}/submissions`, submissionData);
    return response.data.data || response.data;
  },

  gradeSubmission: async (courseId: string, assignmentId: string, submissionId: string, gradeData: { grade: number; feedback: string }) => {
    const response = await apiClient.put(`/api/lms/courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`, gradeData);
    return response.data.data || response.data;
  },

  getQuizzes: async (courseId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/quizzes`, { params });
    return response.data.data || response.data;
  },

  getQuiz: async (courseId: string, id: string) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/quizzes/${id}`);
    return response.data.data || response.data;
  },

  createQuiz: async (courseId: string, quizData: Partial<Quiz>) => {
    const response = await apiClient.post(`/api/lms/courses/${courseId}/quizzes`, quizData);
    return response.data.data || response.data;
  },

  updateQuiz: async (courseId: string, id: string, quizData: Partial<Quiz>) => {
    const response = await apiClient.put(`/api/lms/courses/${courseId}/quizzes/${id}`, quizData);
    return response.data.data || response.data;
  },

  deleteQuiz: async (courseId: string, id: string) => {
    const response = await apiClient.delete(`/api/lms/courses/${courseId}/quizzes/${id}`);
    return response.data.data || response.data;
  },

  startQuizAttempt: async (courseId: string, quizId: string) => {
    const response = await apiClient.post(`/api/lms/courses/${courseId}/quizzes/${quizId}/attempts`);
    return response.data.data || response.data;
  },

  submitQuizAttempt: async (courseId: string, quizId: string, attemptId: string, responses: any[]) => {
    const response = await apiClient.put(`/api/lms/courses/${courseId}/quizzes/${quizId}/attempts/${attemptId}`, { responses });
    return response.data.data || response.data;
  },

  getDiscussions: async (courseId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/discussions`, { params });
    return response.data.data || response.data;
  },

  getDiscussion: async (courseId: string, id: string) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/discussions/${id}`);
    return response.data.data || response.data;
  },

  createDiscussion: async (courseId: string, discussionData: Partial<Discussion>) => {
    const response = await apiClient.post(`/api/lms/courses/${courseId}/discussions`, discussionData);
    return response.data.data || response.data;
  },

  getDiscussionPosts: async (courseId: string, discussionId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/discussions/${discussionId}/posts`, { params });
    return response.data.data || response.data;
  },

  createDiscussionPost: async (courseId: string, discussionId: string, postData: { content: string; parentPostId?: string; attachmentUrls?: string }) => {
    const response = await apiClient.post(`/api/lms/courses/${courseId}/discussions/${discussionId}/posts`, postData);
    return response.data.data || response.data;
  },

  getRubrics: async (params?: { page?: number; pageSize?: number; isPublic?: boolean }) => {
    const response = await apiClient.get('/api/lms/rubrics', { params });
    return response.data.data || response.data;
  },

  getRubric: async (id: string) => {
    const response = await apiClient.get(`/api/lms/rubrics/${id}`);
    return response.data.data || response.data;
  },

  createRubric: async (rubricData: Partial<Rubric>) => {
    const response = await apiClient.post('/api/lms/rubrics', rubricData);
    return response.data.data || response.data;
  },

  deleteRubric: async (id: string) => {
    const response = await apiClient.delete(`/api/lms/rubrics/${id}`);
    return response.data.data || response.data;
  },

  getCourseEnrollments: async (courseId: string, params?: { page?: number; pageSize?: number; role?: string }) => {
    const response = await apiClient.get(`/api/lms/courses/${courseId}/enrollments`, { params });
    return response.data.data || response.data;
  },

  enrollInCourse: async (courseId: string, enrollmentData: Partial<CourseEnrollment>) => {
    const response = await apiClient.post(`/api/lms/courses/${courseId}/enrollments`, enrollmentData);
    return response.data.data || response.data;
  },

  updateEnrollment: async (courseId: string, enrollmentId: string, enrollmentData: Partial<CourseEnrollment>) => {
    const response = await apiClient.put(`/api/lms/courses/${courseId}/enrollments/${enrollmentId}`, enrollmentData);
    return response.data.data || response.data;
  },

  unenrollFromCourse: async (courseId: string, enrollmentId: string) => {
    const response = await apiClient.delete(`/api/lms/courses/${courseId}/enrollments/${enrollmentId}`);
    return response.data.data || response.data;
  },

  getLearningOutcomes: async (params?: { page?: number; pageSize?: number; category?: string }) => {
    const response = await apiClient.get('/api/lms/learning-outcomes', { params });
    return response.data.data || response.data;
  },

  createLearningOutcome: async (outcomeData: Partial<LearningOutcome>) => {
    const response = await apiClient.post('/api/lms/learning-outcomes', outcomeData);
    return response.data.data || response.data;
  },

  uploadFile: async (file: File, type: 'assignment' | 'discussion' | 'course') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await apiClient.post('/api/lms/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },
};
