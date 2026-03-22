CREATE TABLE `user_stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_active_date` text,
	`available_freezes` integer DEFAULT 0 NOT NULL
);
