-- Migration: add slug columns (safe to re-run via run-migration.js)
-- Statement 1: products.slug
ALTER TABLE `products` ADD COLUMN `slug` VARCHAR(255) DEFAULT NULL AFTER `name`;
-- Statement 2: products unique key (run after 1)
ALTER TABLE `products` ADD UNIQUE KEY `slug_unique_products` (`slug`);
-- Statement 3: product_families.slug
ALTER TABLE `product_families` ADD COLUMN `slug` VARCHAR(255) DEFAULT NULL AFTER `name`;
-- Statement 4: product_families unique key
ALTER TABLE `product_families` ADD UNIQUE KEY `slug_unique_families` (`slug`);
