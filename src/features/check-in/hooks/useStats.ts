import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { dateToKey, fetchCheckInCountForRange } from '@/src/db/repos/moodRepo';
import { getUserStats, syncStreakFromHistory } from '@/src/db/repos/statsRepo';
import { getAllDemoEntries } from '@/src/features/demo/generateDemoData';
import { useAppStore } from '@/src/store/useApp';

/** Returns the start of the current week in local time, respecting the firstDayOfWeek preference. */
function getWeekStart(firstDayOfWeek: 'sunday' | 'monday'): Date {
  const today = new Date();
  const jsDow = today.getDay(); // Sun=0, Mon=1, ..., Sat=6
  const diff = firstDayOfWeek === 'monday' ? (jsDow + 6) % 7 : jsDow;
  const start = new Date(today);
  start.setDate(today.getDate() - diff);
  return start;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStats() {
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const firstDayOfWeek = useAppStore((s) => s.preferences.firstDayOfWeek);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [checkInsThisWeek, setCheckInsThisWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const weekFrom = dateToKey(getWeekStart(firstDayOfWeek));
      const todayKey = dateToKey();

      // Streak always comes from the real stats table — not affected by demo mode.
      // On first boot (lastActiveDate === null) backfill from historical entries.
      let stats = await getUserStats();
      if (stats.lastActiveDate === null) {
        await syncStreakFromHistory();
        stats = await getUserStats();
      }
      setCurrentStreak(stats.currentStreak);
      setLongestStreak(stats.longestStreak);

      // Check-ins this week respects demo mode
      if (isDemoMode) {
        const all = getAllDemoEntries();
        setCheckInsThisWeek(
          all.filter((e) => e.dateKey >= weekFrom && e.dateKey <= todayKey).length,
        );
      } else {
        const weekCount = await fetchCheckInCountForRange(weekFrom, todayKey);
        setCheckInsThisWeek(weekCount);
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode, firstDayOfWeek]);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when the app returns to foreground (handles midnight crossover)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') load();
    });
    return () => subscription.remove();
  }, [load]);

  return { currentStreak, longestStreak, checkInsThisWeek, isLoading, refreshStats: load };
}
