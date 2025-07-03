import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export enum DiscussionType {
  Threaded = 'Threaded',
  SideComment = 'SideComment',
  NotThreaded = 'NotThreaded'
}

export interface Discussion {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: DiscussionType;
  isGraded: boolean;
  points: number;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  requireInitialPost: boolean;
  allowRating: boolean;
  sortByRating: boolean;
  onlyGradersCanRate: boolean;
  isAnnouncement: boolean;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  postCount: number;
  participantCount: number;
}

export interface CreateDiscussionDto {
  title: string;
  description: string;
  type: string;
  isGraded: boolean;
  points: number;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  requireInitialPost: boolean;
  allowRating: boolean;
  sortByRating: boolean;
  onlyGradersCanRate: boolean;
}

export interface DiscussionPost {
  id: string;
  discussionId: string;
  parentPostId?: string;
  authorId: string;
  authorName: string;
  content: string;
  attachmentUrls: string;
  rating: number;
  ratingCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
}

export interface CreateDiscussionPostDto {
  content: string;
  parentPostId?: string;
  attachmentUrls?: string;
}

export interface PostRating {
  id: string;
  postId: string;
  userId: string;
  rating: number;
  createdAt: string;
}

class DiscussionService {
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

  async getDiscussions(
    courseId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ data: Discussion[]; totalCount: number }> {
    try {
      const response: AxiosResponse<{ data: Discussion[]; totalCount: number }> = 
        await this.api.get(`/lms/courses/${courseId}/discussions?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch discussions');
    }
  }

  async getDiscussion(courseId: string, discussionId: string): Promise<Discussion> {
    try {
      const response: AxiosResponse<{ data: Discussion }> = 
        await this.api.get(`/lms/courses/${courseId}/discussions/${discussionId}`);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch discussion');
    }
  }

  async createDiscussion(courseId: string, discussionData: CreateDiscussionDto): Promise<Discussion> {
    try {
      const response: AxiosResponse<{ data: Discussion }> = 
        await this.api.post(`/lms/courses/${courseId}/discussions`, discussionData);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to create discussion');
    }
  }

  async updateDiscussion(
    courseId: string, 
    discussionId: string, 
    discussionData: Partial<CreateDiscussionDto>
  ): Promise<void> {
    try {
      await this.api.put(`/lms/courses/${courseId}/discussions/${discussionId}`, discussionData);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to update discussion');
    }
  }

  async deleteDiscussion(courseId: string, discussionId: string): Promise<void> {
    try {
      await this.api.delete(`/lms/courses/${courseId}/discussions/${discussionId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to delete discussion');
    }
  }

  async getDiscussionPosts(
    courseId: string,
    discussionId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: DiscussionPost[]; totalCount: number }> {
    try {
      const response: AxiosResponse<{ data: DiscussionPost[]; totalCount: number }> = 
        await this.api.get(`/lms/courses/${courseId}/discussions/${discussionId}/posts?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch discussion posts');
    }
  }

  async createDiscussionPost(
    courseId: string,
    discussionId: string,
    postData: CreateDiscussionPostDto
  ): Promise<DiscussionPost> {
    try {
      const response: AxiosResponse<{ data: DiscussionPost }> = 
        await this.api.post(`/lms/courses/${courseId}/discussions/${discussionId}/posts`, postData);
      return response.data.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to create discussion post');
    }
  }

  async updateDiscussionPost(
    courseId: string,
    discussionId: string,
    postId: string,
    postData: Partial<CreateDiscussionPostDto>
  ): Promise<void> {
    try {
      await this.api.put(`/lms/courses/${courseId}/discussions/${discussionId}/posts/${postId}`, postData);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to update discussion post');
    }
  }

  async deleteDiscussionPost(
    courseId: string,
    discussionId: string,
    postId: string
  ): Promise<void> {
    try {
      await this.api.delete(`/lms/courses/${courseId}/discussions/${discussionId}/posts/${postId}`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to delete discussion post');
    }
  }

  async ratePost(
    courseId: string,
    discussionId: string,
    postId: string,
    rating: number
  ): Promise<void> {
    try {
      await this.api.post(`/lms/courses/${courseId}/discussions/${discussionId}/posts/${postId}/rate`, { rating });
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to rate post');
    }
  }

  async getPostReplies(
    courseId: string,
    discussionId: string,
    postId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ data: DiscussionPost[]; totalCount: number }> {
    try {
      const response: AxiosResponse<{ data: DiscussionPost[]; totalCount: number }> = 
        await this.api.get(`/lms/courses/${courseId}/discussions/${discussionId}/posts/${postId}/replies?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string } } };
      throw new Error(errorObj.response?.data?.message || 'Failed to fetch post replies');
    }
  }
}

export const discussionService = new DiscussionService();
export default discussionService;
