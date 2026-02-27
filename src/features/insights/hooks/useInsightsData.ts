import { useEffect, useMemo, useState } from 'react';

import type { MoodEntry } from '@/src/db/repos/moodRepo';
import { fetchMoodEntriesForMonth, fetchRecentMoodEntries } from '@/src/db/repos/moodRepo';
import {
  ACTIVITY_TAGS,
  LOCATION_TAGS,
  PEOPLE_TAGS,
} from '@/src/features/check-in/data/context-tags';
import { parseStoredTags } from '@/src/features/check-in/utils/parse-tags';
import { getAllDemoEntries } from '@/src/features/demo/generateDemoData';
import { getMoodDisplayInfo } from '@/src/features/emotion-accordion/utils/mood-display';
import { useAppStore } from '@/src/store/useApp';

import type { InsightEntry, TimeFrame } from '../types';

// ─── Tag Sets for Categorization ─────────────────────────────────────────────

const ACTIVITY_SET = new Set<string>(ACTIVITY_TAGS);
const PEOPLE_SET = new Set<string>(PEOPLE_TAGS);
const LOCATION_SET = new Set<string>(LOCATION_TAGS);

// ─── Conversion: MoodEntry → InsightEntry ────────────────────────────────────

function getTimeOfDay(isoStr: string): InsightEntry['timeOfDay'] {
  const hour = new Date(isoStr).getHours();
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function moodEntryToInsight(entry: MoodEntry): InsightEntry {
  const color = getMoodDisplayInfo(entry.primaryMood)?.color ?? '#888888';
  const tags = parseStoredTags(entry.tags);

  const activities: string[] = [];
  const people: string[] = [];
  const places: string[] = [];

  for (const tag of tags) {
    if (ACTIVITY_SET.has(tag)) activities.push(tag);
    else if (PEOPLE_SET.has(tag)) people.push(tag);
    else if (LOCATION_SET.has(tag)) places.push(tag);
  }

  return {
    id: entry.id,
    date: entry.dateKey,
    emotions: [color],
    timeOfDay: getTimeOfDay(entry.occurredAt),
    activities,
    people,
    places,
  };
}

// ─── Date Range Helpers ──────────────────────────────────────────────────────

function getDateRange(timeFrame: TimeFrame, offset: number): { start: string; end: string } {
  const now = new Date();

  if (timeFrame === 'week') {
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay() + offset * 7,
    );
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + 6,
    );
    return { start: toKey(startDate), end: toKey(endDate) };
  }

  if (timeFrame === 'month') {
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0);
    return { start: toKey(target), end: toKey(lastDay) };
  }

  // year
  const targetYear = now.getFullYear() + offset;
  return { start: `${targetYear}-01-01`, end: `${targetYear}-12-31` };
}

function toKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Demo Mode: Filter from Pre-generated Data ──────────────────────────────

function getDemoInsights(timeFrame: TimeFrame, offset: number): InsightEntry[] {
  const { start, end } = getDateRange(timeFrame, offset);
  return getAllDemoEntries()
    .filter((e) => e.dateKey >= start && e.dateKey <= end)
    .map(moodEntryToInsight);
}

// ─── Real DB: Fetch Entries for Range ────────────────────────────────────────

async function fetchRealEntries(timeFrame: TimeFrame, offset: number): Promise<MoodEntry[]> {
  const now = new Date();

  if (timeFrame === 'week') {
    // Fetch the broader month(s) and filter to the week range
    const { start, end } = getDateRange(timeFrame, offset);
    const startDate = new Date(start);
    const endDate = new Date(end);

    const months = new Set<string>();
    months.add(`${startDate.getFullYear()}-${startDate.getMonth()}`);
    months.add(`${endDate.getFullYear()}-${endDate.getMonth()}`);

    const allEntries: MoodEntry[] = [];
    for (const key of months) {
      const [y, m] = key.split('-').map(Number);
      const entries = await fetchMoodEntriesForMonth(y, m);
      allEntries.push(...entries);
    }

    return allEntries.filter((e) => e.dateKey >= start && e.dateKey <= end);
  }

  if (timeFrame === 'month') {
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return fetchMoodEntriesForMonth(target.getFullYear(), target.getMonth());
  }

  // year — fetch recent entries (capped for performance)
  return fetchRecentMoodEntries(2000);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useInsightsData(timeFrame: TimeFrame, offset: number): InsightEntry[] {
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const [realEntries, setRealEntries] = useState<InsightEntry[]>([]);

  // Demo mode: synchronous, deterministic
  const demoEntries = useMemo(() => {
    if (!isDemoMode) return [];
    return getDemoInsights(timeFrame, offset);
  }, [isDemoMode, timeFrame, offset]);

  // Real mode: async DB fetch
  useEffect(() => {
    if (isDemoMode) return;

    let cancelled = false;
    fetchRealEntries(timeFrame, offset)
      .then((entries) => {
        if (cancelled) return;
        setRealEntries(entries.map(moodEntryToInsight));
      })
      .catch(() => {
        if (cancelled) return;
        setRealEntries([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isDemoMode, timeFrame, offset]);

  return isDemoMode ? demoEntries : realEntries;
}
