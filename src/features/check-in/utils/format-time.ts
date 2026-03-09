import i18n from '@/src/i18n';

export function uses24HourClock(): boolean {
  // Test by formatting a known 2 PM time — if "am"/"pm" appears, it's 12h
  return !/[ap]m/i.test(new Date(2000, 0, 1, 14, 0).toLocaleTimeString());
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
