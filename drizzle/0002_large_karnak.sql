ALTER TABLE `newsletter_subscribers` ADD `utm_source` varchar(256);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `utm_medium` varchar(256);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `utm_campaign` varchar(256);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `utm_content` varchar(256);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `utm_term` varchar(256);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `referrer` varchar(512);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `landing_page` varchar(512);--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `hubspot_synced_at` timestamp;--> statement-breakpoint
ALTER TABLE `newsletter_subscribers` ADD `hubspot_contact_id` varchar(64);