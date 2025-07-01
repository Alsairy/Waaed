import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/lms';

class LMSServiceClass {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getCourses(params?: { search?: string; status?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async getCourse(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/courses/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  async enrollInCourse(courseId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/enroll`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }

  async getAssignments(courseId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const url = courseId 
        ? `${API_BASE_URL}/courses/${courseId}/assignments`
        : `${API_BASE_URL}/assignments`;
      const response = await axios.get(url, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  async getAssignment(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/assignments/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  }

  async submitAssignment(assignmentId: string, submission: {
    content: string;
    attachments?: string[];
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/assignments/${assignmentId}/submit`, submission, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  async getGrades(courseId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const url = courseId 
        ? `${API_BASE_URL}/courses/${courseId}/grades`
        : `${API_BASE_URL}/grades`;
      const response = await axios.get(url, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  async getQuizzes(courseId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const url = courseId 
        ? `${API_BASE_URL}/courses/${courseId}/quizzes`
        : `${API_BASE_URL}/quizzes`;
      const response = await axios.get(url, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  }

  async takeQuiz(quizId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/quizzes/${quizId}/start`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error starting quiz:', error);
      throw error;
    }
  }

  async submitQuiz(quizId: string, answers: { questionId: string; answer: string }[]) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/quizzes/${quizId}/submit`, { answers }, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  async getDiscussions(courseId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const url = courseId 
        ? `${API_BASE_URL}/courses/${courseId}/discussions`
        : `${API_BASE_URL}/discussions`;
      const response = await axios.get(url, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching discussions:', error);
      throw error;
    }
  }

  async createDiscussionPost(discussionId: string, content: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/discussions/${discussionId}/posts`, {
        content,
      }, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating discussion post:', error);
      throw error;
    }
  }

  async getAnnouncements(courseId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const url = courseId 
        ? `${API_BASE_URL}/courses/${courseId}/announcements`
        : `${API_BASE_URL}/announcements`;
      const response = await axios.get(url, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  async getCourseModules(courseId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/modules`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course modules:', error);
      throw error;
    }
  }

  async markModuleItemComplete(moduleId: string, itemId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/modules/${moduleId}/items/${itemId}/complete`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error marking module item complete:', error);
      throw error;
    }
  }

  async getRubrics() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/rubrics`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching rubrics:', error);
      throw error;
    }
  }

  async getLearningOutcomes(courseId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const url = courseId 
        ? `${API_BASE_URL}/courses/${courseId}/outcomes`
        : `${API_BASE_URL}/outcomes`;
      const response = await axios.get(url, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching learning outcomes:', error);
      throw error;
    }
  }

  async getCalendarEvents(courseId?: string) {
    try {
      const headers = await this.getAuthHeaders();
      const url = courseId 
        ? `${API_BASE_URL}/courses/${courseId}/calendar`
        : `${API_BASE_URL}/calendar`;
      const response = await axios.get(url, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }
}

export const LMSService = new LMSServiceClass();
