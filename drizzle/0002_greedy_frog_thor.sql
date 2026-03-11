CREATE TABLE `cms_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(256) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`content` text,
	`category_id` int,
	`meta_title` varchar(120),
	`meta_description` varchar(320),
	`meta_keywords` varchar(500),
	`canonical_url` varchar(500),
	`og_image` varchar(1000),
	`author` varchar(255) DEFAULT 'Enviando Meu Carro',
	`read_time` varchar(20),
	`tags` text,
	`featured_image` varchar(1000),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`published_at` timestamp,
	`schema_type` varchar(50) DEFAULT 'Article',
	`schema_data` text,
	`view_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `cms_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `cms_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`label` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`color` varchar(50),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cms_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `cms_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `cms_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` varchar(1000) NOT NULL,
	`file_key` varchar(500) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`file_size` int NOT NULL,
	`alt_text` varchar(500),
	`caption` varchar(500),
	`width` int,
	`height` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cms_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cms_navigation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location` enum('header','footer_services','footer_routes','footer_quick') NOT NULL,
	`label` varchar(128) NOT NULL,
	`href` varchar(500) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`parent_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cms_navigation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_cms_art_category` ON `cms_articles` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_cms_art_status` ON `cms_articles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_cms_art_published` ON `cms_articles` (`published_at`);--> statement-breakpoint
CREATE INDEX `idx_cms_art_deleted` ON `cms_articles` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_cms_cat_active` ON `cms_categories` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_cms_cat_sort` ON `cms_categories` (`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_cms_media_mime` ON `cms_media` (`mime_type`);--> statement-breakpoint
CREATE INDEX `idx_cms_nav_location` ON `cms_navigation` (`location`);--> statement-breakpoint
CREATE INDEX `idx_cms_nav_sort` ON `cms_navigation` (`sort_order`);