CREATE TABLE `mood_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`primary_mood` text NOT NULL,
	`note` text,
	`occurred_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
