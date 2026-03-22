import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey(), // singleton row, always id = 1
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActiveDate: text('last_active_date'), // 'YYYY-MM-DD', nullable
  availableFreezes: integer('available_freezes').notNull().default(0),
});

export const moodEntries = sqliteTable(
  'mood_entries',
  {
    id: text('id').primaryKey(),
    dateKey: text('date_key').notNull(),
    primaryMood: text('primary_mood').notNull(),
    note: text('note'),
    tags: text('tags'), // JSON-serialised string[] of selected context tags
    occurredAt: text('occurred_at').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('mood_entries_date_key_idx').on(table.dateKey)],
);
