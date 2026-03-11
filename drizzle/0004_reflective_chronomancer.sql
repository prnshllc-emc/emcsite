CREATE TABLE `bl_vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bl_id` int NOT NULL,
	`vehicle_id` int NOT NULL,
	`customer_id` int,
	`position` int,
	`notes` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bl_vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_blv_bl_vehicle` UNIQUE(`bl_id`,`vehicle_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_blv_bl` ON `bl_vehicles` (`bl_id`);--> statement-breakpoint
CREATE INDEX `idx_blv_vehicle` ON `bl_vehicles` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `idx_blv_customer` ON `bl_vehicles` (`customer_id`);