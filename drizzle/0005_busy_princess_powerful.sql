CREATE TABLE `monthly_stats` (
	`month_key` text PRIMARY KEY NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL
);
