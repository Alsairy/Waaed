import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  messageType: string;
}

export class SignalRService {
  private connection: HubConnection | null = null;
  private isConnected = false;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    const hubUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/hubs/chat`;
    
    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          return localStorage.getItem('accessToken') || '';
        }
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    this.connection.on('ReceiveMessage', (message: ChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.connection.onclose(() => {
      this.isConnected = false;
      this.connectionHandlers.forEach(handler => handler(false));
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
      this.connectionHandlers.forEach(handler => handler(true));
    });

    this.connection.onreconnecting(() => {
      this.isConnected = false;
      this.connectionHandlers.forEach(handler => handler(false));
    });
  }

  async connect(): Promise<void> {
    if (!this.connection || this.isConnected) return;

    try {
      await this.connection.start();
      this.isConnected = true;
      this.connectionHandlers.forEach(handler => handler(true));
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection || !this.isConnected) return;

    try {
      await this.connection.stop();
      this.isConnected = false;
      this.connectionHandlers.forEach(handler => handler(false));
      console.log('SignalR disconnected');
    } catch (error) {
      console.error('SignalR disconnection failed:', error);
    }
  }

  async joinChannel(channelId: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('JoinChannel', channelId);
      console.log(`Joined channel: ${channelId}`);
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  async leaveChannel(channelId: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('LeaveChannel', channelId);
      console.log(`Left channel: ${channelId}`);
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }

  async sendMessage(channelId: string, message: string): Promise<void> {
    if (!this.connection || !this.isConnected) {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('SendMessage', channelId, message);
      console.log(`Message sent to channel: ${channelId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  onMessageReceived(handler: (message: ChatMessage) => void): () => void {
    this.messageHandlers.push(handler);
    
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onConnectionChanged(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.push(handler);
    
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  getConnectionState(): boolean {
    return this.isConnected;
  }

  async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }
}

export const signalRService = new SignalRService();
export default signalRService;
