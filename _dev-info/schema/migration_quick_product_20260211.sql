-- Migration: Quick Product Module
-- Adds parent_id to product_families (subcategories) and color to products
-- Run against artnshin_gonzagas_db or your MariaDB database

-- 1. Add parent_id to product_families for subcategories
ALTER TABLE product_families 
ADD COLUMN parent_id INT NULL AFTER is_active,
ADD CONSTRAINT fk_product_families_parent 
  FOREIGN KEY (parent_id) REFERENCES product_families(id) ON DELETE SET NULL;

-- 2. Add color column to products
ALTER TABLE products 
ADD COLUMN color VARCHAR(50) NULL AFTER material;
