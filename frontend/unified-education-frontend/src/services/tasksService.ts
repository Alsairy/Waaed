import { apiClient } from './api';

export const tasksService = {
  getTasks: async (params?: { page?: number; pageSize?: number; status?: string; priority?: string; assignedTo?: string; category?: string }) => {
    const response = await apiClient.get('/api/tasks', { params });
    return response.data.data || response.data;
  },

  getTask: async (id: string) => {
    const response = await apiClient.get(`/api/tasks/${id}`);
    return response.data.data || response.data;
  },

  createTask: async (taskData: any) => {
    const response = await apiClient.post('/api/tasks', taskData);
    return response.data.data || response.data;
  },

  updateTask: async (id: string, taskData: any) => {
    const response = await apiClient.put(`/api/tasks/${id}`, taskData);
    return response.data.data || response.data;
  },

  deleteTask: async (id: string) => {
    const response = await apiClient.delete(`/api/tasks/${id}`);
    return response.data.data || response.data;
  },

  assignTask: async (id: string, assignmentData: any) => {
    const response = await apiClient.put(`/api/tasks/${id}/assign`, assignmentData);
    return response.data.data || response.data;
  },

  completeTask: async (id: string, completionData: any) => {
    const response = await apiClient.put(`/api/tasks/${id}/complete`, completionData);
    return response.data.data || response.data;
  },

  reopenTask: async (id: string) => {
    const response = await apiClient.put(`/api/tasks/${id}/reopen`);
    return response.data.data || response.data;
  },

  getTaskComments: async (taskId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/tasks/${taskId}/comments`, { params });
    return response.data.data || response.data;
  },

  getTaskComment: async (taskId: string, commentId: string) => {
    const response = await apiClient.get(`/api/tasks/${taskId}/comments/${commentId}`);
    return response.data.data || response.data;
  },

  createTaskComment: async (taskId: string, commentData: any) => {
    const response = await apiClient.post(`/api/tasks/${taskId}/comments`, commentData);
    return response.data.data || response.data;
  },

  updateTaskComment: async (taskId: string, commentId: string, commentData: any) => {
    const response = await apiClient.put(`/api/tasks/${taskId}/comments/${commentId}`, commentData);
    return response.data.data || response.data;
  },

  deleteTaskComment: async (taskId: string, commentId: string) => {
    const response = await apiClient.delete(`/api/tasks/${taskId}/comments/${commentId}`);
    return response.data.data || response.data;
  },

  getTaskAttachments: async (taskId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/tasks/${taskId}/attachments`, { params });
    return response.data.data || response.data;
  },

  getTaskAttachment: async (taskId: string, attachmentId: string) => {
    const response = await apiClient.get(`/api/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data.data || response.data;
  },

  uploadTaskAttachment: async (taskId: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await apiClient.post(`/api/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  deleteTaskAttachment: async (taskId: string, attachmentId: string) => {
    const response = await apiClient.delete(`/api/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data.data || response.data;
  },

  downloadTaskAttachment: async (taskId: string, attachmentId: string) => {
    const response = await apiClient.get(`/api/tasks/${taskId}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getSubTasks: async (parentTaskId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/tasks/${parentTaskId}/subtasks`, { params });
    return response.data.data || response.data;
  },

  createSubTask: async (parentTaskId: string, taskData: any) => {
    const response = await apiClient.post(`/api/tasks/${parentTaskId}/subtasks`, taskData);
    return response.data.data || response.data;
  },

  getTaskDependencies: async (taskId: string) => {
    const response = await apiClient.get(`/api/tasks/${taskId}/dependencies`);
    return response.data.data || response.data;
  },

  addTaskDependency: async (taskId: string, dependencyData: any) => {
    const response = await apiClient.post(`/api/tasks/${taskId}/dependencies`, dependencyData);
    return response.data.data || response.data;
  },

  removeTaskDependency: async (taskId: string, dependencyId: string) => {
    const response = await apiClient.delete(`/api/tasks/${taskId}/dependencies/${dependencyId}`);
    return response.data.data || response.data;
  },

  getTaskAnalytics: async (params?: { dateFrom?: string; dateTo?: string; assignedTo?: string; department?: string }) => {
    const response = await apiClient.get('/api/tasks/analytics', { params });
    return response.data.data || response.data;
  },

  getTaskProgress: async (params?: { projectId?: string; assignedTo?: string }) => {
    const response = await apiClient.get('/api/tasks/progress', { params });
    return response.data.data || response.data;
  },

  searchTasks: async (query: string, params?: { page?: number; pageSize?: number; status?: string; priority?: string }) => {
    const response = await apiClient.get('/api/tasks/search', { 
      params: { query, ...params }
    });
    return response.data.data || response.data;
  },

  getTaskTemplates: async (params?: { page?: number; pageSize?: number; category?: string }) => {
    const response = await apiClient.get('/api/tasks/templates', { params });
    return response.data.data || response.data;
  },

  createTaskFromTemplate: async (templateId: string, taskData: any) => {
    const response = await apiClient.post(`/api/tasks/templates/${templateId}/create`, taskData);
    return response.data.data || response.data;
  },

  getRecurringTasks: async (params?: { page?: number; pageSize?: number; pattern?: string }) => {
    const response = await apiClient.get('/api/tasks/recurring', { params });
    return response.data.data || response.data;
  },

  createRecurringTask: async (taskData: any) => {
    const response = await apiClient.post('/api/tasks/recurring', taskData);
    return response.data.data || response.data;
  },

  updateRecurringTask: async (id: string, taskData: any) => {
    const response = await apiClient.put(`/api/tasks/recurring/${id}`, taskData);
    return response.data.data || response.data;
  },

  deleteRecurringTask: async (id: string) => {
    const response = await apiClient.delete(`/api/tasks/recurring/${id}`);
    return response.data.data || response.data;
  },
};
