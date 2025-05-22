import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

class NotificationService {
  async initialize() {
    // Request permission for iOS
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('User notification permissions denied');
        return;
      }
    }

    // Get FCM token
    const token = await this.getFCMToken();
    return token;
  }

  async getFCMToken() {
    const token = await messaging().getToken();
    return token;
  }

  async onTokenRefresh(callback: (token: string) => void) {
    return messaging().onTokenRefresh((token) => {
      callback(token);
    });
  }

  async onNotificationOpenedApp(callback: (message: any) => void) {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
      callback(remoteMessage);
    });
  }

  async getInitialNotification(callback: (message: any) => void) {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      callback(remoteMessage);
    }
  }
}

export const notificationService = new NotificationService();
