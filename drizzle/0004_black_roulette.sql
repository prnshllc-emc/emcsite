CREATE TABLE `email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` varchar(500),
	`subject` varchar(500) NOT NULL,
	`body_html` text NOT NULL,
	`body_text` text,
	`whatsapp_message` text,
	`category` enum('stage_change','tracking','onboarding','system','marketing') NOT NULL DEFAULT 'stage_change',
	`available_variables` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`is_default` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` int,
	CONSTRAINT `email_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_templates_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE INDEX `idx_et_category` ON `email_templates` (`category`);--> statement-breakpoint
CREATE INDEX `idx_et_active` ON `email_templates` (`is_active`);