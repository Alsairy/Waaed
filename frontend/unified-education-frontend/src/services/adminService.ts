import { apiClient } from './api';

export const adminService = {
  getTenants: async () => {
    const response = await apiClient.get('/api/admin/tenants');
    return response.data.data || response.data;
  },
  
  getTenant: async (id: string) => {
    const response = await apiClient.get(`/api/admin/tenants/${id}`);
    return response.data.data || response.data;
  },
  
  createTenant: async (tenantData: any) => {
    const response = await apiClient.post('/api/admin/tenants', tenantData);
    return response.data.data || response.data;
  },
  
  updateTenant: async (id: string, tenantData: any) => {
    const response = await apiClient.put(`/api/admin/tenants/${id}`, tenantData);
    return response.data.data || response.data;
  },
  
  deleteTenant: async (id: string) => {
    const response = await apiClient.delete(`/api/admin/tenants/${id}`);
    return response.data.data || response.data;
  },
};
