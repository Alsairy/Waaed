import { apiClient } from './api';

export const libraryService = {
  getBooks: async (params?: { page?: number; pageSize?: number; category?: string; author?: string; isbn?: string; status?: string }) => {
    const response = await apiClient.get('/api/library/books', { params });
    return response.data.data || response.data;
  },

  getBook: async (id: string) => {
    const response = await apiClient.get(`/api/library/books/${id}`);
    return response.data.data || response.data;
  },

  createBook: async (bookData: any) => {
    const response = await apiClient.post('/api/library/books', bookData);
    return response.data.data || response.data;
  },

  updateBook: async (id: string, bookData: any) => {
    const response = await apiClient.put(`/api/library/books/${id}`, bookData);
    return response.data.data || response.data;
  },

  deleteBook: async (id: string) => {
    const response = await apiClient.delete(`/api/library/books/${id}`);
    return response.data.data || response.data;
  },

  searchBooks: async (query: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get('/api/library/books/search', { 
      params: { query, ...params }
    });
    return response.data.data || response.data;
  },

  getMembers: async (params?: { page?: number; pageSize?: number; memberType?: string; status?: string }) => {
    const response = await apiClient.get('/api/library/members', { params });
    return response.data.data || response.data;
  },

  getMember: async (id: string) => {
    const response = await apiClient.get(`/api/library/members/${id}`);
    return response.data.data || response.data;
  },

  createMember: async (memberData: any) => {
    const response = await apiClient.post('/api/library/members', memberData);
    return response.data.data || response.data;
  },

  updateMember: async (id: string, memberData: any) => {
    const response = await apiClient.put(`/api/library/members/${id}`, memberData);
    return response.data.data || response.data;
  },

  deleteMember: async (id: string) => {
    const response = await apiClient.delete(`/api/library/members/${id}`);
    return response.data.data || response.data;
  },

  getBookIssues: async (params?: { page?: number; pageSize?: number; memberId?: string; bookId?: string; status?: string }) => {
    const response = await apiClient.get('/api/library/book-issues', { params });
    return response.data.data || response.data;
  },

  getBookIssue: async (id: string) => {
    const response = await apiClient.get(`/api/library/book-issues/${id}`);
    return response.data.data || response.data;
  },

  issueBook: async (issueData: any) => {
    const response = await apiClient.post('/api/library/book-issues', issueData);
    return response.data.data || response.data;
  },

  returnBook: async (id: string, returnData: any) => {
    const response = await apiClient.put(`/api/library/book-issues/${id}/return`, returnData);
    return response.data.data || response.data;
  },

  renewBook: async (id: string, renewData: any) => {
    const response = await apiClient.put(`/api/library/book-issues/${id}/renew`, renewData);
    return response.data.data || response.data;
  },

  getBookReservations: async (params?: { page?: number; pageSize?: number; memberId?: string; bookId?: string; status?: string }) => {
    const response = await apiClient.get('/api/library/book-reservations', { params });
    return response.data.data || response.data;
  },

  getBookReservation: async (id: string) => {
    const response = await apiClient.get(`/api/library/book-reservations/${id}`);
    return response.data.data || response.data;
  },

  createBookReservation: async (reservationData: any) => {
    const response = await apiClient.post('/api/library/book-reservations', reservationData);
    return response.data.data || response.data;
  },

  cancelBookReservation: async (id: string) => {
    const response = await apiClient.delete(`/api/library/book-reservations/${id}`);
    return response.data.data || response.data;
  },

  fulfillReservation: async (id: string) => {
    const response = await apiClient.put(`/api/library/book-reservations/${id}/fulfill`);
    return response.data.data || response.data;
  },

  getFines: async (params?: { page?: number; pageSize?: number; memberId?: string; status?: string }) => {
    const response = await apiClient.get('/api/library/fines', { params });
    return response.data.data || response.data;
  },

  getFine: async (id: string) => {
    const response = await apiClient.get(`/api/library/fines/${id}`);
    return response.data.data || response.data;
  },

  payFine: async (id: string, paymentData: any) => {
    const response = await apiClient.put(`/api/library/fines/${id}/pay`, paymentData);
    return response.data.data || response.data;
  },

  waiveFine: async (id: string, waiveData: any) => {
    const response = await apiClient.put(`/api/library/fines/${id}/waive`, waiveData);
    return response.data.data || response.data;
  },

  getCirculationStats: async (params?: { dateFrom?: string; dateTo?: string }) => {
    const response = await apiClient.get('/api/library/circulation/stats', { params });
    return response.data.data || response.data;
  },

  getOverdueBooks: async (params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get('/api/library/circulation/overdue', { params });
    return response.data.data || response.data;
  },

  generateLibraryReport: async (reportData: any) => {
    const response = await apiClient.post('/api/library/reports/generate', reportData);
    return response.data.data || response.data;
  },

  getPopularBooks: async (params?: { period?: string; limit?: number }) => {
    const response = await apiClient.get('/api/library/reports/popular-books', { params });
    return response.data.data || response.data;
  },

  getMemberActivity: async (params?: { memberId?: string; dateFrom?: string; dateTo?: string }) => {
    const response = await apiClient.get('/api/library/reports/member-activity', { params });
    return response.data.data || response.data;
  },
};
