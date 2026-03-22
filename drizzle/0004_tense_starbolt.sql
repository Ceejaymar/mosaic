PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`last_active_date` text,
	`available_freezes` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_stats_singleton" CHECK("__new_user_stats"."id" = 1)
);
--> statement-breakpoint
INSERT INTO `__new_user_stats`("id", "current_streak", "longest_streak", "last_active_date", "available_freezes") SELECT "id", "current_streak", "longest_streak", "last_active_date", "available_freezes" FROM `user_stats`;--> statement-breakpoint
DROP TABLE `user_stats`;--> statement-breakpoint
ALTER TABLE `__new_user_stats` RENAME TO `user_stats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;