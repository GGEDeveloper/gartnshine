-- Migration: Product Colors (opções de cor para produtos)
-- Run against artnshin_gonzagas_db

CREATE TABLE IF NOT EXISTS product_colors (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  hex_code VARCHAR(7) NULL COMMENT 'Código hex ex: #C0C0C0',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cores iniciais comuns em joalharia
INSERT IGNORE INTO product_colors (name, hex_code, sort_order) VALUES
('Prata', '#C0C0C0', 1),
('Dourado', '#FFD700', 2),
('Prata oxidada', '#A8A8A8', 3),
('Bronze', '#CD7F32', 4),
('Cobre', '#B87333', 5),
('Preto', '#000000', 6),
('Outro', NULL, 99);
