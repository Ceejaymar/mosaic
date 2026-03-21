import * as Notifications from 'expo-notifications';

// ─── Message Pools ──────────────────────────────────────────────────────────

const MORNING_MESSAGES = [
  'Start your morning with a moment of reflection.',
  'Good morning — how are you feeling today?',
  'A new day, a fresh start. Check in with yourself.',
  'Take a breath and set your intention for the day.',
  'Morning check-in: what emotions are showing up?',
  'How did you wake up feeling? Log it in Mosaic.',
];

const AFTERNOON_MESSAGES = [
  "Take a quick pause — how's your afternoon going?",
  'Midday check-in: how are you doing right now?',
  'A moment to pause and notice how you feel.',
  'How has your day been so far? Capture it.',
  'Afternoon reminder: your feelings matter.',
  'Check in with yourself before the day slips by.',
];

const EVENING_MESSAGES = [
  'Wind down and reflect on your day.',
  'How was your evening? Take a moment to log it.',
  'Before the day ends, check in with your emotions.',
  'Evening reflection: what stood out today?',
  'How are you feeling as the day winds down?',
  'A quiet moment to process your day in Mosaic.',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getRandomMessage(hour: number): string {
  let pool: string[];
  if (hour >= 6 && hour < 12) {
    pool = MORNING_MESSAGES;
  } else if (hour >= 12 && hour < 17) {
    pool = AFTERNOON_MESSAGES;
  } else {
    pool = EVENING_MESSAGES;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Scheduling ──────────────────────────────────────────────────────────────

export async function rescheduleAllNotifications(
  times: string[],
  isEnabled: boolean,
  isSurpriseMeEnabled = false,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!isEnabled) return;

  if (!isSurpriseMeEnabled) {
    for (const time of times) {
      const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
      if (!match) continue;
      const hour = Number(match[1]);
      const minute = Number(match[2]);
      const message = getRandomMessage(hour);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Mosaic',
          body: message,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  } else if (isSurpriseMeEnabled) {
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + i);
      const randomHour = Math.floor(Math.random() * 11) + 9; // 9–19
      const randomMinute = Math.floor(Math.random() * 60);
      targetDate.setHours(randomHour, randomMinute, 0, 0);

      // Skip today if the generated time has already passed
      if (i === 0 && targetDate.getTime() <= now.getTime()) continue;

      await Notifications.scheduleNotificationAsync({
        content: { title: 'Mosaic', body: getRandomMessage(randomHour) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: targetDate },
      });
    }
  }
}
