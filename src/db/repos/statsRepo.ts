import { desc, eq } from 'drizzle-orm';

import { db } from '../client';
import { moodEntries, userStats } from '../schema';

export type UserStats = typeof userStats.$inferSelect;

const STATS_ID = 1;

const DEFAULT_STATS = {
  id: STATS_ID,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  availableFreezes: 0,
} satisfies UserStats;

// ─── Internal date helpers ────────────────────────────────────────────────────

function keyFromDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function shiftDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return keyFromDate(date);
}

function diffDays(earlier: string, later: string): number {
  const [ey, em, ed] = earlier.split('-').map(Number);
  const [ly, lm, ld] = later.split('-').map(Number);
  const a = new Date(ey, em - 1, ed);
  const b = new Date(ly, lm - 1, ld);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** True if the stored lastActiveDate is older than yesterday (streak has lapsed). */
function isStreakExpired(lastActiveDate: string | null): boolean {
  if (lastActiveDate === null) return false;
  const yesterdayKey = shiftDays(keyFromDate(new Date()), -1);
  return lastActiveDate < yesterdayKey;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the singleton stats row.
 * Uses an atomic insert-or-ignore so concurrent callers never race on the seed.
 * Returns currentStreak as 0 when the streak has lapsed (lastActiveDate before
 * yesterday) without writing to the DB — recordActivity will persist the reset
 * on the next check-in.
 */
export async function getUserStats(): Promise<UserStats> {
  // Atomic: insert defaults only if the row does not already exist
  await db.insert(userStats).values(DEFAULT_STATS).onConflictDoNothing();
  const [row] = await db.select().from(userStats).where(eq(userStats.id, STATS_ID)).limit(1);

  // Surface an expired streak as 0 without persisting it
  if (isStreakExpired(row.lastActiveDate)) {
    return { ...row, currentStreak: 0 };
  }
  return row;
}

/**
 * Records activity for the given device date string ('YYYY-MM-DD').
 * Handles streak increment, break detection, and longest-streak tracking.
 * Returns the updated stats.
 */
export async function recordActivity(deviceDateString: string): Promise<UserStats> {
  const stats = await getUserStats();

  // Already recorded for today — no-op
  if (stats.lastActiveDate === deviceDateString) return stats;

  let newStreak: number;

  if (stats.lastActiveDate === null) {
    // First ever activity
    newStreak = 1;
  } else {
    const diff = diffDays(stats.lastActiveDate, deviceDateString);
    if (diff === 1) {
      // Consecutive day — extend streak (use raw DB value, not the possibly-zeroed one)
      const [dbRow] = await db.select().from(userStats).where(eq(userStats.id, STATS_ID)).limit(1);
      newStreak = dbRow.currentStreak + 1;
    } else {
      // Gap of 2+ days — streak broken
      newStreak = 1;
    }
  }

  const newLongest = Math.max(newStreak, stats.longestStreak);

  await db
    .update(userStats)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: deviceDateString,
    })
    .where(eq(userStats.id, STATS_ID));

  return {
    ...stats,
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: deviceDateString,
  };
}

/**
 * One-time backfill: calculates currentStreak and longestStreak from the
 * user's historical mood_entries and writes them into user_stats.
 *
 * Guards against overwriting live recordActivity data: exits early if the
 * singleton row already has a non-null lastActiveDate.
 */
export async function syncStreakFromHistory(): Promise<void> {
  // Guard: do not overwrite a row that recordActivity has already seeded
  await db.insert(userStats).values(DEFAULT_STATS).onConflictDoNothing();
  const [existing] = await db.select().from(userStats).where(eq(userStats.id, STATS_ID)).limit(1);
  if (existing.lastActiveDate !== null) return;

  // Query all distinct dateKeys, newest first
  const rows = await db
    .selectDistinct({ dateKey: moodEntries.dateKey })
    .from(moodEntries)
    .orderBy(desc(moodEntries.dateKey));

  if (rows.length === 0) return;

  const daySet = new Set(rows.map((r) => r.dateKey));
  const sortedDesc = rows.map((r) => r.dateKey);
  const lastActiveDate = sortedDesc[0];

  // ── Current streak ──────────────────────────────────────────────────────────
  const todayKey = keyFromDate(new Date());
  const yesterdayKey = shiftDays(todayKey, -1);

  let startKey: string | null = null;
  if (daySet.has(todayKey)) startKey = todayKey;
  else if (daySet.has(yesterdayKey)) startKey = yesterdayKey;

  let currentStreak = 0;
  if (startKey !== null) {
    let cursor = startKey;
    while (daySet.has(cursor)) {
      currentStreak++;
      cursor = shiftDays(cursor, -1);
    }
  }

  // ── Longest streak ──────────────────────────────────────────────────────────
  const sortedAsc = [...sortedDesc].reverse();
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < sortedAsc.length; i++) {
    if (diffDays(sortedAsc[i - 1], sortedAsc[i]) === 1) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 1;
    }
  }

  await db
    .update(userStats)
    .set({ currentStreak, longestStreak, lastActiveDate })
    .where(eq(userStats.id, STATS_ID));
}
