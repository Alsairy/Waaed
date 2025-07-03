import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api'

interface Fee {
  id: string
  studentId: string
  categoryId: string
  categoryName?: string
  amount: number
  dueDate: string
  status: string
  description?: string
  academicYear: string
  semester?: string
  createdAt: string
  updatedAt?: string
}

interface FeeDto {
  studentId: string
  categoryId: string
  amount: number
  dueDate: string
  description?: string
  academicYear: string
  semester?: string
}

interface FeeCategory {
  id: string
  name: string
  description?: string
  isActive: boolean
  defaultAmount?: number
  createdAt: string
  updatedAt?: string
}

interface FeeCategoryDto {
  name: string
  description?: string
  defaultAmount?: number
}

interface Payment {
  id: string
  feeId: string
  studentId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionId?: string
  status: string
  notes?: string
  processedBy?: string
  createdAt: string
}

interface PaymentDto {
  feeId: string
  studentId: string
  amount: number
  paymentMethod: string
  transactionId?: string
  notes?: string
}

interface Budget {
  id: string
  name: string
  description?: string
  totalAmount: number
  allocatedAmount: number
  spentAmount: number
  remainingAmount: number
  startDate: string
  endDate: string
  status: string
  createdAt: string
  updatedAt?: string
}

interface BudgetDto {
  name: string
  description?: string
  totalAmount: number
  startDate: string
  endDate: string
}

interface Expense {
  id: string
  budgetId?: string
  categoryId: string
  amount: number
  description: string
  expenseDate: string
  vendor?: string
  receiptUrl?: string
  approvedBy?: string
  status: string
  createdAt: string
  updatedAt?: string
}

interface ExpenseDto {
  budgetId?: string
  categoryId: string
  amount: number
  description: string
  expenseDate: string
  vendor?: string
  receiptUrl?: string
}

interface FinancialReport {
  id: string
  title: string
  type: string
  period: string
  data: any
  generatedAt: string
  generatedBy: string
}

class FinanceService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async getFees(studentId?: string): Promise<Fee[]> {
    try {
      const url = studentId ? `/finance/fees?studentId=${studentId}` : '/finance/fees'
      const response: AxiosResponse<{data: Fee[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch fees')
    }
  }

  async getFee(id: string): Promise<Fee> {
    try {
      const response: AxiosResponse<{data: Fee}> = await this.api.get(`/finance/fees/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch fee')
    }
  }

  async createFee(feeData: FeeDto): Promise<Fee> {
    try {
      const response: AxiosResponse<{data: Fee}> = await this.api.post('/finance/fees', feeData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create fee')
    }
  }

  async updateFee(id: string, feeData: Partial<FeeDto>): Promise<void> {
    try {
      await this.api.put(`/finance/fees/${id}`, feeData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update fee')
    }
  }

  async deleteFee(id: string): Promise<void> {
    try {
      await this.api.delete(`/finance/fees/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete fee')
    }
  }

  async getFeeCategories(): Promise<FeeCategory[]> {
    try {
      const response: AxiosResponse<{data: FeeCategory[]}> = await this.api.get('/finance/feecategories')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch fee categories')
    }
  }

  async createFeeCategory(categoryData: FeeCategoryDto): Promise<FeeCategory> {
    try {
      const response: AxiosResponse<{data: FeeCategory}> = await this.api.post('/finance/feecategories', categoryData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create fee category')
    }
  }

  async getPayments(studentId?: string, feeId?: string): Promise<Payment[]> {
    try {
      const params = new URLSearchParams()
      if (studentId) params.append('studentId', studentId)
      if (feeId) params.append('feeId', feeId)
      
      const url = `/finance/feepayments${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: Payment[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payments')
    }
  }

  async createPayment(paymentData: PaymentDto): Promise<Payment> {
    try {
      const response: AxiosResponse<{data: Payment}> = await this.api.post('/finance/feepayments', paymentData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment')
    }
  }

  async getBudgets(): Promise<Budget[]> {
    try {
      const response: AxiosResponse<{data: Budget[]}> = await this.api.get('/finance/budget')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch budgets')
    }
  }

  async getBudget(id: string): Promise<Budget> {
    try {
      const response: AxiosResponse<{data: Budget}> = await this.api.get(`/finance/budget/${id}`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch budget')
    }
  }

  async createBudget(budgetData: BudgetDto): Promise<Budget> {
    try {
      const response: AxiosResponse<{data: Budget}> = await this.api.post('/finance/budget', budgetData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create budget')
    }
  }

  async updateBudget(id: string, budgetData: Partial<BudgetDto>): Promise<void> {
    try {
      await this.api.put(`/finance/budget/${id}`, budgetData)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update budget')
    }
  }

  async getExpenses(budgetId?: string): Promise<Expense[]> {
    try {
      const url = budgetId ? `/finance/expenses?budgetId=${budgetId}` : '/finance/expenses'
      const response: AxiosResponse<{data: Expense[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch expenses')
    }
  }

  async createExpense(expenseData: ExpenseDto): Promise<Expense> {
    try {
      const response: AxiosResponse<{data: Expense}> = await this.api.post('/finance/expenses', expenseData)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create expense')
    }
  }

  async getFinancialReports(type?: string, period?: string): Promise<FinancialReport[]> {
    try {
      const params = new URLSearchParams()
      if (type) params.append('type', type)
      if (period) params.append('period', period)
      
      const url = `/finance/reports${params.toString() ? '?' + params.toString() : ''}`
      const response: AxiosResponse<{data: FinancialReport[]}> = await this.api.get(url)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch financial reports')
    }
  }

  async generateFinancialReport(type: string, period: string, parameters?: any): Promise<FinancialReport> {
    try {
      const response: AxiosResponse<{data: FinancialReport}> = await this.api.post('/finance/reports', {
        type,
        period,
        parameters
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate financial report')
    }
  }

  async getStudentBalance(studentId: string): Promise<{
    totalFees: number
    totalPaid: number
    balance: number
    overdueAmount: number
  }> {
    try {
      const response = await this.api.get(`/finance/students/${studentId}/balance`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student balance')
    }
  }

  async getPaymentMethods(): Promise<string[]> {
    try {
      const response = await this.api.get('/finance/payment-methods')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment methods')
    }
  }
}

export const financeService = new FinanceService()
export type { 
  FinanceService, 
  Fee, 
  FeeDto, 
  FeeCategory, 
  FeeCategoryDto, 
  Payment, 
  PaymentDto, 
  Budget, 
  BudgetDto, 
  Expense, 
  ExpenseDto, 
  FinancialReport 
}
