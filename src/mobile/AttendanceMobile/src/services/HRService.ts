import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/hr';

class HRServiceClass {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getEmployees(params?: { search?: string; department?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/employees`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  async getEmployee(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/employees/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }

  async createEmployee(employeeData: {
    firstName: string;
    lastName: string;
    email: string;
    positionId: string;
    departmentId: string;
    hireDate: string;
    salary: number;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/employees`, employeeData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  async updateEmployee(id: string, employeeData: any) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/employees/${id}`, employeeData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  async getLeaveRequests(params?: { status?: string; employeeId?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/leave-requests`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  async createLeaveRequest(leaveData: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/leave-requests`, leaveData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  }

  async approveLeaveRequest(requestId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/leave-requests/${requestId}/approve`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  async rejectLeaveRequest(requestId: string, reason?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/leave-requests/${requestId}/reject`, { reason }, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  }

  async getPayrollEntries(params?: { period?: string; employeeId?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/payroll`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payroll entries:', error);
      throw error;
    }
  }

  async processPayroll(payrollData: {
    employeeId: string;
    period: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/payroll`, payrollData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payroll:', error);
      throw error;
    }
  }

  async getDepartments() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/departments`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  async getPositions() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/positions`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  async getPerformanceReviews(params?: { employeeId?: string; period?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/performance-reviews`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching performance reviews:', error);
      throw error;
    }
  }

  async createPerformanceReview(reviewData: {
    employeeId: string;
    reviewPeriod: string;
    goals: string;
    achievements: string;
    rating: number;
    comments: string;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/performance-reviews`, reviewData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating performance review:', error);
      throw error;
    }
  }

  async getRecruitmentJobs(params?: { status?: string; department?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/recruitment`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recruitment jobs:', error);
      throw error;
    }
  }

  async createRecruitmentJob(jobData: {
    title: string;
    description: string;
    requirements: string;
    departmentId: string;
    positionId: string;
    salaryRange: string;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/recruitment`, jobData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating recruitment job:', error);
      throw error;
    }
  }
}

export const HRService = new HRServiceClass();
