ALTER TABLE `tracking_codes` MODIFY COLUMN `is_active` boolean NOT NULL DEFAULT false;--> statement-breakpoint
ALTER TABLE `tracking_codes` ADD `approval_status` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `tracking_codes` ADD `approved_at` timestamp;--> statement-breakpoint
ALTER TABLE `tracking_codes` ADD `approved_by` int;--> statement-breakpoint
ALTER TABLE `tracking_codes` ADD `rejected_at` timestamp;--> statement-breakpoint
ALTER TABLE `tracking_codes` ADD `rejection_reason` varchar(500);--> statement-breakpoint
ALTER TABLE `tracking_codes` ADD `auto_generated` boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_tc_approval` ON `tracking_codes` (`approval_status`);