import { and, desc, eq } from 'drizzle-orm';
import { uuid } from '@/src/lib/uuid';
import { db } from '../client';
import { moodEntries } from '../schema';

export type MoodEntry = typeof moodEntries.$inferSelect;
export type NewMoodEntry = typeof moodEntries.$inferInsert;

function makeDateKey(iso: string) {
  return iso.slice(0, 10);
}

export async function insertTestMoodEntry(overrides?: Partial<NewMoodEntry>) {
  const now = new Date().toISOString();

  const entry: NewMoodEntry = {
    id: uuid(),
    dateKey: makeDateKey(now),
    primaryMood: 'happy',
    note: 'This is a test note',
    occurredAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };

  await db.insert(moodEntries).values(entry);

  return entry.id;
}

export async function fetchMoodEntriesForDate(dateKey: string, limit = 50) {
  return db
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.dateKey, dateKey))
    .orderBy(desc(moodEntries.occurredAt))
    .limit(limit);
}

export async function fetchRecentMoodEntries(limit = 100): Promise<MoodEntry[]> {
  return db.select().from(moodEntries).orderBy(desc(moodEntries.occurredAt)).limit(limit);
}

export async function deleteMoodEntry(id: string): Promise<void> {
  await db.delete(moodEntries).where(eq(moodEntries.id, id));
}

export async function clearAllMoodEntries(): Promise<void> {
  await db.delete(moodEntries);
}
