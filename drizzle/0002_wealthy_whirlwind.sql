CREATE TABLE `salesHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`orderNumber` varchar(64) NOT NULL,
	`photoCount` int NOT NULL,
	`format10x15` int NOT NULL DEFAULT 0,
	`format15x21` int NOT NULL DEFAULT 0,
	`price10x15` int NOT NULL DEFAULT 590,
	`price15x21` int NOT NULL DEFAULT 890,
	`totalPrice` int NOT NULL,
	`status` enum('pending','paid','printed','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`paidAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `salesHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(128) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`type` enum('number','string','boolean','json') NOT NULL DEFAULT 'string',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);
