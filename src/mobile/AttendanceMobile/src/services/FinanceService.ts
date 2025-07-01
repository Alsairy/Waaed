import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/finance';

class FinanceServiceClass {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getFees(params?: { search?: string; status?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/fees`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
  }

  async getFee(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/fees/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching fee:', error);
      throw error;
    }
  }

  async makePayment(feeId: string, paymentData?: {
    method?: string;
    amount?: number;
    notes?: string;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/fees/${feeId}/pay`, paymentData || {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error making payment:', error);
      throw error;
    }
  }

  async getPaymentHistory(params?: { page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/payments`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  async getFinancialSummary() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/summary`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      throw error;
    }
  }

  async downloadReceipt(paymentId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}/receipt`, {
        headers,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  }

  async getPaymentMethods() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/payment-methods`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }
}

export const FinanceService = new FinanceServiceClass();
