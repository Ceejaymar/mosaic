import i18n from '@/src/i18n';

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(i18n.language, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
