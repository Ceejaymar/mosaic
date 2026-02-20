import { useCallback, useEffect, useState } from 'react';
import {
  dateToKey,
  fetchMoodEntriesForDate,
  insertMoodEntry,
  type MoodEntry,
} from '@/src/db/repos/moodRepo';
import { uuid } from '@/src/lib/uuid';
import { triggerSpringLayoutAnimation } from '@/src/utils/animations';

export function useTodayCheckIns() {
  const [todayEntries, setTodayEntries] = useState<MoodEntry[]>([]);

  const loadTodayEntries = useCallback(async () => {
    try {
      const entries = await fetchMoodEntriesForDate(dateToKey());
      setTodayEntries(entries);
    } catch (error) {
      console.error("Failed to load today's entries", error);
    }
  }, []);

  useEffect(() => {
    loadTodayEntries();
  }, [loadTodayEntries]);

  const saveEntry = useCallback(async (nodeId: string, note?: string) => {
    const now = new Date();
    const newEntry: MoodEntry = {
      id: uuid(),
      dateKey: dateToKey(now),
      primaryMood: nodeId,
      note: note ?? null,
      occurredAt: now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    triggerSpringLayoutAnimation();

    // Optimistic update
    setTodayEntries((prev) => [newEntry, ...prev]);

    try {
      await insertMoodEntry(newEntry);
    } catch (error) {
      console.error('Failed to persist mood entry', error);
      setTodayEntries((prev) => prev.filter((e) => e.id !== newEntry.id));
      // TODO: surface an error toast/snackbar
    }
  }, []);

  return { todayEntries, saveEntry, refresh: loadTodayEntries };
}
