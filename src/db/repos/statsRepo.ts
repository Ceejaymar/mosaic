import { desc, eq } from 'drizzle-orm';

import { db } from '../client';
import { monthlyStats, moodEntries, userStats } from '../schema';

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

export type MonthlyStats = typeof monthlyStats.$inferSelect;

/**
 * Returns the monthly_stats row for the given 'YYYY-MM' key,
 * or a zero-initialized default if no row exists yet.
 */
export async function getMonthlyStats(monthKey: string): Promise<MonthlyStats> {
  const [row] = await db
    .select()
    .from(monthlyStats)
    .where(eq(monthlyStats.monthKey, monthKey))
    .limit(1);
  return row ?? { monthKey, longestStreak: 0 };
}

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

  // Derive the 'YYYY-MM' key and cap the streak to days elapsed in the month
  const monthKey = deviceDateString.slice(0, 7);
  const dayOfMonth = Number(deviceDateString.slice(8, 10));
  const streakForMonth = Math.min(newStreak, dayOfMonth);
  const { longestStreak: monthBest } = await getMonthlyStats(monthKey);

  await db.transaction(async (tx) => {
    await tx
      .update(userStats)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActiveDate: deviceDateString,
      })
      .where(eq(userStats.id, STATS_ID));
    await tx
      .insert(monthlyStats)
      .values({ monthKey, longestStreak: Math.max(monthBest, streakForMonth) })
      .onConflictDoUpdate({
        target: monthlyStats.monthKey,
        set: { longestStreak: Math.max(monthBest, streakForMonth) },
      });
  });

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

  // ── Per-month longest streak backfill ────────────────────────────────────────
  // Single pass over sortedAsc: maintain a running consecutive-day counter and
  // credit each day's run to its month, capped to the day-of-month so cross-
  // month runs don't inflate the month's tally.
  const monthBestMap = new Map<string, number>();

  if (sortedAsc.length > 0) {
    const first = sortedAsc[0];
    monthBestMap.set(first.slice(0, 7), 1);
  }

  let runLen = 1;
  for (let i = 1; i < sortedAsc.length; i++) {
    if (diffDays(sortedAsc[i - 1], sortedAsc[i]) === 1) {
      runLen++;
    } else {
      runLen = 1;
    }
    const dateKey = sortedAsc[i];
    const mk = dateKey.slice(0, 7);
    const dayOfMonth = Number(dateKey.slice(8, 10));
    const capped = Math.min(runLen, dayOfMonth);
    monthBestMap.set(mk, Math.max(monthBestMap.get(mk) ?? 0, capped));
  }

  const monthUpdates = Array.from(monthBestMap.entries()).map(([monthKey, longestStreak]) => ({
    monthKey,
    longestStreak,
  }));

  if (monthUpdates.length > 0) {
    await Promise.all(
      monthUpdates.map(({ monthKey: mk, longestStreak: ls }) =>
        db
          .insert(monthlyStats)
          .values({ monthKey: mk, longestStreak: ls })
          .onConflictDoUpdate({
            target: monthlyStats.monthKey,
            set: { longestStreak: ls },
          }),
      ),
    );
  }

  // Mark sync complete only after all monthly backfill writes succeed
  await db
    .update(userStats)
    .set({ currentStreak, longestStreak, lastActiveDate })
    .where(eq(userStats.id, STATS_ID));
}
