-- Extend existing orders table (one ALTER per statement; comments on their own line only)

ALTER TABLE `orders` ADD COLUMN `customer_country` varchar(100) DEFAULT 'Portugal' AFTER `customer_postal_code`;

ALTER TABLE `orders` ADD COLUMN `billing_address_line1` varchar(255) DEFAULT NULL AFTER `customer_country`;

ALTER TABLE `orders` ADD COLUMN `billing_address_line2` varchar(255) DEFAULT NULL AFTER `billing_address_line1`;

ALTER TABLE `orders` ADD COLUMN `billing_city` varchar(100) DEFAULT NULL AFTER `billing_address_line2`;

ALTER TABLE `orders` ADD COLUMN `billing_postal_code` varchar(20) DEFAULT NULL AFTER `billing_city`;

ALTER TABLE `orders` ADD COLUMN `billing_country` varchar(100) DEFAULT 'Portugal' AFTER `billing_postal_code`;

ALTER TABLE `orders` ADD COLUMN `shipping_address_line1` varchar(255) DEFAULT NULL AFTER `billing_country`;

ALTER TABLE `orders` ADD COLUMN `shipping_address_line2` varchar(255) DEFAULT NULL AFTER `shipping_address_line1`;

ALTER TABLE `orders` ADD COLUMN `shipping_city` varchar(100) DEFAULT NULL AFTER `shipping_address_line2`;

ALTER TABLE `orders` ADD COLUMN `shipping_postal_code` varchar(20) DEFAULT NULL AFTER `shipping_city`;

ALTER TABLE `orders` ADD COLUMN `shipping_country` varchar(100) DEFAULT 'Portugal' AFTER `shipping_postal_code`;

ALTER TABLE `orders` ADD COLUMN `shipping_method_code` varchar(50) DEFAULT NULL AFTER `shipping_country`;

ALTER TABLE `orders` ADD COLUMN `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `shipping_method_code`;

ALTER TABLE `orders` ADD COLUMN `tax_amount` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `subtotal`;

ALTER TABLE `orders` ADD COLUMN `currency` varchar(3) DEFAULT 'EUR' AFTER `total_amount`;

ALTER TABLE `orders` ADD COLUMN `admin_notes` text AFTER `notes`;

ALTER TABLE `orders` ADD COLUMN `cart_session_id` varchar(255) DEFAULT NULL AFTER `admin_notes`;

ALTER TABLE `orders` ADD COLUMN `shipped_at` timestamp NULL DEFAULT NULL AFTER `updated_at`;

ALTER TABLE `orders` ADD COLUMN `delivered_at` timestamp NULL DEFAULT NULL AFTER `shipped_at`;

ALTER TABLE `order_items` ADD COLUMN `product_reference` varchar(50) DEFAULT NULL AFTER `product_id`;
