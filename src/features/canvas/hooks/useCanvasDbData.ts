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
 * Session-level cache keyed by "year-month". Past months are immutable so
 * cached results stay valid for the app session. When the user adds a new
 * entry for the current month, call `invalidateMonthCache` so the next fetch
 * picks up the change.
 */
const _cache = new Map<string, CanvasDay[]>();

export function invalidateMonthCache(year: number, month: number): void {
  _cache.delete(`${year}-${month}`);
}

/**
 * Proactively warms the cache for a month without rendering.
 * Silent on failure — prefetch is best-effort.
 */
export async function prefetchMonth(year: number, month: number): Promise<void> {
  const key = `${year}-${month}`;
  if (_cache.has(key)) return;
  try {
    const entries = await fetchMoodEntriesForMonth(year, month);
    if (!_cache.has(key)) _cache.set(key, buildCanvasDays(entries, year, month));
  } catch {
    // silent
  }
}

/**
 * Fetches real mood entries from the DB for a given month/year and returns
 * them shaped as CanvasDay[]. Results are cached so re-visiting a month is instant.
 */
export function useCanvasDbData(month: number, year: number): CanvasDbState {
  const [days, setDays] = useState<CanvasDay[]>(() => _cache.get(`${year}-${month}`) ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const key = `${year}-${month}`;
    const cached = _cache.get(key);
    if (cached) {
      setDays(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMoodEntriesForMonth(year, month)
      .then((entries) => {
        if (cancelled) return;
        const result = buildCanvasDays(entries, year, month);
        _cache.set(key, result);
        setDays(result);
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
  }, [month, year]);

  return { days, loading, error };
}
