CREATE TABLE `marketing_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lead_id` int,
	`interaction_type` enum('newsletter_signup','calculator_open','calculator_submit','whatsapp_click','cta_click','page_view','tracking_lookup','knowledge_view') NOT NULL,
	`utm_source` varchar(256),
	`utm_medium` varchar(256),
	`utm_campaign` varchar(256),
	`utm_content` varchar(256),
	`page_url` varchar(512),
	`service_page` varchar(128),
	`metadata` json,
	`session_fingerprint` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketing_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(256),
	`phone` varchar(32),
	`source` enum('newsletter','calculadora','whatsapp_cta','contact_form','landing_page','other') NOT NULL DEFAULT 'newsletter',
	`lead_status` enum('new','engaged','qualified','converted','unsubscribed') NOT NULL DEFAULT 'new',
	`utm_source` varchar(256),
	`utm_medium` varchar(256),
	`utm_campaign` varchar(256),
	`utm_content` varchar(256),
	`utm_term` varchar(256),
	`referrer` varchar(512),
	`landing_page` varchar(512),
	`newsletter_active` boolean NOT NULL DEFAULT true,
	`unsubscribed_at` timestamp,
	`hubspot_synced_at` timestamp,
	`hubspot_contact_id` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`operational_customer_id` int,
	CONSTRAINT `marketing_leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketing_leads_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `idx_mktint_lead` ON `marketing_interactions` (`lead_id`);--> statement-breakpoint
CREATE INDEX `idx_mktint_type` ON `marketing_interactions` (`interaction_type`);--> statement-breakpoint
CREATE INDEX `idx_mktint_campaign` ON `marketing_interactions` (`utm_campaign`);--> statement-breakpoint
CREATE INDEX `idx_mktint_created` ON `marketing_interactions` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_mktint_session` ON `marketing_interactions` (`session_fingerprint`);--> statement-breakpoint
CREATE INDEX `idx_mktlead_source` ON `marketing_leads` (`source`);--> statement-breakpoint
CREATE INDEX `idx_mktlead_status` ON `marketing_leads` (`lead_status`);--> statement-breakpoint
CREATE INDEX `idx_mktlead_campaign` ON `marketing_leads` (`utm_campaign`);--> statement-breakpoint
CREATE INDEX `idx_mktlead_created` ON `marketing_leads` (`created_at`);