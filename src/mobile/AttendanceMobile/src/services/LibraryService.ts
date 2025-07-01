import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/library';

class LibraryServiceClass {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getBooks(params?: { search?: string; category?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/books`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  }

  async getBook(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/books/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  }

  async reserveBook(bookId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/books/${bookId}/reserve`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error reserving book:', error);
      throw error;
    }
  }

  async getBookIssues(params?: { status?: string; memberId?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/issues`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching book issues:', error);
      throw error;
    }
  }

  async issueBook(bookId: string, memberId: string, dueDate: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/issues`, {
        bookId,
        memberId,
        dueDate,
      }, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error issuing book:', error);
      throw error;
    }
  }

  async returnBook(issueId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/issues/${issueId}/return`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error returning book:', error);
      throw error;
    }
  }

  async getBookReservations(params?: { status?: string; memberId?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/reservations`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching book reservations:', error);
      throw error;
    }
  }

  async cancelReservation(reservationId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete(`${API_BASE_URL}/reservations/${reservationId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error canceling reservation:', error);
      throw error;
    }
  }

  async getMembers(params?: { search?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/members`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  }

  async getFines(params?: { memberId?: string; status?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/fines`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching fines:', error);
      throw error;
    }
  }

  async payFine(fineId: string, amount: number) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/fines/${fineId}/pay`, {
        amount,
      }, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error paying fine:', error);
      throw error;
    }
  }

  async getLibraryReports(reportType: string, params?: any) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/reports/${reportType}`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching library reports:', error);
      throw error;
    }
  }
}

export const LibraryService = new LibraryServiceClass();
