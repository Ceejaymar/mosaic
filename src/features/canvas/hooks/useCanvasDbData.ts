import { useEffect, useState } from 'react';

import { fetchMoodEntriesForMonth } from '@/src/db/repos/moodRepo';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';

import type { CanvasDay } from './useCanvasData';

/**
 * Fetches real mood entries from the DB for a given month/year and returns
 * them shaped as CanvasDay[]. Skips the fetch when `enabled` is false.
 */
export function useCanvasDbData(month: number, year: number, enabled: boolean): CanvasDay[] {
  const [days, setDays] = useState<CanvasDay[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    fetchMoodEntriesForMonth(year, month)
      .then((entries) => {
        if (cancelled) return;

        // Group colors by dateKey, capped at 4 per day (oldest → newest order)
        const grouped = new Map<string, string[]>();
        for (const entry of entries) {
          const color = getMoodDisplayInfo(entry.primaryMood)?.color;
          if (!color) continue;
          const existing = grouped.get(entry.dateKey) ?? [];
          if (existing.length < 4) {
            grouped.set(entry.dateKey, [...existing, color]);
          }
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const canvasDays: CanvasDay[] = Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const mm = String(month + 1).padStart(2, '0');
          const dd = String(day).padStart(2, '0');
          const dateStr = `${year}-${mm}-${dd}`;
          return { date: dateStr, entries: grouped.get(dateStr) ?? [] };
        });

        setDays(canvasDays);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [month, year, enabled]);

  // Reset to empty when disabled (switching to demo mode)
  useEffect(() => {
    if (!enabled) setDays([]);
  }, [enabled]);

  return days;
}
