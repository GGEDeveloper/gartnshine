-- Migration: Adicionar campos base_price e prices_include_tax à tabela products
-- Data: 2026-06-24
-- Descrição: Esta migration adiciona campos para suportar preços base (sem IVA) e o setting prices_include_tax
--              para garantir que o Stripe recebe sempre o preço correcto independentemente do setting de IVA.

-- Adicionar campo base_price (preço sem IVA)
ALTER TABLE products 
ADD COLUMN base_price DECIMAL(10,2) DEFAULT 0.00 AFTER sale_price;

-- Adicionar campo prices_include_tax (indica se sale_price inclui IVA)
ALTER TABLE products 
ADD COLUMN prices_include_tax BOOLEAN DEFAULT TRUE AFTER tax_rate;

-- Adicionar índice para optimizar queries por prices_include_tax
CREATE INDEX idx_products_prices_include_tax ON products(prices_include_tax);
