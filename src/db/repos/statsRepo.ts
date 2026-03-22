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

/** Returns the singleton stats row, inserting defaults if it doesn't exist yet. */
export async function getUserStats(): Promise<UserStats> {
  const rows = await db.select().from(userStats).where(eq(userStats.id, STATS_ID)).limit(1);
  if (rows.length > 0) return rows[0];

  await db.insert(userStats).values(DEFAULT_STATS);
  return { ...DEFAULT_STATS };
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
    const [ly, lm, ld] = stats.lastActiveDate.split('-').map(Number);
    const [cy, cm, cd] = deviceDateString.split('-').map(Number);
    const last = new Date(ly, lm - 1, ld);
    const current = new Date(cy, cm - 1, cd);
    const diffMs = current.getTime() - last.getTime();
    const diffDays = Math.round(diffMs / 86_400_000);

    if (diffDays === 1) {
      // Consecutive day — extend streak
      newStreak = stats.currentStreak + 1;
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

// ─── Internal date helpers (no date-fns dep in this repo file) ────────────────

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

/**
 * One-time backfill: calculates currentStreak and longestStreak from the
 * user's historical mood_entries and writes them into user_stats.
 *
 * Safe to call repeatedly — it is idempotent and exits early when
 * lastActiveDate is already set (meaning the table was already seeded).
 */
export async function syncStreakFromHistory(): Promise<void> {
  // Query all distinct dateKeys, newest first
  const rows = await db
    .selectDistinct({ dateKey: moodEntries.dateKey })
    .from(moodEntries)
    .orderBy(desc(moodEntries.dateKey));

  if (rows.length === 0) return;

  const daySet = new Set(rows.map((r) => r.dateKey));
  const sortedDesc = rows.map((r) => r.dateKey); // already DESC
  const lastActiveDate = sortedDesc[0]; // most recent entry

  // ── Current streak ──────────────────────────────────────────────────────────
  // Allow streak to originate from today or yesterday so users who haven't
  // checked in yet today don't lose their streak on first boot.
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

  // ── Upsert ──────────────────────────────────────────────────────────────────
  await getUserStats(); // ensures the singleton row exists before we update
  await db
    .update(userStats)
    .set({ currentStreak, longestStreak, lastActiveDate })
    .where(eq(userStats.id, STATS_ID));
}
