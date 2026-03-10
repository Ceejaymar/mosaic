import i18n from '@/src/i18n';

export function uses24HourClock(): boolean {
  return !Intl.DateTimeFormat(i18n.language, { hour: 'numeric' }).resolvedOptions().hour12;
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(i18n.language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !uses24HourClock(),
  });
}
