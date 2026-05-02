-- Digital Legacy Vault Database Migration
-- Execute this SQL in the Management UI Database panel to create all required tables

CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(255),
	`resourceId` int,
	`details` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `checkIns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`checkedInAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checkIns_id` PRIMARY KEY(`id`)
);

CREATE TABLE `deathVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`executorId` int NOT NULL,
	`certificateUrl` text NOT NULL,
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`verifiedAt` timestamp,
	`verifiedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deathVerifications_id` PRIMARY KEY(`id`)
);

CREATE TABLE `digitalAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('crypto','social_media','domain','password','business_login','personal_message') NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`encryptedData` longtext NOT NULL,
	`encryptionIv` varchar(32) NOT NULL,
	`executorEncryptedKey` longtext,
	`isAccessible` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `digitalAssets_id` PRIMARY KEY(`id`)
);

CREATE TABLE `encryptionKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`encryptedMasterKey` longtext NOT NULL,
	`keyDerivationSalt` varchar(64) NOT NULL,
	`keyDerivationIterations` int NOT NULL DEFAULT 100000,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `encryptionKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `encryptionKeys_userId_unique` UNIQUE(`userId`)
);

CREATE TABLE `executorDesignations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`executorId` int NOT NULL,
	`status` enum('pending','accepted','rejected','revoked') NOT NULL DEFAULT 'pending',
	`invitationToken` varchar(128),
	`invitationExpiresAt` timestamp,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `executorDesignations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `executorNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`executorId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('missed_checkin','death_verified','asset_available') NOT NULL,
	`message` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `executorNotifications_id` PRIMARY KEY(`id`)
);

ALTER TABLE `users` MODIFY COLUMN `role` enum('user','executor','admin') NOT NULL DEFAULT 'user';
