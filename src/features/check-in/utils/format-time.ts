import { getCalendars } from 'expo-localization';

import i18n from '@/src/i18n';
import { useAppStore } from '@/src/store/useApp';

export function uses24HourClock(): boolean {
  return getCalendars()[0]?.uses24hourClock ?? false;
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const { timeFormat } = useAppStore.getState().preferences;
  let hour12 = !uses24HourClock();
  if (timeFormat === '12h') hour12 = true;
  if (timeFormat === '24h') hour12 = false;

  return date.toLocaleTimeString(i18n.language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
  });
}
