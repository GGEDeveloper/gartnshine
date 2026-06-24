-- Migration: Adicionar campo base_price à tabela order_items
-- Data: 2026-06-24
-- Descrição: Esta migration adiciona o campo base_price à tabela order_items
--              para guardar o preço base (sem IVA) de cada item da encomenda.

-- Adicionar campo base_price à tabela order_items
ALTER TABLE order_items 
ADD COLUMN base_price DECIMAL(10,2) DEFAULT 0.00 AFTER unit_price;
