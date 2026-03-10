import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  dateToKey,
  fetchCheckInCountForRange,
  fetchDistinctCheckedInDays,
} from '@/src/db/repos/moodRepo';
import { getAllDemoEntries } from '@/src/features/demo/generateDemoData';
import { useAppStore } from '@/src/store/useApp';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Walks backwards from today counting consecutive days that appear in the set.
 * Uses local date arithmetic to respect the device timezone.
 */
function computeStreak(days: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  while (days.has(dateToKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Returns the Monday of the current ISO week in local time. */
function getWeekStart(): Date {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Mon=0 … Sun=6
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  return monday;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStats() {
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [checkInsThisWeek, setCheckInsThisWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const weekFrom = dateToKey(getWeekStart());
      const todayKey = dateToKey(today);

      if (isDemoMode) {
        const all = getAllDemoEntries();
        const checkedInDays = new Set(all.map((e) => e.dateKey));
        setCurrentStreak(computeStreak(checkedInDays));
        setCheckInsThisWeek(
          all.filter((e) => e.dateKey >= weekFrom && e.dateKey <= todayKey).length,
        );
      } else {
        const streakFrom = dateToKey(
          new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365),
        );
        const [keys, weekCount] = await Promise.all([
          fetchDistinctCheckedInDays(streakFrom, todayKey),
          fetchCheckInCountForRange(weekFrom, todayKey),
        ]);
        setCurrentStreak(computeStreak(new Set(keys)));
        setCheckInsThisWeek(weekCount);
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

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

  return { currentStreak, checkInsThisWeek, isLoading };
}
