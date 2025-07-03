import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export enum MessageType {
  Text = 'Text',
  File = 'File',
  Image = 'Image',
  Voice = 'Voice'
}

export enum ChatType {
  DirectMessage = 'DirectMessage',
  GroupChat = 'GroupChat',
  CourseChat = 'CourseChat',
  AnnouncementChannel = 'AnnouncementChannel'
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: ChatType;
  courseId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participantCount: number;
  lastMessageAt?: string;
  lastMessage?: string;
  isActive: boolean;
  isPrivate: boolean;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: MessageType;
  attachmentUrl?: string;
  replyToMessageId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  reactions: MessageReaction[];
  mentions: string[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

export interface CreateChatRoomDto {
  name: string;
  description?: string;
  type: string;
  courseId?: string;
  participantIds: string[];
  isPrivate: boolean;
}

export interface SendMessageDto {
  content: string;
  messageType: string;
  attachmentUrl?: string;
  replyToMessageId?: string;
  mentions?: string[];
}

export interface ChatParticipant {
  id: string;
  chatRoomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role: string;
  joinedAt: string;
  lastSeenAt?: string;
  isOnline: boolean;
  canSendMessages: boolean;
  canManageRoom: boolean;
}

class ChatService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getChatRooms(
    page: number = 1,
    pageSize: number = 20,
    type?: ChatType
  ): Promise<{ data: ChatRoom[]; totalCount: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (type) {
        params.append('type', type);
      }

      const response: AxiosResponse<{ data: ChatRoom[]; totalCount: number }> = 
        await this.api.get(`/collaboration/chat/rooms?${params}`);
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch chat rooms');
    }
  }

  async getChatRoom(roomId: string): Promise<ChatRoom> {
    try {
      const response: AxiosResponse<{ data: ChatRoom }> = 
        await this.api.get(`/collaboration/chat/rooms/${roomId}`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch chat room');
    }
  }

  async createChatRoom(roomData: CreateChatRoomDto): Promise<ChatRoom> {
    try {
      const response: AxiosResponse<{ data: ChatRoom }> = 
        await this.api.post('/collaboration/chat/rooms', roomData);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to create chat room');
    }
  }

  async updateChatRoom(roomId: string, roomData: Partial<CreateChatRoomDto>): Promise<void> {
    try {
      await this.api.put(`/collaboration/chat/rooms/${roomId}`, roomData);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to update chat room');
    }
  }

  async deleteChatRoom(roomId: string): Promise<void> {
    try {
      await this.api.delete(`/collaboration/chat/rooms/${roomId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to delete chat room');
    }
  }

  async getMessages(
    roomId: string,
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ data: ChatMessage[]; totalCount: number }> {
    try {
      const response: AxiosResponse<{ data: ChatMessage[]; totalCount: number }> = 
        await this.api.get(`/collaboration/chat/rooms/${roomId}/messages?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch messages');
    }
  }

  async sendMessage(roomId: string, messageData: SendMessageDto): Promise<ChatMessage> {
    try {
      const response: AxiosResponse<{ data: ChatMessage }> = 
        await this.api.post(`/collaboration/chat/rooms/${roomId}/messages`, messageData);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to send message');
    }
  }

  async editMessage(roomId: string, messageId: string, content: string): Promise<void> {
    try {
      await this.api.put(`/collaboration/chat/rooms/${roomId}/messages/${messageId}`, { content });
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to edit message');
    }
  }

  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      await this.api.delete(`/collaboration/chat/rooms/${roomId}/messages/${messageId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to delete message');
    }
  }

  async addReaction(roomId: string, messageId: string, emoji: string): Promise<void> {
    try {
      await this.api.post(`/collaboration/chat/rooms/${roomId}/messages/${messageId}/reactions`, { emoji });
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to add reaction');
    }
  }

  async removeReaction(roomId: string, messageId: string, reactionId: string): Promise<void> {
    try {
      await this.api.delete(`/collaboration/chat/rooms/${roomId}/messages/${messageId}/reactions/${reactionId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to remove reaction');
    }
  }

  async getChatParticipants(roomId: string): Promise<ChatParticipant[]> {
    try {
      const response: AxiosResponse<{ data: ChatParticipant[] }> = 
        await this.api.get(`/collaboration/chat/rooms/${roomId}/participants`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch participants');
    }
  }

  async addParticipant(roomId: string, userId: string): Promise<void> {
    try {
      await this.api.post(`/collaboration/chat/rooms/${roomId}/participants`, { userId });
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to add participant');
    }
  }

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    try {
      await this.api.delete(`/collaboration/chat/rooms/${roomId}/participants/${userId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to remove participant');
    }
  }

  async markAsRead(roomId: string): Promise<void> {
    try {
      await this.api.post(`/collaboration/chat/rooms/${roomId}/mark-read`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to mark as read');
    }
  }

  async searchMessages(
    roomId: string,
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: ChatMessage[]; totalCount: number }> {
    try {
      const response: AxiosResponse<{ data: ChatMessage[]; totalCount: number }> = 
        await this.api.get(`/collaboration/chat/rooms/${roomId}/messages/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to search messages');
    }
  }
}

export const chatService = new ChatService();
export default chatService;
