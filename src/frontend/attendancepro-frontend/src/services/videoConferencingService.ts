import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface VideoConference {
  id: string;
  title: string;
  hostId: string;
  scheduledStartTime: string;
  actualStartTime?: string;
  endTime?: string;
  maxParticipants: number;
  status: 'Scheduled' | 'InProgress' | 'Ended';
  meetingUrl: string;
  meetingId: string;
  passcode: string;
  isRecorded: boolean;
  participants: ConferenceParticipant[];
}

export interface ConferenceParticipant {
  id: string;
  conferenceId: string;
  userId: string;
  joinedAt: string;
  leftAt?: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  role: 'Moderator' | 'Participant';
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateConferenceRequest {
  title: string;
  scheduledTime: string;
  maxParticipants?: number;
}

export interface JoinConferenceResponse {
  conference: VideoConference;
  token: string;
}

class VideoConferencingService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async createConference(request: CreateConferenceRequest): Promise<VideoConference> {
    try {
      const response: AxiosResponse<VideoConference> = await this.api.post(
        '/api/collaboration/video-conferences',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error creating conference:', error);
      throw new Error('Failed to create video conference');
    }
  }

  async getConferences(): Promise<VideoConference[]> {
    try {
      const response: AxiosResponse<VideoConference[]> = await this.api.get(
        '/api/collaboration/video-conferences'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conferences:', error);
      throw new Error('Failed to fetch conferences');
    }
  }

  async getConference(conferenceId: string): Promise<VideoConference> {
    try {
      const response: AxiosResponse<VideoConference> = await this.api.get(
        `/api/collaboration/video-conferences/${conferenceId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conference:', error);
      throw new Error('Failed to fetch conference details');
    }
  }

  async joinConference(conferenceId: string): Promise<JoinConferenceResponse> {
    try {
      const response: AxiosResponse<JoinConferenceResponse> = await this.api.post(
        `/api/collaboration/video-conferences/${conferenceId}/join`
      );
      return response.data;
    } catch (error) {
      console.error('Error joining conference:', error);
      throw new Error('Failed to join conference');
    }
  }

  async leaveConference(conferenceId: string): Promise<void> {
    try {
      await this.api.post(`/api/collaboration/video-conferences/${conferenceId}/leave`);
    } catch (error) {
      console.error('Error leaving conference:', error);
      throw new Error('Failed to leave conference');
    }
  }

  async startConference(conferenceId: string): Promise<VideoConference> {
    try {
      const response: AxiosResponse<VideoConference> = await this.api.post(
        `/api/collaboration/video-conferences/${conferenceId}/start`
      );
      return response.data;
    } catch (error) {
      console.error('Error starting conference:', error);
      throw new Error('Failed to start conference');
    }
  }

  async endConference(conferenceId: string): Promise<void> {
    try {
      await this.api.post(`/api/collaboration/video-conferences/${conferenceId}/end`);
    } catch (error) {
      console.error('Error ending conference:', error);
      throw new Error('Failed to end conference');
    }
  }

  async muteParticipant(conferenceId: string, participantId: string): Promise<void> {
    try {
      await this.api.post(
        `/api/collaboration/video-conferences/${conferenceId}/participants/${participantId}/mute`
      );
    } catch (error) {
      console.error('Error muting participant:', error);
      throw new Error('Failed to mute participant');
    }
  }

  async kickParticipant(conferenceId: string, participantId: string): Promise<void> {
    try {
      await this.api.post(
        `/api/collaboration/video-conferences/${conferenceId}/participants/${participantId}/kick`
      );
    } catch (error) {
      console.error('Error kicking participant:', error);
      throw new Error('Failed to kick participant');
    }
  }

  async generateToken(conferenceId: string): Promise<string> {
    try {
      const response: AxiosResponse<{ token: string }> = await this.api.post(
        `/api/collaboration/video-conferences/${conferenceId}/token`
      );
      return response.data.token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw new Error('Failed to generate conference token');
    }
  }
}

export const videoConferencingService = new VideoConferencingService();
