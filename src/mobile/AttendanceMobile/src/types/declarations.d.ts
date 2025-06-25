declare module 'react-native-push-notification' {
  export interface PushNotificationOptions {
    onRegister?: (token: any) => void;
    onNotification?: (notification: any) => void;
    onAction?: (notification: any) => void;
    onRegistrationError?: (err: any) => void;
    permissions?: {
      alert?: boolean;
      badge?: boolean;
      sound?: boolean;
    };
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export interface LocalNotificationOptions {
    id?: string;
    title?: string;
    message: string;
    userInfo?: any;
    channelId?: string;
    playSound?: boolean;
    soundName?: string;
    vibrate?: boolean;
    date?: Date;
  }

  export interface ChannelOptions {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  export default class PushNotification {
    static configure(options: PushNotificationOptions): void;
    static localNotification(options: LocalNotificationOptions): void;
    static localNotificationSchedule(options: LocalNotificationOptions): void;
    static cancelLocalNotifications(options: { id: string }): void;
    static cancelAllLocalNotifications(): void;
    static setApplicationIconBadgeNumber(number: number): void;
    static createChannel(options: ChannelOptions, callback?: (created: boolean) => void): void;
  }
}

declare module 'react-native-background-job' {
  export interface BackgroundJobOptions {
    jobKey: string;
    period?: number;
  }

  export default class BackgroundJob {
    static start(options: BackgroundJobOptions): void;
    static stop(options: { jobKey: string }): void;
    static isRunning(options: { jobKey: string }): boolean;
  }
}

declare module '@react-native-community/push-notification-ios' {
  export interface PushNotificationPermissions {
    alert?: boolean;
    badge?: boolean;
    sound?: boolean;
  }

  export enum FetchResult {
    NoData = 'noData',
    NewData = 'newData',
    ResultFailed = 'resultFailed',
  }

  export default class PushNotificationIOS {
    static requestPermissions(permissions?: PushNotificationPermissions): Promise<PushNotificationPermissions>;
    static setApplicationIconBadgeNumber(number: number): void;
    static finish(fetchResult: FetchResult): void;
    static FetchResult: typeof FetchResult;
  }
}
