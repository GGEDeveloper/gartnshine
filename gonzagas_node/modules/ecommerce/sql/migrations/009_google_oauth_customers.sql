-- Add Google OAuth fields to customers table (one ALTER per statement)

ALTER TABLE `customers` ADD COLUMN `google_id` varchar(100) DEFAULT NULL AFTER `password_hash`;

ALTER TABLE `customers` ADD COLUMN `auth_provider` enum('local','google','both') DEFAULT 'local' AFTER `google_id`;

ALTER TABLE `customers` ADD COLUMN `avatar_url` varchar(500) DEFAULT NULL AFTER `auth_provider`;

ALTER TABLE `customers` ADD UNIQUE KEY `uk_customers_google_id` (`google_id`);
