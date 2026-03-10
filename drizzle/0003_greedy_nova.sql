CREATE TABLE `audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`action` varchar(50) NOT NULL,
	`entity` varchar(50) NOT NULL,
	`entity_id` int NOT NULL,
	`changes` text,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bills_of_lading` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bl_number` varchar(50) NOT NULL,
	`vehicle_id` int,
	`customer_id` int,
	`container_number` varchar(20),
	`vehicle_description` varchar(255),
	`origin_port` varchar(100),
	`destination_port` varchar(100),
	`status` enum('draft','final','in_transit','arrived','customs','delivered') NOT NULL DEFAULT 'draft',
	`tracking_active` boolean NOT NULL DEFAULT false,
	`tracking_started_at` timestamp,
	`tracking_ended_at` timestamp,
	`tracking_end_reason` varchar(50),
	`estimated_departure` timestamp,
	`actual_departure` timestamp,
	`estimated_arrival` timestamp,
	`actual_arrival` timestamp,
	`bl_type` enum('draft','final') DEFAULT 'draft',
	`bl_draft_received_at` timestamp,
	`bl_final_received_at` timestamp,
	`source_email` varchar(320),
	`raw_bl_data` text,
	`last_reconciliation_attempt` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `bills_of_lading_id` PRIMARY KEY(`id`),
	CONSTRAINT `bills_of_lading_bl_number_unique` UNIQUE(`bl_number`)
);
--> statement-breakpoint
CREATE TABLE `clicksign_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`document_key` varchar(100) NOT NULL,
	`customer_id` int,
	`vehicle_id` int,
	`status` enum('pending','signed','processed','error') NOT NULL DEFAULT 'pending',
	`raw_payload` text,
	`processed_at` timestamp,
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clicksign_contracts_id` PRIMARY KEY(`id`),
	CONSTRAINT `clicksign_contracts_document_key_unique` UNIQUE(`document_key`)
);
--> statement-breakpoint
CREATE TABLE `client_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invite_id` int NOT NULL,
	`document_type` enum('identity_document','proof_of_address','vehicle_title','vehicle_registration','photo_front','photo_front_diagonal_driver','photo_side_driver','photo_rear_diagonal_driver','photo_rear','photo_rear_diagonal_passenger','photo_side_passenger','photo_front_diagonal_passenger','photo_engine','photo_engine_number','photo_chassis_number','photo_interior_front','photo_dashboard','photo_interior_rear','photo_trunk') NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` varchar(1000) NOT NULL,
	`file_size` int NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`is_valid` boolean NOT NULL DEFAULT true,
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`status` enum('pending','in_progress','completed','contract_sent','contract_signed','expired') NOT NULL DEFAULT 'pending',
	`progress` int NOT NULL DEFAULT 0,
	`client_data` text,
	`vehicle_data` text,
	`customer_id` int,
	`vehicle_id` int,
	`clicksign_document_key` varchar(100),
	`last_accessed_at` timestamp,
	`expires_at` timestamp NOT NULL,
	`invited_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `client_invites_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cpf` varchar(255) NOT NULL,
	`cpf_hash` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(500),
	`phone` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_cpf_hash_unique` UNIQUE(`cpf_hash`)
);
--> statement-breakpoint
CREATE TABLE `processed_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message_id` varchar(255) NOT NULL,
	`subject` varchar(500),
	`sender` varchar(320),
	`received_at` timestamp,
	`bl_extracted` boolean NOT NULL DEFAULT false,
	`bl_id` int,
	`processing_status` enum('pending','processing','processed','error','ignored') NOT NULL DEFAULT 'pending',
	`retry_count` int NOT NULL DEFAULT 0,
	`last_retry_at` timestamp,
	`raw_payload` text,
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processed_emails_id` PRIMARY KEY(`id`),
	CONSTRAINT `processed_emails_message_id_unique` UNIQUE(`message_id`)
);
--> statement-breakpoint
CREATE TABLE `system_config` (
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` varchar(255),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` int,
	CONSTRAINT `system_config_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `tracking_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`bl_id` int NOT NULL,
	`customer_id` int NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`expires_at` timestamp NOT NULL,
	`used_count` int NOT NULL DEFAULT 0,
	`last_used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `tracking_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `tracking_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `tracking_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bl_id` int NOT NULL,
	`status` varchar(100) NOT NULL,
	`location` varchar(255),
	`description` text,
	`event_date` timestamp NOT NULL,
	`raw_data` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracking_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vin` varchar(17) NOT NULL,
	`customer_id` int,
	`make` varchar(50),
	`model` varchar(100),
	`year` int,
	`color` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`last_reconciliation_attempt` timestamp,
	`deleted_at` timestamp,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_vin_unique` UNIQUE(`vin`)
);
--> statement-breakpoint
CREATE INDEX `idx_audit_entity` ON `audit_log` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_user` ON `audit_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_date` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_bl_customer` ON `bills_of_lading` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_bl_status` ON `bills_of_lading` (`status`);--> statement-breakpoint
CREATE INDEX `idx_bl_tracking` ON `bills_of_lading` (`tracking_active`);--> statement-breakpoint
CREATE INDEX `idx_bl_vehicle` ON `bills_of_lading` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `idx_bl_deleted` ON `bills_of_lading` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_bl_reconciliation` ON `bills_of_lading` (`last_reconciliation_attempt`);--> statement-breakpoint
CREATE INDEX `idx_cs_status` ON `clicksign_contracts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_cs_created` ON `clicksign_contracts` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_doc_invite` ON `client_documents` (`invite_id`);--> statement-breakpoint
CREATE INDEX `idx_invite_status` ON `client_invites` (`status`);--> statement-breakpoint
CREATE INDEX `idx_invite_email` ON `client_invites` (`email`);--> statement-breakpoint
CREATE INDEX `idx_customer_deleted` ON `customers` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_pe_status` ON `processed_emails` (`processing_status`);--> statement-breakpoint
CREATE INDEX `idx_pe_retry` ON `processed_emails` (`processing_status`,`retry_count`);--> statement-breakpoint
CREATE INDEX `idx_tc_bl` ON `tracking_codes` (`bl_id`);--> statement-breakpoint
CREATE INDEX `idx_tc_customer` ON `tracking_codes` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_tc_active` ON `tracking_codes` (`is_active`);--> statement-breakpoint
CREATE INDEX `idx_th_bl` ON `tracking_history` (`bl_id`);--> statement-breakpoint
CREATE INDEX `idx_th_bl_date` ON `tracking_history` (`bl_id`,`event_date`);--> statement-breakpoint
CREATE INDEX `idx_vehicle_customer` ON `vehicles` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_vehicle_deleted` ON `vehicles` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_vehicle_reconciliation` ON `vehicles` (`last_reconciliation_attempt`);