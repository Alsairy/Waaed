import { apiClient } from './api';

export const erpService = {
  getEmployees: async () => {
    const response = await apiClient.get('/api/erp/employees');
    return response.data.data || response.data;
  },
  
  getEmployee: async (id: string) => {
    const response = await apiClient.get(`/api/erp/employees/${id}`);
    return response.data;
  },
  
  createEmployee: async (employeeData: any) => {
    const response = await apiClient.post('/api/erp/employees', employeeData);
    return response.data;
  },
  
  updateEmployee: async (id: string, employeeData: any) => {
    const response = await apiClient.put(`/api/erp/employees/${id}`, employeeData);
    return response.data;
  },
  
  deleteEmployee: async (id: string) => {
    const response = await apiClient.delete(`/api/erp/employees/${id}`);
    return response.data;
  },
};
