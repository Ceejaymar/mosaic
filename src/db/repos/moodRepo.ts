import { desc, eq } from 'drizzle-orm';
import { uuid } from '@/src/lib/uuid';
import { db } from '../client';
import { moodEntries } from '../schema';

export type MoodEntry = typeof moodEntries.$inferSelect;
export type NewMoodEntry = typeof moodEntries.$inferInsert;
export function dateToKey(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function insertMoodEntry(entry: NewMoodEntry): Promise<string> {
  await db.insert(moodEntries).values(entry);
  return entry.id;
}

export async function insertTestMoodEntry(overrides?: Partial<NewMoodEntry>) {
  const now = new Date().toISOString();

  const entry: NewMoodEntry = {
    id: uuid(),
    dateKey: dateToKey(new Date(now)),
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
