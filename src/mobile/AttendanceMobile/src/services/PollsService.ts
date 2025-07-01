import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/polls';

class PollsServiceClass {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getPolls(params?: { status?: string; search?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/polls`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching polls:', error);
      throw error;
    }
  }

  async getPoll(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/polls/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching poll:', error);
      throw error;
    }
  }

  async createPoll(pollData: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isAnonymous: boolean;
    allowMultipleChoices: boolean;
    options: Array<{ text: string }>;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/polls`, pollData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  async updatePoll(id: string, pollData: any) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/polls/${id}`, pollData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating poll:', error);
      throw error;
    }
  }

  async deletePoll(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.delete(`${API_BASE_URL}/polls/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw error;
    }
  }

  async vote(pollId: string, optionIds: string[]) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/polls/${pollId}/vote`, {
        optionIds,
      }, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  async getMyVotes(params?: { page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/my-votes`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my votes:', error);
      throw error;
    }
  }

  async getPollResults(pollId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/polls/${pollId}/results`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching poll results:', error);
      throw error;
    }
  }

  async publishPoll(pollId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/polls/${pollId}/publish`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error publishing poll:', error);
      throw error;
    }
  }

  async closePoll(pollId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/polls/${pollId}/close`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error closing poll:', error);
      throw error;
    }
  }

  async exportPollResults(pollId: string, format: 'csv' | 'pdf' | 'excel') {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/polls/${pollId}/export`, {
        headers,
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting poll results:', error);
      throw error;
    }
  }
}

export const PollsService = new PollsServiceClass();
