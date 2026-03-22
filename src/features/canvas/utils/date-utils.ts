import { differenceInDays, parseISO, startOfDay } from 'date-fns';

import { MAX_BACKDATE_DAYS } from '@/src/constants/config';

/** Returns true if dateKey (YYYY-MM-DD) is older than MAX_BACKDATE_DAYS. */
export function isPastBackdateLimit(dateKey: string): boolean {
  const today = startOfDay(new Date());
  const targetDate = startOfDay(parseISO(dateKey));
  const diff = differenceInDays(today, targetDate);
  return diff > MAX_BACKDATE_DAYS;
}
