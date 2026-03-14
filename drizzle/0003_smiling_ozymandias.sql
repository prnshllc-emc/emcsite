ALTER TABLE `customers` ADD `cnpj` varchar(255);--> statement-breakpoint
ALTER TABLE `customers` ADD `cnpj_hash` varchar(64);--> statement-breakpoint
ALTER TABLE `customers` ADD `document_type` enum('cpf','cnpj') DEFAULT 'cpf' NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD CONSTRAINT `customers_cnpj_hash_unique` UNIQUE(`cnpj_hash`);