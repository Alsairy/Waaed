import { apiClient } from './api';

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  section: string;
  status: string;
}

export const sisService = {
  getStudents: async () => {
    const response = await apiClient.get('/api/sis/students');
    return response.data.data || response.data;
  },
  
  getStudent: async (id: string) => {
    const response = await apiClient.get(`/api/sis/students/${id}`);
    return response.data.data || response.data;
  },
  
  createStudent: async (studentData: Partial<Student>) => {
    const response = await apiClient.post('/api/sis/students', studentData);
    return response.data.data || response.data;
  },
  
  updateStudent: async (id: string, studentData: Partial<Student>) => {
    const response = await apiClient.put(`/api/sis/students/${id}`, studentData);
    return response.data.data || response.data;
  },
  
  deleteStudent: async (id: string) => {
    const response = await apiClient.delete(`/api/sis/students/${id}`);
    return response.data.data || response.data;
  },
};
