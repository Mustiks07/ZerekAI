import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── Configuration ──────────────────────────────────────────────────

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── Registration ───────────────────────────────────────────────────

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'ZerekAI',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (error) {
    console.error('Push notification registration error:', error);
    return null;
  }
}

// ─── Daily Reminder ─────────────────────────────────────────────────

export async function scheduleDailyReminder(): Promise<void> {
  // Cancel existing daily reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule daily at 18:00
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ZerekAI 📚',
      body: 'Бүгін сабақ оқыдың ба? Серияңды жалғастыр! 🔥',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
