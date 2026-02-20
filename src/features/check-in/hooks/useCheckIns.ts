import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  dateToKey,
  fetchMoodEntriesForDate,
  insertMoodEntry,
  type MoodEntry,
  type NewMoodEntry,
} from '@/src/db/repos/moodRepo';
import { uuid } from '@/src/lib/uuid';
import { triggerSpringLayoutAnimation } from '@/src/utils/animations';

/**
 * Constructs a full MoodEntry from a NewMoodEntry for optimistic UI updates.
 * All fields are explicitly mapped so schema additions surface as type errors.
 */
function buildMoodEntryFromNew(entry: NewMoodEntry): MoodEntry {
  const now = new Date().toISOString();
  return {
    id: entry.id ?? uuid(),
    dateKey: entry.dateKey ?? dateToKey(),
    primaryMood: entry.primaryMood ?? '',
    note: entry.note ?? null,
    occurredAt: entry.occurredAt ?? now,
    createdAt: entry.createdAt ?? now,
    updatedAt: entry.updatedAt ?? now,
  };
}

export function useTodayCheckIns() {
  const [todayEntries, setTodayEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const loadTodayEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const entries = await fetchMoodEntriesForDate(dateToKey());
      setTodayEntries(entries);
      setLoadError(null);
    } catch (error) {
      console.error("Failed to load today's entries", error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTodayEntries();
  }, [loadTodayEntries]);

  // Refresh when the app becomes active (handles midnight crossover)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        loadTodayEntries();
      }
    });
    return () => subscription.remove();
  }, [loadTodayEntries]);

  const saveEntry = useCallback(async (nodeId: string, note?: string) => {
    const now = new Date();
    const newEntry: NewMoodEntry = {
      id: uuid(),
      dateKey: dateToKey(now),
      primaryMood: nodeId,
      note: note ?? null,
      occurredAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    triggerSpringLayoutAnimation();

    // Optimistic update using explicit helper instead of a cast
    setTodayEntries((prev) => [buildMoodEntryFromNew(newEntry), ...prev]);

    try {
      await insertMoodEntry(newEntry);
    } catch (error) {
      console.error('Failed to persist mood entry', error);
      setTodayEntries((prev) => prev.filter((e) => e.id !== newEntry.id));
      // TODO: surface an error toast/snackbar
    }
  }, []);

  return { todayEntries, isLoading, loadError, saveEntry, refresh: loadTodayEntries };
}
