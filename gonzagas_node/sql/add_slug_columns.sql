-- Migration: add slug columns to products and product_families
-- Run once on production before deploying the slug-based routes

ALTER TABLE `products`
  ADD COLUMN `slug` VARCHAR(255) DEFAULT NULL AFTER `name`,
  ADD UNIQUE KEY `slug` (`slug`);

ALTER TABLE `product_families`
  ADD COLUMN `slug` VARCHAR(255) DEFAULT NULL AFTER `name`,
  ADD UNIQUE KEY `slug` (`slug`);
