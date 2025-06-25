import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  data?: any;
  scheduledTime?: Date;
}

export class NotificationService {
  private static isInitialized = false;

  static initialize(): void {
    if (this.isInitialized) return;

    PushNotification.configure({
      onRegister: (token: any) => {
        console.log('Push notification token:', token);
      },

      onNotification: (notification: any) => {
        console.log('Notification received:', notification);
        
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
        }

        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      onAction: (notification: any) => {
        console.log('Notification action received:', notification.action);
      },

      onRegistrationError: (err: any) => {
        console.error('Push notification registration error:', err.message);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'attendance-channel',
          channelName: 'Attendance Notifications',
          channelDescription: 'Notifications for attendance reminders and updates',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created: any) => console.log(`Notification channel created: ${created}`)
      );
    }

    this.isInitialized = true;
  }

  static showLocalNotification(notification: NotificationData): void {
    PushNotification.localNotification({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      userInfo: notification.data,
      channelId: 'attendance-channel',
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });
  }

  static scheduleNotification(notification: NotificationData): void {
    if (!notification.scheduledTime) {
      throw new Error('Scheduled time is required for scheduled notifications');
    }

    PushNotification.localNotificationSchedule({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      date: notification.scheduledTime,
      userInfo: notification.data,
      channelId: 'attendance-channel',
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });
  }

  static cancelNotification(notificationId: string): void {
    PushNotification.cancelLocalNotifications({ id: notificationId });
  }

  static cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }

  static setBadgeNumber(number: number): void {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(number);
    } else {
      PushNotification.setApplicationIconBadgeNumber(number);
    }
  }

  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const permissions = await PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      });
      return !!(permissions.alert && permissions.badge && permissions.sound);
    } else {
      return true;
    }
  }

  private static handleNotificationTap(notification: any): void {
    if (notification.data) {
      const { type, id } = notification.data;
      
      switch (type) {
        case 'attendance_reminder':
          break;
        case 'leave_approved':
          break;
        case 'schedule_update':
          break;
        default:
          break;
      }
    }
  }

  static showAttendanceReminder(): void {
    this.showLocalNotification({
      id: 'attendance-reminder',
      title: 'Attendance Reminder',
      message: 'Don\'t forget to check in for work today!',
      data: { type: 'attendance_reminder' },
    });
  }

  static showCheckOutReminder(): void {
    this.showLocalNotification({
      id: 'checkout-reminder',
      title: 'Check Out Reminder',
      message: 'Remember to check out before leaving work.',
      data: { type: 'checkout_reminder' },
    });
  }

  static showLeaveApproved(leaveId: string): void {
    this.showLocalNotification({
      id: `leave-approved-${leaveId}`,
      title: 'Leave Request Approved',
      message: 'Your leave request has been approved.',
      data: { type: 'leave_approved', id: leaveId },
    });
  }
}
