import { apiClient } from './api';

export const bpmService = {
  getWorkflows: async () => {
    const response = await apiClient.get('/api/bpm/workflows');
    return response.data.data || response.data;
  },
  
  getWorkflow: async (id: string) => {
    const response = await apiClient.get(`/api/bpm/workflows/${id}`);
    return response.data.data || response.data;
  },
  
  createWorkflow: async (workflowData: any) => {
    const response = await apiClient.post('/api/bpm/workflows', workflowData);
    return response.data.data || response.data;
  },
  
  updateWorkflow: async (id: string, workflowData: any) => {
    const response = await apiClient.put(`/api/bpm/workflows/${id}`, workflowData);
    return response.data.data || response.data;
  },
  
  deleteWorkflow: async (id: string) => {
    const response = await apiClient.delete(`/api/bpm/workflows/${id}`);
    return response.data.data || response.data;
  },
};
