ALTER TABLE `mood_entries` ADD `tags` text;--> statement-breakpoint
CREATE INDEX `mood_entries_date_key_idx` ON `mood_entries` (`date_key`);