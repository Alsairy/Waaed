import { apiClient } from './api';

interface ChatSession {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export const aiService = {
  getChatSessions: async () => {
    const response = await apiClient.get('/api/ai/chat-sessions');
    return response.data.data || response.data;
  },
  
  getChatSession: async (id: string) => {
    const response = await apiClient.get(`/api/ai/chat-sessions/${id}`);
    return response.data.data || response.data;
  },
  
  createChatSession: async (sessionData: Partial<ChatSession>) => {
    const response = await apiClient.post('/api/ai/chat-sessions', sessionData);
    return response.data.data || response.data;
  },
  
  sendMessage: async (sessionId: string, message: string) => {
    const response = await apiClient.post(`/api/ai/chat-sessions/${sessionId}/messages`, { message });
    return response.data.data || response.data;
  },
  
  generateContent: async (contentData: Record<string, unknown>) => {
    const response = await apiClient.post('/api/ai/content-generation', contentData);
    return response.data.data || response.data;
  },
};
