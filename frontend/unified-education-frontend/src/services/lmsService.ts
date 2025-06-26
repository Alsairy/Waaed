import { apiClient } from './api';

export const lmsService = {
  getCourses: async () => {
    const response = await apiClient.get('/api/lms/courses');
    return response.data.data || response.data;
  },
  
  getCourse: async (id: string) => {
    const response = await apiClient.get(`/api/lms/courses/${id}`);
    return response.data.data || response.data;
  },
  
  createCourse: async (courseData: any) => {
    const response = await apiClient.post('/api/lms/courses', courseData);
    return response.data.data || response.data;
  },
  
  updateCourse: async (id: string, courseData: any) => {
    const response = await apiClient.put(`/api/lms/courses/${id}`, courseData);
    return response.data.data || response.data;
  },
  
  deleteCourse: async (id: string) => {
    const response = await apiClient.delete(`/api/lms/courses/${id}`);
    return response.data.data || response.data;
  },
};
