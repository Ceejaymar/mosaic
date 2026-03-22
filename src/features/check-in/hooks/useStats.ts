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

      if (isDemoMode) {
        // Source everything from the demo dataset — never touch the real DB
        const all = getAllDemoEntries();
        const daySet = new Set(all.map((e) => e.dateKey));

        // Current streak: walk backward from today (or yesterday)
        const todayStr = todayKey;
        const yesterdayStr = dateToKey(new Date(new Date().setDate(new Date().getDate() - 1)));
        let startKey: string | null = null;
        if (daySet.has(todayStr)) startKey = todayStr;
        else if (daySet.has(yesterdayStr)) startKey = yesterdayStr;

        let streak = 0;
        if (startKey) {
          const [y, m, d] = startKey.split('-').map(Number);
          const cursor = new Date(y, m - 1, d);
          while (daySet.has(dateToKey(cursor))) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
          }
        }
        setCurrentStreak(streak);

        // Longest streak
        const sorted = [...daySet].sort();
        let longest = sorted.length > 0 ? 1 : 0;
        let run = 1;
        for (let i = 1; i < sorted.length; i++) {
          const prev = new Date(sorted[i - 1]);
          const curr = new Date(sorted[i]);
          const diff = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
          if (diff === 1) {
            run++;
            if (run > longest) longest = run;
          } else {
            run = 1;
          }
        }
        setLongestStreak(longest);

        setCheckInsThisWeek(
          all.filter((e) => e.dateKey >= weekFrom && e.dateKey <= todayKey).length,
        );
      } else {
        // Real mode: stats table is the source of truth for streaks
        // On first boot (lastActiveDate === null) backfill from historical entries
        let stats = await getUserStats();
        if (stats.lastActiveDate === null) {
          await syncStreakFromHistory();
          stats = await getUserStats();
        }
        setCurrentStreak(stats.currentStreak);
        setLongestStreak(stats.longestStreak);

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
