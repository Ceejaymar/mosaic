import { useCallback, useEffect, useState } from 'react';
import {
  dateToKey,
  fetchMoodEntriesForDate,
  insertMoodEntry,
  type MoodEntry,
  type NewMoodEntry,
} from '@/src/db/repos/moodRepo';
import { uuid } from '@/src/lib/uuid';
import { triggerSpringLayoutAnimation } from '@/src/utils/animations';

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

  useEffect(() => {
    loadTodayEntries();
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

    // Optimistic update — cast is safe because all required fields are set
    setTodayEntries((prev) => [newEntry as MoodEntry, ...prev]);

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
