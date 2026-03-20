import { between, count, desc, eq } from 'drizzle-orm';
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

export async function updateMoodEntry(
  id: string,
  updates: Partial<Omit<NewMoodEntry, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const rows = await db
    .update(moodEntries)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(eq(moodEntries.id, id))
    .returning({ id: moodEntries.id });
  if (rows.length === 0) throw new Error(`updateMoodEntry: no entry found with id ${id}`);
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

/**
 * Fetches all mood entries for a given month.
 * @param year  Full year (e.g. 2025)
 * @param month 0-indexed month, matching JavaScript's Date convention (0 = January)
 */
export async function fetchMoodEntriesForMonth(year: number, month: number): Promise<MoodEntry[]> {
  const mm = String(month + 1).padStart(2, '0');
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dd = String(lastDay).padStart(2, '0');
  return db
    .select()
    .from(moodEntries)
    .where(between(moodEntries.dateKey, `${year}-${mm}-01`, `${year}-${mm}-${dd}`))
    .orderBy(moodEntries.occurredAt);
}

export async function fetchRecentMoodEntries(limit = 100): Promise<MoodEntry[]> {
  return db.select().from(moodEntries).orderBy(desc(moodEntries.occurredAt)).limit(limit);
}

export async function fetchMoodEntriesPage(offset: number, limit: number): Promise<MoodEntry[]> {
  return db
    .select()
    .from(moodEntries)
    .orderBy(desc(moodEntries.occurredAt))
    .limit(limit)
    .offset(offset);
}

export async function fetchMoodEntryById(id: string): Promise<MoodEntry | null> {
  const rows = await db.select().from(moodEntries).where(eq(moodEntries.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deleteMoodEntry(id: string): Promise<void> {
  const rows = await db
    .delete(moodEntries)
    .where(eq(moodEntries.id, id))
    .returning({ id: moodEntries.id });
  if (rows.length === 0) throw new Error(`deleteMoodEntry: no entry found with id ${id}`);
}

export async function clearAllMoodEntries(): Promise<void> {
  await db.delete(moodEntries);
}

/**
 * Returns the total number of mood entries within the given inclusive date range.
 */
export async function fetchCheckInCountForRange(from: string, to: string): Promise<number> {
  const rows = await db
    .select({ count: count() })
    .from(moodEntries)
    .where(between(moodEntries.dateKey, from, to));
  return rows[0]?.count ?? 0;
}

/**
 * Returns the distinct dateKeys (YYYY-MM-DD) that have at least one entry,
 * within the given inclusive date range.
 */
export async function fetchDistinctCheckedInDays(from: string, to: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ dateKey: moodEntries.dateKey })
    .from(moodEntries)
    .where(between(moodEntries.dateKey, from, to));
  return rows.map((r) => r.dateKey);
}
