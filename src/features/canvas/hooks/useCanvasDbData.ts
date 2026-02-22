import { useEffect, useState } from 'react';

import { fetchMoodEntriesForMonth } from '@/src/db/repos/moodRepo';

import { buildCanvasDays } from '../utils/buildCanvasDays';
import type { CanvasDay } from './useCanvasData';

export type CanvasDbState = {
  days: CanvasDay[];
  loading: boolean;
  error: unknown;
};

/**
 * Fetches real mood entries from the DB for a given month/year and returns
 * them shaped as CanvasDay[]. Skips the fetch when `enabled` is false.
 */
export function useCanvasDbData(month: number, year: number, enabled: boolean): CanvasDbState {
  const [days, setDays] = useState<CanvasDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!enabled) {
      setDays([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMoodEntriesForMonth(year, month)
      .then((entries) => {
        if (cancelled) return;
        setDays(buildCanvasDays(entries, year, month));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month, year, enabled]);

  return { days, loading, error };
}
