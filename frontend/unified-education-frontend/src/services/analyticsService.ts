import { apiClient } from './api';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: unknown[];
}

export const analyticsService = {
  getMetrics: async () => {
    const response = await apiClient.get('/api/analytics/metrics');
    return response.data.data || response.data;
  },
  
  getDashboards: async () => {
    const response = await apiClient.get('/api/analytics/dashboards');
    return response.data.data || response.data;
  },
  
  getReports: async () => {
    const response = await apiClient.get('/api/analytics/reports');
    return response.data.data || response.data;
  },
  
  createDashboard: async (dashboardData: Partial<Dashboard>) => {
    const response = await apiClient.post('/api/analytics/dashboards', dashboardData);
    return response.data.data || response.data;
  },
};
