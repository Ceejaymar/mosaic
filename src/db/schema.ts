import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const moodEntries = sqliteTable('mood_entries', {
  id: text('id').primaryKey(),
  dateKey: text('date_key').notNull(),
  primaryMood: text('primary_mood').notNull(),
  note: text('note'),
  occurredAt: text('occurred_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
