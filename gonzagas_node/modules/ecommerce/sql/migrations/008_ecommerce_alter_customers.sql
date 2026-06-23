-- Extend existing customers table for e-commerce accounts (one ALTER per statement)

ALTER TABLE `customers` ADD COLUMN `password_hash` varchar(255) DEFAULT NULL AFTER `email`;

ALTER TABLE `customers` ADD COLUMN `first_name` varchar(100) DEFAULT NULL AFTER `password_hash`;

ALTER TABLE `customers` ADD COLUMN `last_name` varchar(100) DEFAULT NULL AFTER `first_name`;

ALTER TABLE `customers` ADD COLUMN `billing_address_line1` varchar(255) DEFAULT NULL AFTER `phone`;

ALTER TABLE `customers` ADD COLUMN `billing_city` varchar(100) DEFAULT NULL AFTER `billing_address_line1`;

ALTER TABLE `customers` ADD COLUMN `billing_postal_code` varchar(20) DEFAULT NULL AFTER `billing_city`;

ALTER TABLE `customers` ADD COLUMN `billing_country` varchar(100) DEFAULT 'Portugal' AFTER `billing_postal_code`;

ALTER TABLE `customers` ADD COLUMN `shipping_address_line1` varchar(255) DEFAULT NULL AFTER `billing_country`;

ALTER TABLE `customers` ADD COLUMN `shipping_city` varchar(100) DEFAULT NULL AFTER `shipping_address_line1`;

ALTER TABLE `customers` ADD COLUMN `shipping_postal_code` varchar(20) DEFAULT NULL AFTER `shipping_city`;

ALTER TABLE `customers` ADD COLUMN `shipping_country` varchar(100) DEFAULT 'Portugal' AFTER `shipping_postal_code`;

ALTER TABLE `customers` ADD COLUMN `is_active` tinyint(1) NOT NULL DEFAULT 1 AFTER `shipping_country`;
