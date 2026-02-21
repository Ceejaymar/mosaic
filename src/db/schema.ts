import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
