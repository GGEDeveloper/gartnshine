-- Migration: Povoar base_price para produtos existentes
-- Data: 2026-06-24
-- Descrição: Calcula base_price para todos os produtos existentes usando sale_price / 1.23
--              Assumindo que os preços actuais na BD já incluem IVA (23%)

-- Calcular base_price para todos os produtos (sale_price / 1.23)
UPDATE products 
SET base_price = ROUND(sale_price / 1.23, 2)
WHERE sale_price > 0 AND base_price = 0;

-- Definir prices_include_tax como TRUE para todos os produtos existentes
UPDATE products 
SET prices_include_tax = TRUE
WHERE prices_include_tax IS NULL;
