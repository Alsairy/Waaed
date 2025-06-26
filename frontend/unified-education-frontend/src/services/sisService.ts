import { apiClient } from './api';

export const sisService = {
  getStudents: async () => {
    const response = await apiClient.get('/api/sis/students');
    return response.data.data || response.data;
  },
  
  getStudent: async (id: string) => {
    const response = await apiClient.get(`/api/sis/students/${id}`);
    return response.data.data || response.data;
  },
  
  createStudent: async (studentData: any) => {
    const response = await apiClient.post('/api/sis/students', studentData);
    return response.data.data || response.data;
  },
  
  updateStudent: async (id: string, studentData: any) => {
    const response = await apiClient.put(`/api/sis/students/${id}`, studentData);
    return response.data.data || response.data;
  },
  
  deleteStudent: async (id: string) => {
    const response = await apiClient.delete(`/api/sis/students/${id}`);
    return response.data.data || response.data;
  },
};
