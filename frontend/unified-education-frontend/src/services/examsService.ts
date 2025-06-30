import { apiClient } from './api';

interface Exam {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  status: string;
}

export const examsService = {
  getExams: async () => {
    const response = await apiClient.get('/api/exams/exams');
    return response.data.data || response.data;
  },
  
  getExam: async (id: string) => {
    const response = await apiClient.get(`/api/exams/exams/${id}`);
    return response.data.data || response.data;
  },
  
  createExam: async (examData: Partial<Exam>) => {
    const response = await apiClient.post('/api/exams/exams', examData);
    return response.data.data || response.data;
  },
  
  updateExam: async (id: string, examData: Partial<Exam>) => {
    const response = await apiClient.put(`/api/exams/exams/${id}`, examData);
    return response.data.data || response.data;
  },
  
  deleteExam: async (id: string) => {
    const response = await apiClient.delete(`/api/exams/exams/${id}`);
    return response.data.data || response.data;
  },
};
