import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/academic-calendar';

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  tenantId: string;
  semesters: Semester[];
}

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
  isActive: boolean;
  events: AcademicEvent[];
}

export interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'Exam' | 'Assignment' | 'Holiday' | 'Meeting' | 'Other';
  startDate: string;
  endDate: string;
  location?: string;
  academicYearId: string;
  semesterId?: string;
  isAllDay: boolean;
  participants: string[];
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
  academicYearId: string;
  isRecurring: boolean;
}

export interface CreateAcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface CreateSemesterRequest {
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  eventType: 'Exam' | 'Assignment' | 'Holiday' | 'Meeting' | 'Other';
  startDate: string;
  endDate: string;
  location?: string;
  academicYearId: string;
  semesterId?: string;
  isAllDay: boolean;
  participants: string[];
}

export interface CreateHolidayRequest {
  name: string;
  date: string;
  description?: string;
  academicYearId: string;
  isRecurring: boolean;
}

class AcademicCalendarServiceClass {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic-years`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch academic years');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching academic years:', error);
      throw error;
    }
  }

  async getAcademicYear(id: string): Promise<AcademicYear> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic-years/${id}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch academic year');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching academic year:', error);
      throw error;
    }
  }

  async createAcademicYear(request: CreateAcademicYearRequest): Promise<AcademicYear> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic-years`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create academic year');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating academic year:', error);
      throw error;
    }
  }

  async getSemesters(academicYearId?: string): Promise<Semester[]> {
    try {
      const headers = await this.getAuthHeaders();
      const url = academicYearId 
        ? `${API_BASE_URL}/academic-years/${academicYearId}/semesters`
        : `${API_BASE_URL}/semesters`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch semesters');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching semesters:', error);
      throw error;
    }
  }

  async createSemester(request: CreateSemesterRequest): Promise<Semester> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/semesters`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create semester');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating semester:', error);
      throw error;
    }
  }

  async getEvents(params?: { 
    academicYearId?: string; 
    semesterId?: string; 
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AcademicEvent[]> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      if (params?.academicYearId) queryParams.append('academicYearId', params.academicYearId);
      if (params?.semesterId) queryParams.append('semesterId', params.semesterId);
      if (params?.eventType) queryParams.append('eventType', params.eventType);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const url = `${API_BASE_URL}/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async createEvent(request: CreateEventRequest): Promise<AcademicEvent> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getHolidays(academicYearId?: string): Promise<Holiday[]> {
    try {
      const headers = await this.getAuthHeaders();
      const url = academicYearId 
        ? `${API_BASE_URL}/academic-years/${academicYearId}/holidays`
        : `${API_BASE_URL}/holidays`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch holidays');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching holidays:', error);
      throw error;
    }
  }

  async createHoliday(request: CreateHolidayRequest): Promise<Holiday> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/holidays`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to create holiday');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating holiday:', error);
      throw error;
    }
  }

  async getUpcomingEvents(days: number = 7): Promise<AcademicEvent[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/events/upcoming?days=${days}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming events');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  async getMySchedule(startDate: string, endDate: string): Promise<AcademicEvent[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/my-schedule?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, request: Partial<CreateEventRequest>): Promise<AcademicEvent> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }
}

export const AcademicCalendarService = new AcademicCalendarServiceClass();
