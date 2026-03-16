CREATE TABLE `whatsapp_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`direction` enum('outbound','inbound') NOT NULL DEFAULT 'outbound',
	`message_type` enum('template','text','image','document') NOT NULL DEFAULT 'template',
	`wa_message_id` varchar(255),
	`phone_number` varchar(32) NOT NULL,
	`template_name` varchar(255),
	`template_language` varchar(10),
	`body` text,
	`status` enum('pending','sent','delivered','read','failed') NOT NULL DEFAULT 'pending',
	`error_code` varchar(32),
	`error_message` text,
	`customer_id` int,
	`bl_id` int,
	`trigger_event` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`delivered_at` timestamp,
	`read_at` timestamp,
	CONSTRAINT `whatsapp_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_wamsg_phone` ON `whatsapp_messages` (`phone_number`);--> statement-breakpoint
CREATE INDEX `idx_wamsg_customer` ON `whatsapp_messages` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_wamsg_status` ON `whatsapp_messages` (`status`);--> statement-breakpoint
CREATE INDEX `idx_wamsg_wa_id` ON `whatsapp_messages` (`wa_message_id`);