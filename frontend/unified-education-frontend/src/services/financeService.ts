import { apiClient } from './api';

interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  status: string;
}

interface FeeStructure {
  id: string;
  name: string;
  academicYear: string;
  class: string;
  amount: number;
}

interface FeeCollection {
  id: string;
  studentId: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
}

interface Budget {
  id: string;
  year: string;
  department: string;
  allocatedAmount: number;
  spentAmount: number;
}

interface PayrollEntry {
  id: string;
  employeeId: string;
  month: string;
  year: string;
  basicSalary: number;
  totalSalary: number;
}

export const financeService = {
  getStudents: async (params?: { page?: number; pageSize?: number; class?: string; section?: string }) => {
    const response = await apiClient.get('/api/finance/students', { params });
    return response.data.data || response.data;
  },

  getStudent: async (id: string) => {
    const response = await apiClient.get(`/api/finance/students/${id}`);
    return response.data.data || response.data;
  },

  createStudent: async (studentData: Partial<Student>) => {
    const response = await apiClient.post('/api/finance/students', studentData);
    return response.data.data || response.data;
  },

  updateStudent: async (id: string, studentData: Partial<Student>) => {
    const response = await apiClient.put(`/api/finance/students/${id}`, studentData);
    return response.data.data || response.data;
  },

  deleteStudent: async (id: string) => {
    const response = await apiClient.delete(`/api/finance/students/${id}`);
    return response.data.data || response.data;
  },

  getFeeStructures: async (params?: { page?: number; pageSize?: number; academicYear?: string; class?: string }) => {
    const response = await apiClient.get('/api/finance/fee-structures', { params });
    return response.data.data || response.data;
  },

  getFeeStructure: async (id: string) => {
    const response = await apiClient.get(`/api/finance/fee-structures/${id}`);
    return response.data.data || response.data;
  },

  createFeeStructure: async (feeStructureData: Partial<FeeStructure>) => {
    const response = await apiClient.post('/api/finance/fee-structures', feeStructureData);
    return response.data.data || response.data;
  },

  updateFeeStructure: async (id: string, feeStructureData: Partial<FeeStructure>) => {
    const response = await apiClient.put(`/api/finance/fee-structures/${id}`, feeStructureData);
    return response.data.data || response.data;
  },

  deleteFeeStructure: async (id: string) => {
    const response = await apiClient.delete(`/api/finance/fee-structures/${id}`);
    return response.data.data || response.data;
  },

  getFeeCollections: async (params?: { page?: number; pageSize?: number; studentId?: string; status?: string }) => {
    const response = await apiClient.get('/api/finance/fee-collections', { params });
    return response.data.data || response.data;
  },

  getFeeCollection: async (id: string) => {
    const response = await apiClient.get(`/api/finance/fee-collections/${id}`);
    return response.data.data || response.data;
  },

  createFeeCollection: async (feeCollectionData: Partial<FeeCollection>) => {
    const response = await apiClient.post('/api/finance/fee-collections', feeCollectionData);
    return response.data.data || response.data;
  },

  updateFeeCollection: async (id: string, feeCollectionData: Partial<FeeCollection>) => {
    const response = await apiClient.put(`/api/finance/fee-collections/${id}`, feeCollectionData);
    return response.data.data || response.data;
  },

  deleteFeeCollection: async (id: string) => {
    const response = await apiClient.delete(`/api/finance/fee-collections/${id}`);
    return response.data.data || response.data;
  },

  getExpenses: async (params?: { page?: number; pageSize?: number; category?: string; dateFrom?: string; dateTo?: string }) => {
    const response = await apiClient.get('/api/finance/expenses', { params });
    return response.data.data || response.data;
  },

  getExpense: async (id: string) => {
    const response = await apiClient.get(`/api/finance/expenses/${id}`);
    return response.data.data || response.data;
  },

  createExpense: async (expenseData: Partial<Expense>) => {
    const response = await apiClient.post('/api/finance/expenses', expenseData);
    return response.data.data || response.data;
  },

  updateExpense: async (id: string, expenseData: Partial<Expense>) => {
    const response = await apiClient.put(`/api/finance/expenses/${id}`, expenseData);
    return response.data.data || response.data;
  },

  deleteExpense: async (id: string) => {
    const response = await apiClient.delete(`/api/finance/expenses/${id}`);
    return response.data.data || response.data;
  },

  getBudgets: async (params?: { page?: number; pageSize?: number; year?: string; department?: string }) => {
    const response = await apiClient.get('/api/finance/budgets', { params });
    return response.data.data || response.data;
  },

  getBudget: async (id: string) => {
    const response = await apiClient.get(`/api/finance/budgets/${id}`);
    return response.data.data || response.data;
  },

  createBudget: async (budgetData: Partial<Budget>) => {
    const response = await apiClient.post('/api/finance/budgets', budgetData);
    return response.data.data || response.data;
  },

  updateBudget: async (id: string, budgetData: Partial<Budget>) => {
    const response = await apiClient.put(`/api/finance/budgets/${id}`, budgetData);
    return response.data.data || response.data;
  },

  deleteBudget: async (id: string) => {
    const response = await apiClient.delete(`/api/finance/budgets/${id}`);
    return response.data.data || response.data;
  },

  getPayrollEntries: async (params?: { page?: number; pageSize?: number; month?: string; year?: string; employeeId?: string }) => {
    const response = await apiClient.get('/api/finance/payroll', { params });
    return response.data.data || response.data;
  },

  getPayrollEntry: async (id: string) => {
    const response = await apiClient.get(`/api/finance/payroll/${id}`);
    return response.data.data || response.data;
  },

  createPayrollEntry: async (payrollData: Partial<PayrollEntry>) => {
    const response = await apiClient.post('/api/finance/payroll', payrollData);
    return response.data.data || response.data;
  },

  updatePayrollEntry: async (id: string, payrollData: Partial<PayrollEntry>) => {
    const response = await apiClient.put(`/api/finance/payroll/${id}`, payrollData);
    return response.data.data || response.data;
  },

  deletePayrollEntry: async (id: string) => {
    const response = await apiClient.delete(`/api/finance/payroll/${id}`);
    return response.data.data || response.data;
  },

  getFinancialReports: async (params?: { page?: number; pageSize?: number; type?: string; dateFrom?: string; dateTo?: string }) => {
    const response = await apiClient.get('/api/finance/reports', { params });
    return response.data.data || response.data;
  },

  getFinancialReport: async (id: string) => {
    const response = await apiClient.get(`/api/finance/reports/${id}`);
    return response.data.data || response.data;
  },

  generateFinancialReport: async (reportData: Record<string, unknown>) => {
    const response = await apiClient.post('/api/finance/reports/generate', reportData);
    return response.data.data || response.data;
  },

  exportFinancialReport: async (id: string, format: string) => {
    const response = await apiClient.get(`/api/finance/reports/${id}/export`, { 
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },
};
