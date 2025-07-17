import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface ChatMessage {
  id: string;
  senderId: string;
  channelId?: string;
  content: string;
  messageType: 'Text' | 'File' | 'Image';
  sentAt: string;
  isEdited: boolean;
  editedAt?: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  createdById: string;
  createdAt: string;
  channelType: 'Public' | 'Private';
  isActive: boolean;
  memberCount?: number;
  lastMessage?: ChatMessage;
}

export interface ChannelMember {
  id: string;
  userId: string;
  channelId: string;
  joinedAt: string;
  role: 'Admin' | 'Member';
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateChannelRequest {
  name: string;
  description: string;
  isPrivate?: boolean;
}

export interface SendMessageRequest {
  content: string;
  channelId?: string;
  receiverId?: string;
  attachmentUrl?: string;
}

class CollaborationService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: (import.meta.env?.VITE_API_BASE_URL as string) || 'http://staging-api.waaed.sa/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    try {
      const response: AxiosResponse<ChatMessage> = await this.api.post(
        '/api/collaboration/chat/messages',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async getMessages(channelId?: string, page: number = 1, pageSize: number = 50): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (channelId) {
        params.append('channelId', channelId);
      }

      const response: AxiosResponse<ChatMessage[]> = await this.api.get(
        `/api/collaboration/chat/messages?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  async createChannel(request: CreateChannelRequest): Promise<ChatChannel> {
    try {
      const response: AxiosResponse<ChatChannel> = await this.api.post(
        '/api/collaboration/chat/channels',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw new Error('Failed to create channel');
    }
  }

  async getChannels(): Promise<ChatChannel[]> {
    try {
      const response: AxiosResponse<ChatChannel[]> = await this.api.get(
        '/api/collaboration/chat/channels'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw new Error('Failed to fetch channels');
    }
  }

  async joinChannel(channelId: string): Promise<void> {
    try {
      await this.api.post(`/api/collaboration/chat/channels/${channelId}/join`);
    } catch (error) {
      console.error('Error joining channel:', error);
      throw new Error('Failed to join channel');
    }
  }

  async leaveChannel(channelId: string): Promise<void> {
    try {
      await this.api.post(`/api/collaboration/chat/channels/${channelId}/leave`);
    } catch (error) {
      console.error('Error leaving channel:', error);
      throw new Error('Failed to leave channel');
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await this.api.delete(`/api/collaboration/chat/messages/${messageId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  async editMessage(messageId: string, newContent: string): Promise<ChatMessage> {
    try {
      const response: AxiosResponse<ChatMessage> = await this.api.put(
        `/api/collaboration/chat/messages/${messageId}`,
        { content: newContent }
      );
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error('Failed to edit message');
    }
  }

  async searchMessages(query: string, channelId?: string): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams({ query });
      if (channelId) {
        params.append('channelId', channelId);
      }

      const response: AxiosResponse<ChatMessage[]> = await this.api.get(
        `/api/collaboration/chat/messages/search?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('Failed to search messages');
    }
  }

  async getChannelMembers(channelId: string): Promise<ChannelMember[]> {
    try {
      const response: AxiosResponse<ChannelMember[]> = await this.api.get(
        `/api/collaboration/chat/channels/${channelId}/members`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching channel members:', error);
      throw new Error('Failed to fetch channel members');
    }
  }
}

export const collaborationService = new CollaborationService();
