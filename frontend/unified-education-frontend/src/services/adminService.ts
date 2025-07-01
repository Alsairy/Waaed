import { apiClient } from './api';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: string;
}

export const adminService = {
  getTenants: async () => {
    const response = await apiClient.get('/api/admin/tenants');
    return response.data.data || response.data;
  },
  
  getTenant: async (id: string) => {
    const response = await apiClient.get(`/api/admin/tenants/${id}`);
    return response.data.data || response.data;
  },
  
  createTenant: async (tenantData: Partial<Tenant>) => {
    const response = await apiClient.post('/api/admin/tenants', tenantData);
    return response.data.data || response.data;
  },
  
  updateTenant: async (id: string, tenantData: Partial<Tenant>) => {
    const response = await apiClient.put(`/api/admin/tenants/${id}`, tenantData);
    return response.data.data || response.data;
  },
  
  deleteTenant: async (id: string) => {
    const response = await apiClient.delete(`/api/admin/tenants/${id}`);
    return response.data.data || response.data;
  },
};
