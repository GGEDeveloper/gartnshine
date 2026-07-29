-- =====================================================
-- MIGRATION 009: Coleções curadas
-- =====================================================
-- Project: Gonzaga's Art & Shine
-- Description: Coleções curadas de produtos — conjuntos escolhidos à mão
-- ("Verão", "Pedras Naturais", "Novidades"), independentes da taxonomia de
-- categorias em product_families.
--
-- Porque é uma tabela nova e não se reaproveitou o que já existia:
--   * product_families é uma TAXONOMIA (material → tipo+material) e cada
--     produto tem exactamente uma (products.family_id). Serve os filtros do
--     catálogo. Numa coleção curada uma peça tem de poder entrar em várias
--     sem sair da sua categoria — daí a tabela de ligação.
--   * media_collections / media_collection_items ligam a FICHEIROS de media
--     (collection_id → file_id), não a produtos. São outra coisa.
--
-- Risk Level: VERY LOW — só tabelas novas, nada existente é tocado.
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `collections` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `hero_image` VARCHAR(255) DEFAULT NULL COMMENT 'Cabeçalho da página da coleção',
  `card_image` VARCHAR(255) DEFAULT NULL COMMENT 'Cartão na página inicial',
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` VARCHAR(320) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_collections_slug` (`slug`),
  KEY `idx_collections_active_order` (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ligação muitos-para-muitos: uma peça pode estar em várias coleções e
-- mantém sempre a sua categoria.
CREATE TABLE IF NOT EXISTS `collection_products` (
  `collection_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `added_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`collection_id`, `product_id`),
  KEY `idx_cp_collection_order` (`collection_id`, `sort_order`),
  KEY `idx_cp_product` (`product_id`),
  CONSTRAINT `fk_cp_collection` FOREIGN KEY (`collection_id`) REFERENCES `collections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cp_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

SELECT 'Migration 009 completed: collections + collection_products ready' AS status;

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- DROP TABLE IF EXISTS `collection_products`;
-- DROP TABLE IF EXISTS `collections`;
