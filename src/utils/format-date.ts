import { formatTime } from '@/src/features/check-in/utils/format-time';
import i18n from '@/src/i18n';

/**
 * Returns a human-readable day label for a dateKey ("YYYY-MM-DD"):
 *   - i18n "Today" / "Yesterday" for the two most recent days
 *   - Locale-aware "Month D" (or "Month D, YYYY" for past years) for everything older
 */
export function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const yd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yKey = `${yd.getFullYear()}-${pad(yd.getMonth() + 1)}-${pad(yd.getDate())}`;
  if (dateKey === todayKey) return i18n.t('common.today');
  if (dateKey === yKey) return i18n.t('common.yesterday');
  const date = new Date(y, m - 1, d);
  const options: Intl.DateTimeFormatOptions =
    y !== now.getFullYear()
      ? { month: 'long', day: 'numeric', year: 'numeric' }
      : { month: 'long', day: 'numeric' };
  return date.toLocaleDateString(i18n.language, options);
}

/**
 * Returns relative time ("2 mins ago") for entries logged today,
 * or an absolute time string for older entries.
 * Delegates absolute formatting to formatTime (NaN guard + honours 24h preference).
 */
export function formatEntryTime(occurredAt: string): string {
  const date = new Date(occurredAt);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMs / 3_600_000);
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  // Older entries: delegate to shared formatTime (NaN guard + i18n.language + 24h)
  return formatTime(occurredAt);
}

export const formatDate = (date: Date, locale = 'en-US') => {
  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateShort = (date: Date, locale = 'en-US') => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
};

// Returns standard lowercase suffixes (e.g., "1st", "2nd") for general reuse
export const getDayWithSuffix = (day: number): string => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

// Specifically formats to e.g. "THURSDAY, FEBRUARY 19TH"
export const getFormattedDateLabel = (date: Date = new Date(), locale = 'en-US'): string => {
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' }).toUpperCase();
  const month = date.toLocaleDateString(locale, { month: 'long' }).toUpperCase();
  const day = date.getDate();
  const dayWithSuffix = getDayWithSuffix(day).toUpperCase();

  return `${weekday}, ${month} ${dayWithSuffix}`;
};
