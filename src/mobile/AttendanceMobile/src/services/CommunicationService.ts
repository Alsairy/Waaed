import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/collaboration';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  audience: 'All' | 'Students' | 'Teachers' | 'Parents' | 'Staff';
  publishedAt: string;
  expiresAt?: string;
  authorId: string;
  authorName: string;
  isRead: boolean;
  readCount: number;
  attachments: string[];
}

export interface VideoConference {
  id: string;
  title: string;
  hostId: string;
  scheduledStartTime: string;
  actualStartTime?: string;
  endTime?: string;
  maxParticipants: number;
  status: 'Scheduled' | 'InProgress' | 'Ended';
  meetingUrl: string;
  meetingId: string;
  passcode: string;
  isRecorded: boolean;
  participants: ConferenceParticipant[];
}

export interface ConferenceParticipant {
  id: string;
  conferenceId: string;
  userId: string;
  joinedAt: string;
  leftAt?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  role: 'Moderator' | 'Participant';
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  messageType: 'Text' | 'Image' | 'File' | 'Voice';
  attachmentUrl?: string;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'Direct' | 'Group' | 'Course' | 'Department';
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  audience: 'All' | 'Students' | 'Teachers' | 'Parents' | 'Staff';
  expiresAt?: string;
  attachments?: string[];
}

export interface CreateConferenceRequest {
  title: string;
  scheduledTime: string;
  maxParticipants?: number;
}

class CommunicationServiceClass {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getAnnouncements(params?: { 
    priority?: string; 
    audience?: string; 
    page?: number; 
    pageSize?: number 
  }): Promise<Announcement[]> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      if (params?.priority) queryParams.append('priority', params.priority);
      if (params?.audience) queryParams.append('audience', params.audience);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `${API_BASE_URL}/announcements${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  async createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async markAnnouncementAsRead(announcementId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}/read`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to mark announcement as read');
      }
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  }

  async deleteAnnouncement(announcementId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/announcements/${announcementId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  async getVideoConferences(): Promise<VideoConference[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/video-conferences`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch video conferences');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching video conferences:', error);
      throw error;
    }
  }

  async createVideoConference(request: CreateConferenceRequest): Promise<VideoConference> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/video-conferences`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create video conference');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating video conference:', error);
      throw error;
    }
  }

  async joinVideoConference(conferenceId: string): Promise<{ conference: VideoConference; token: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/video-conferences/${conferenceId}/join`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to join video conference');
      }

      return await response.json();
    } catch (error) {
      console.error('Error joining video conference:', error);
      throw error;
    }
  }

  async leaveVideoConference(conferenceId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/video-conferences/${conferenceId}/leave`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to leave video conference');
      }
    } catch (error) {
      console.error('Error leaving video conference:', error);
      throw error;
    }
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat-rooms`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  async getChatMessages(roomId: string, page: number = 1, pageSize: number = 50): Promise<ChatMessage[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat-rooms/${roomId}/messages?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  async sendChatMessage(roomId: string, content: string, messageType: 'Text' | 'Image' | 'File' | 'Voice' = 'Text'): Promise<ChatMessage> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat-rooms/${roomId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content, messageType }),
      });

      if (!response.ok) {
        throw new Error('Failed to send chat message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async markMessagesAsRead(roomId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat-rooms/${roomId}/mark-read`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async createChatRoom(name: string, type: 'Direct' | 'Group' | 'Course' | 'Department', participants: string[]): Promise<ChatRoom> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat-rooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, type, participants }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  async getUnreadAnnouncementsCount(): Promise<number> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/announcements/unread-count`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread announcements count');
      }

      const result = await response.json();
      return result.count;
    } catch (error) {
      console.error('Error fetching unread announcements count:', error);
      throw error;
    }
  }

  async getTotalUnreadMessagesCount(): Promise<number> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/chat-rooms/unread-count`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread messages count');
      }

      const result = await response.json();
      return result.count;
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      throw error;
    }
  }
}

export const CommunicationService = new CommunicationServiceClass();
