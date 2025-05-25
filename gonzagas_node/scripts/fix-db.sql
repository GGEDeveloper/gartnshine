-- Corrige a base de dados para o dashboard/admin funcionar corretamente

-- 1. Adicionar coluna 'featured' à tabela products se não existir
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT 0;

-- 2. Criar tabela product_images se não existir
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_filename VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 3. (Opcional) Adicionar imagens de teste para produtos existentes
INSERT INTO product_images (product_id, image_filename, is_primary, sort_order)
SELECT id, 'default.jpg', 1, 0 FROM products
WHERE id NOT IN (SELECT product_id FROM product_images);
