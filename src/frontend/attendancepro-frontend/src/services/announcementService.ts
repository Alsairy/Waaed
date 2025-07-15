import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetAudience: 'All' | 'Students' | 'Teachers' | 'Parents' | 'Staff';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  readCount: number;
  totalTargetCount: number;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  targetAudience: 'All' | 'Students' | 'Teachers' | 'Parents' | 'Staff';
  priority?: 'Low' | 'Normal' | 'High' | 'Urgent';
  expiresAt?: string;
  attachments?: string[];
  schedulePublishAt?: string;
}

export interface AnnouncementStats {
  totalAnnouncements: number;
  publishedAnnouncements: number;
  draftAnnouncements: number;
  expiredAnnouncements: number;
  averageReadRate: number;
}

class AnnouncementService {
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

  async createAnnouncement(request: CreateAnnouncementRequest): Promise<Announcement> {
    try {
      const response: AxiosResponse<Announcement> = await this.api.post(
        '/api/notifications/announcements',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw new Error('Failed to create announcement');
    }
  }

  async getAnnouncements(
    page: number = 1,
    pageSize: number = 20,
    targetAudience?: string,
    priority?: string
  ): Promise<{ announcements: Announcement[]; totalCount: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (targetAudience) params.append('targetAudience', targetAudience);
      if (priority) params.append('priority', priority);

      const response: AxiosResponse<{ data: Announcement[]; totalCount: number }> = await this.api.get(
        `/api/notifications/announcements?${params.toString()}`
      );
      
      return {
        announcements: response.data.data,
        totalCount: response.data.totalCount,
      };
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw new Error('Failed to fetch announcements');
    }
  }

  async getAnnouncement(id: string): Promise<Announcement> {
    try {
      const response: AxiosResponse<Announcement> = await this.api.get(
        `/api/notifications/announcements/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement:', error);
      throw new Error('Failed to fetch announcement');
    }
  }

  async updateAnnouncement(id: string, request: Partial<CreateAnnouncementRequest>): Promise<Announcement> {
    try {
      const response: AxiosResponse<Announcement> = await this.api.put(
        `/api/notifications/announcements/${id}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw new Error('Failed to update announcement');
    }
  }

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await this.api.delete(`/api/notifications/announcements/${id}`);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw new Error('Failed to delete announcement');
    }
  }

  async publishAnnouncement(id: string): Promise<Announcement> {
    try {
      const response: AxiosResponse<Announcement> = await this.api.post(
        `/api/notifications/announcements/${id}/publish`
      );
      return response.data;
    } catch (error) {
      console.error('Error publishing announcement:', error);
      throw new Error('Failed to publish announcement');
    }
  }

  async unpublishAnnouncement(id: string): Promise<Announcement> {
    try {
      const response: AxiosResponse<Announcement> = await this.api.post(
        `/api/notifications/announcements/${id}/unpublish`
      );
      return response.data;
    } catch (error) {
      console.error('Error unpublishing announcement:', error);
      throw new Error('Failed to unpublish announcement');
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await this.api.post(`/api/notifications/announcements/${id}/read`);
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw new Error('Failed to mark announcement as read');
    }
  }

  async getAnnouncementStats(): Promise<AnnouncementStats> {
    try {
      const response: AxiosResponse<AnnouncementStats> = await this.api.get(
        '/api/notifications/announcements/stats'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement stats:', error);
      throw new Error('Failed to fetch announcement statistics');
    }
  }

  async broadcastAnnouncement(request: CreateAnnouncementRequest): Promise<{ success: boolean; sentCount: number }> {
    try {
      const response: AxiosResponse<{ success: boolean; sentCount: number }> = await this.api.post(
        '/api/notifications/announcements/broadcast',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error broadcasting announcement:', error);
      throw new Error('Failed to broadcast announcement');
    }
  }

  async getMyAnnouncements(page: number = 1, pageSize: number = 20): Promise<{ announcements: Announcement[]; totalCount: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response: AxiosResponse<{ data: Announcement[]; totalCount: number }> = await this.api.get(
        `/api/notifications/announcements/my?${params.toString()}`
      );
      
      return {
        announcements: response.data.data,
        totalCount: response.data.totalCount,
      };
    } catch (error) {
      console.error('Error fetching my announcements:', error);
      throw new Error('Failed to fetch my announcements');
    }
  }
}

export const announcementService = new AnnouncementService();
