import { apiClient } from './api';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  status: string;
  category: string;
}

interface BlogComment {
  id: string;
  postId: string;
  content: string;
  author: string;
  status: string;
}

interface BlogCategory {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface BlogTag {
  id: string;
  name: string;
}

export const blogsService = {
  getBlogPosts: async (params?: { page?: number; pageSize?: number; status?: string; category?: string; author?: string; tag?: string }) => {
    const response = await apiClient.get('/api/blogs/posts', { params });
    return response.data.data || response.data;
  },

  getBlogPost: async (id: string) => {
    const response = await apiClient.get(`/api/blogs/posts/${id}`);
    return response.data.data || response.data;
  },

  createBlogPost: async (postData: Partial<BlogPost>) => {
    const response = await apiClient.post('/api/blogs/posts', postData);
    return response.data.data || response.data;
  },

  updateBlogPost: async (id: string, postData: Partial<BlogPost>) => {
    const response = await apiClient.put(`/api/blogs/posts/${id}`, postData);
    return response.data.data || response.data;
  },

  deleteBlogPost: async (id: string) => {
    const response = await apiClient.delete(`/api/blogs/posts/${id}`);
    return response.data.data || response.data;
  },

  publishBlogPost: async (id: string) => {
    const response = await apiClient.put(`/api/blogs/posts/${id}/publish`);
    return response.data.data || response.data;
  },

  unpublishBlogPost: async (id: string) => {
    const response = await apiClient.put(`/api/blogs/posts/${id}/unpublish`);
    return response.data.data || response.data;
  },

  likeBlogPost: async (id: string) => {
    const response = await apiClient.put(`/api/blogs/posts/${id}/like`);
    return response.data.data || response.data;
  },

  unlikeBlogPost: async (id: string) => {
    const response = await apiClient.put(`/api/blogs/posts/${id}/unlike`);
    return response.data.data || response.data;
  },

  getBlogComments: async (postId: string, params?: { page?: number; pageSize?: number; status?: string }) => {
    const response = await apiClient.get(`/api/blogs/posts/${postId}/comments`, { params });
    return response.data.data || response.data;
  },

  getBlogComment: async (postId: string, commentId: string) => {
    const response = await apiClient.get(`/api/blogs/posts/${postId}/comments/${commentId}`);
    return response.data.data || response.data;
  },

  createBlogComment: async (postId: string, commentData: Partial<BlogComment>) => {
    const response = await apiClient.post(`/api/blogs/posts/${postId}/comments`, commentData);
    return response.data.data || response.data;
  },

  updateBlogComment: async (postId: string, commentId: string, commentData: Partial<BlogComment>) => {
    const response = await apiClient.put(`/api/blogs/posts/${postId}/comments/${commentId}`, commentData);
    return response.data.data || response.data;
  },

  deleteBlogComment: async (postId: string, commentId: string) => {
    const response = await apiClient.delete(`/api/blogs/posts/${postId}/comments/${commentId}`);
    return response.data.data || response.data;
  },

  approveBlogComment: async (postId: string, commentId: string) => {
    const response = await apiClient.put(`/api/blogs/posts/${postId}/comments/${commentId}/approve`);
    return response.data.data || response.data;
  },

  rejectBlogComment: async (postId: string, commentId: string) => {
    const response = await apiClient.put(`/api/blogs/posts/${postId}/comments/${commentId}/reject`);
    return response.data.data || response.data;
  },

  getBlogCategories: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const response = await apiClient.get('/api/blogs/categories', { params });
    return response.data.data || response.data;
  },

  getBlogCategory: async (id: string) => {
    const response = await apiClient.get(`/api/blogs/categories/${id}`);
    return response.data.data || response.data;
  },

  createBlogCategory: async (categoryData: Partial<BlogCategory>) => {
    const response = await apiClient.post('/api/blogs/categories', categoryData);
    return response.data.data || response.data;
  },

  updateBlogCategory: async (id: string, categoryData: Partial<BlogCategory>) => {
    const response = await apiClient.put(`/api/blogs/categories/${id}`, categoryData);
    return response.data.data || response.data;
  },

  deleteBlogCategory: async (id: string) => {
    const response = await apiClient.delete(`/api/blogs/categories/${id}`);
    return response.data.data || response.data;
  },

  getBlogAnalytics: async (params?: { dateFrom?: string; dateTo?: string; postId?: string }) => {
    const response = await apiClient.get('/api/blogs/analytics', { params });
    return response.data.data || response.data;
  },

  getPopularPosts: async (params?: { period?: string; limit?: number }) => {
    const response = await apiClient.get('/api/blogs/analytics/popular', { params });
    return response.data.data || response.data;
  },

  searchBlogPosts: async (query: string, params?: { page?: number; pageSize?: number; category?: string }) => {
    const response = await apiClient.get('/api/blogs/posts/search', { 
      params: { query, ...params }
    });
    return response.data.data || response.data;
  },

  getBlogTags: async (params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get('/api/blogs/tags', { params });
    return response.data.data || response.data;
  },

  createBlogTag: async (tagData: Partial<BlogTag>) => {
    const response = await apiClient.post('/api/blogs/tags', tagData);
    return response.data.data || response.data;
  },

  deleteBlogTag: async (id: string) => {
    const response = await apiClient.delete(`/api/blogs/tags/${id}`);
    return response.data.data || response.data;
  },

  uploadBlogImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/blogs/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },
};
