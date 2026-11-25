CREATE TABLE `blog_post` (
	`id` varchar(36) PRIMARY KEY,
	`slug` varchar(160) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` varchar(320) NOT NULL,
	`body` longtext NOT NULL,
	`category` varchar(64) NOT NULL,
	`tags` json NOT NULL,
	`cover` varchar(16) NOT NULL DEFAULT 'rings',
	`cover_image` text,
	`draft` boolean NOT NULL DEFAULT false,
	`published_at` datetime(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `slug_unique` UNIQUE INDEX(`slug`)
);
--> statement-breakpoint
CREATE TABLE `mcp_token` (
	`id` varchar(36) PRIMARY KEY,
	`name` varchar(100) NOT NULL,
	`prefix` varchar(16) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`last_used_at` timestamp(3),
	`revoked_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `token_hash_unique` UNIQUE INDEX(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `resource` (
	`id` varchar(36) PRIMARY KEY,
	`slug` varchar(160) NOT NULL,
	`title` varchar(200) NOT NULL,
	`summary` varchar(320) NOT NULL,
	`body` longtext NOT NULL,
	`type` varchar(24) NOT NULL,
	`url` text,
	`category` varchar(64) NOT NULL,
	`featured` boolean NOT NULL DEFAULT false,
	`draft` boolean NOT NULL DEFAULT false,
	`published_at` datetime(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `slug_unique` UNIQUE INDEX(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_content` (
	`section` varchar(64) PRIMARY KEY,
	`data` json NOT NULL,
	`updated_by` varchar(255),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now())
);
--> statement-breakpoint
ALTER TABLE `session` ADD `impersonated_by` text;--> statement-breakpoint
ALTER TABLE `user` ADD `role` text;--> statement-breakpoint
ALTER TABLE `user` ADD `banned` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_reason` text;--> statement-breakpoint
ALTER TABLE `user` ADD `ban_expires` timestamp(3);--> statement-breakpoint
CREATE INDEX `blog_post_published_idx` ON `blog_post` (`draft`,`published_at`);--> statement-breakpoint
CREATE INDEX `mcp_token_user_idx` ON `mcp_token` (`user_id`);--> statement-breakpoint
CREATE INDEX `resource_published_idx` ON `resource` (`draft`,`published_at`);--> statement-breakpoint
ALTER TABLE `mcp_token` ADD CONSTRAINT `mcp_token_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;