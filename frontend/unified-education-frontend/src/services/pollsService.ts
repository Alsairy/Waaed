import { apiClient } from './api';

export const pollsService = {
  getPolls: async (params?: { page?: number; pageSize?: number; status?: string; category?: string; createdBy?: string }) => {
    const response = await apiClient.get('/api/polls', { params });
    return response.data.data || response.data;
  },

  getPoll: async (id: string) => {
    const response = await apiClient.get(`/api/polls/${id}`);
    return response.data.data || response.data;
  },

  createPoll: async (pollData: any) => {
    const response = await apiClient.post('/api/polls', pollData);
    return response.data.data || response.data;
  },

  updatePoll: async (id: string, pollData: any) => {
    const response = await apiClient.put(`/api/polls/${id}`, pollData);
    return response.data.data || response.data;
  },

  deletePoll: async (id: string) => {
    const response = await apiClient.delete(`/api/polls/${id}`);
    return response.data.data || response.data;
  },

  publishPoll: async (id: string) => {
    const response = await apiClient.put(`/api/polls/${id}/publish`);
    return response.data.data || response.data;
  },

  closePoll: async (id: string) => {
    const response = await apiClient.put(`/api/polls/${id}/close`);
    return response.data.data || response.data;
  },

  getPollOptions: async (pollId: string) => {
    const response = await apiClient.get(`/api/polls/${pollId}/options`);
    return response.data.data || response.data;
  },

  addPollOption: async (pollId: string, optionData: any) => {
    const response = await apiClient.post(`/api/polls/${pollId}/options`, optionData);
    return response.data.data || response.data;
  },

  updatePollOption: async (pollId: string, optionId: string, optionData: any) => {
    const response = await apiClient.put(`/api/polls/${pollId}/options/${optionId}`, optionData);
    return response.data.data || response.data;
  },

  deletePollOption: async (pollId: string, optionId: string) => {
    const response = await apiClient.delete(`/api/polls/${pollId}/options/${optionId}`);
    return response.data.data || response.data;
  },

  vote: async (pollId: string, voteData: any) => {
    const response = await apiClient.post(`/api/polls/${pollId}/vote`, voteData);
    return response.data.data || response.data;
  },

  getVotes: async (pollId: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get(`/api/polls/${pollId}/votes`, { params });
    return response.data.data || response.data;
  },

  getUserVote: async (pollId: string, userId: string) => {
    const response = await apiClient.get(`/api/polls/${pollId}/votes/user/${userId}`);
    return response.data.data || response.data;
  },

  updateVote: async (pollId: string, voteId: string, voteData: any) => {
    const response = await apiClient.put(`/api/polls/${pollId}/votes/${voteId}`, voteData);
    return response.data.data || response.data;
  },

  deleteVote: async (pollId: string, voteId: string) => {
    const response = await apiClient.delete(`/api/polls/${pollId}/votes/${voteId}`);
    return response.data.data || response.data;
  },

  getPollResults: async (pollId: string) => {
    const response = await apiClient.get(`/api/polls/${pollId}/results`);
    return response.data.data || response.data;
  },

  exportPollResults: async (pollId: string, format: string) => {
    const response = await apiClient.get(`/api/polls/${pollId}/results/export`, { 
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  getPublicPolls: async (params?: { page?: number; pageSize?: number; category?: string }) => {
    const response = await apiClient.get('/api/polls/public', { params });
    return response.data.data || response.data;
  },

  getPublicPoll: async (id: string) => {
    const response = await apiClient.get(`/api/polls/public/${id}`);
    return response.data.data || response.data;
  },

  votePublic: async (pollId: string, voteData: any) => {
    const response = await apiClient.post(`/api/polls/public/${pollId}/vote`, voteData);
    return response.data.data || response.data;
  },

  getPollAnalytics: async (pollId: string) => {
    const response = await apiClient.get(`/api/polls/${pollId}/analytics`);
    return response.data.data || response.data;
  },

  getPollsAnalytics: async (params?: { dateFrom?: string; dateTo?: string; category?: string }) => {
    const response = await apiClient.get('/api/polls/analytics', { params });
    return response.data.data || response.data;
  },

  getPollTemplates: async (params?: { page?: number; pageSize?: number; category?: string }) => {
    const response = await apiClient.get('/api/polls/templates', { params });
    return response.data.data || response.data;
  },

  createPollFromTemplate: async (templateId: string, pollData: any) => {
    const response = await apiClient.post(`/api/polls/templates/${templateId}/create`, pollData);
    return response.data.data || response.data;
  },
};
