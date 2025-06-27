import { apiClient } from './api';

export const hrService = {
  getEmployees: async (params?: { page?: number; pageSize?: number; department?: string; position?: string; status?: string }) => {
    const response = await apiClient.get('/api/hr/employees', { params });
    return response.data.data || response.data;
  },

  getEmployee: async (id: string) => {
    const response = await apiClient.get(`/api/hr/employees/${id}`);
    return response.data.data || response.data;
  },

  createEmployee: async (employeeData: any) => {
    const response = await apiClient.post('/api/hr/employees', employeeData);
    return response.data.data || response.data;
  },

  updateEmployee: async (id: string, employeeData: any) => {
    const response = await apiClient.put(`/api/hr/employees/${id}`, employeeData);
    return response.data.data || response.data;
  },

  deleteEmployee: async (id: string) => {
    const response = await apiClient.delete(`/api/hr/employees/${id}`);
    return response.data.data || response.data;
  },

  getDepartments: async (params?: { page?: number; pageSize?: number; status?: string }) => {
    const response = await apiClient.get('/api/hr/departments', { params });
    return response.data.data || response.data;
  },

  getDepartment: async (id: string) => {
    const response = await apiClient.get(`/api/hr/departments/${id}`);
    return response.data.data || response.data;
  },

  createDepartment: async (departmentData: any) => {
    const response = await apiClient.post('/api/hr/departments', departmentData);
    return response.data.data || response.data;
  },

  updateDepartment: async (id: string, departmentData: any) => {
    const response = await apiClient.put(`/api/hr/departments/${id}`, departmentData);
    return response.data.data || response.data;
  },

  deleteDepartment: async (id: string) => {
    const response = await apiClient.delete(`/api/hr/departments/${id}`);
    return response.data.data || response.data;
  },

  getPositions: async (params?: { page?: number; pageSize?: number; department?: string; level?: string }) => {
    const response = await apiClient.get('/api/hr/positions', { params });
    return response.data.data || response.data;
  },

  getPosition: async (id: string) => {
    const response = await apiClient.get(`/api/hr/positions/${id}`);
    return response.data.data || response.data;
  },

  createPosition: async (positionData: any) => {
    const response = await apiClient.post('/api/hr/positions', positionData);
    return response.data.data || response.data;
  },

  updatePosition: async (id: string, positionData: any) => {
    const response = await apiClient.put(`/api/hr/positions/${id}`, positionData);
    return response.data.data || response.data;
  },

  deletePosition: async (id: string) => {
    const response = await apiClient.delete(`/api/hr/positions/${id}`);
    return response.data.data || response.data;
  },

  getLeaveRequests: async (params?: { page?: number; pageSize?: number; employeeId?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/hr/leave-requests', { params });
    return response.data.data || response.data;
  },

  getLeaveRequest: async (id: string) => {
    const response = await apiClient.get(`/api/hr/leave-requests/${id}`);
    return response.data.data || response.data;
  },

  createLeaveRequest: async (leaveRequestData: any) => {
    const response = await apiClient.post('/api/hr/leave-requests', leaveRequestData);
    return response.data.data || response.data;
  },

  updateLeaveRequest: async (id: string, leaveRequestData: any) => {
    const response = await apiClient.put(`/api/hr/leave-requests/${id}`, leaveRequestData);
    return response.data.data || response.data;
  },

  approveLeaveRequest: async (id: string, approvalData: any) => {
    const response = await apiClient.put(`/api/hr/leave-requests/${id}/approve`, approvalData);
    return response.data.data || response.data;
  },

  rejectLeaveRequest: async (id: string, rejectionData: any) => {
    const response = await apiClient.put(`/api/hr/leave-requests/${id}/reject`, rejectionData);
    return response.data.data || response.data;
  },

  deleteLeaveRequest: async (id: string) => {
    const response = await apiClient.delete(`/api/hr/leave-requests/${id}`);
    return response.data.data || response.data;
  },

  getPerformanceReviews: async (params?: { page?: number; pageSize?: number; employeeId?: string; reviewPeriod?: string; status?: string }) => {
    const response = await apiClient.get('/api/hr/performance-reviews', { params });
    return response.data.data || response.data;
  },

  getPerformanceReview: async (id: string) => {
    const response = await apiClient.get(`/api/hr/performance-reviews/${id}`);
    return response.data.data || response.data;
  },

  createPerformanceReview: async (reviewData: any) => {
    const response = await apiClient.post('/api/hr/performance-reviews', reviewData);
    return response.data.data || response.data;
  },

  updatePerformanceReview: async (id: string, reviewData: any) => {
    const response = await apiClient.put(`/api/hr/performance-reviews/${id}`, reviewData);
    return response.data.data || response.data;
  },

  submitPerformanceReview: async (id: string) => {
    const response = await apiClient.put(`/api/hr/performance-reviews/${id}/submit`);
    return response.data.data || response.data;
  },

  deletePerformanceReview: async (id: string) => {
    const response = await apiClient.delete(`/api/hr/performance-reviews/${id}`);
    return response.data.data || response.data;
  },

  getRecruitments: async (params?: { page?: number; pageSize?: number; position?: string; status?: string; department?: string }) => {
    const response = await apiClient.get('/api/hr/recruitment', { params });
    return response.data.data || response.data;
  },

  getRecruitment: async (id: string) => {
    const response = await apiClient.get(`/api/hr/recruitment/${id}`);
    return response.data.data || response.data;
  },

  createRecruitment: async (recruitmentData: any) => {
    const response = await apiClient.post('/api/hr/recruitment', recruitmentData);
    return response.data.data || response.data;
  },

  updateRecruitment: async (id: string, recruitmentData: any) => {
    const response = await apiClient.put(`/api/hr/recruitment/${id}`, recruitmentData);
    return response.data.data || response.data;
  },

  deleteRecruitment: async (id: string) => {
    const response = await apiClient.delete(`/api/hr/recruitment/${id}`);
    return response.data.data || response.data;
  },

  generateEmployeeReport: async (reportData: any) => {
    const response = await apiClient.post('/api/hr/reports/employees', reportData);
    return response.data.data || response.data;
  },

  generateAttendanceReport: async (reportData: any) => {
    const response = await apiClient.post('/api/hr/reports/attendance', reportData);
    return response.data.data || response.data;
  },

  generateLeaveReport: async (reportData: any) => {
    const response = await apiClient.post('/api/hr/reports/leave', reportData);
    return response.data.data || response.data;
  },
};
