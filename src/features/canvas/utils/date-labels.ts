/**
 * Locale-aware date label utilities for the Canvas feature.
 *
 * All functions accept a BCP 47 locale string (e.g. 'en', 'es') and delegate
 * to Intl.DateTimeFormat so labels automatically reflect the app's active
 * language — no hardcoded strings, no separate translation keys needed.
 */

/** Stable React list keys for the 7 days of the week, Sunday-first */
const DOW_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/** Jan 7 2024 was a Sunday — stable reference date for weekday name lookup */
const SUNDAY_REF = new Date(2024, 0, 7);
const MS_PER_DAY = 86_400_000;

/**
 * Returns narrow weekday labels for the given locale, Sunday-first.
 *
 * en → [{ key: 'sun', label: 'S' }, { key: 'mon', label: 'M' }, …]
 * es → [{ key: 'sun', label: 'D' }, { key: 'mon', label: 'L' }, …]
 */
export function getDowLabels(locale: string): { key: string; label: string }[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  return DOW_KEYS.map((key, i) => ({
    key,
    label: fmt.format(new Date(SUNDAY_REF.getTime() + i * MS_PER_DAY)),
  }));
}

/**
 * Returns the localized name of a month (0-indexed).
 *
 * getMonthName(0, 'long',  'en') → "January"
 * getMonthName(0, 'long',  'es') → "enero"
 * getMonthName(0, 'short', 'en') → "Jan"
 * getMonthName(0, 'short', 'es') → "ene"
 */
export function getMonthName(month: number, format: 'long' | 'short', locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: format }).format(new Date(2024, month, 1));
}
