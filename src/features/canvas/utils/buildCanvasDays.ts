import type { MoodEntry } from '@/src/db/repos/moodRepo';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';

import type { CanvasDay } from '../hooks/useCanvasData';

/**
 * Groups mood entries into per-day CanvasDay[] for a given month.
 * Caps each day at 4 colors (oldest → newest insertion order).
 *
 * @param entries Raw mood entries from the DB for the month
 * @param year    Full year (e.g. 2025)
 * @param month   0-indexed month, matching JavaScript's Date convention
 */
export function buildCanvasDays(entries: MoodEntry[], year: number, month: number): CanvasDay[] {
  const grouped = new Map<string, string[]>();
  for (const entry of entries) {
    const color = getMoodDisplayInfo(entry.primaryMood)?.color;
    if (!color) continue;
    const existing = grouped.get(entry.dateKey) ?? [];
    if (existing.length < 4) grouped.set(entry.dateKey, [...existing, color]);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    return { date: dateStr, entries: grouped.get(dateStr) ?? [] };
  });
}
