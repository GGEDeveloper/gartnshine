-- =====================================================
-- MIGRATION 010: Media do Instagram
-- =====================================================
-- Project: Gonzaga's Art & Shine
-- Description: Guarda os posts do Instagram sincronizados da conta da loja,
-- mais o estado de moderação de cada um, e as credenciais da ligação.
--
-- Porque é preciso guardar em vez de ir buscar sempre à API:
--   * O estado de moderação (escondido / destacado / ordem) tem de persistir
--     entre sincronizações — não existe na API do Instagram.
--   * Se a API falhar ou o token expirar, a galeria continua a mostrar o que
--     já foi sincronizado em vez de aparecer vazia. O token anterior expirou
--     a 10/07/2026 e a página inicial ficou sem faixa de media até hoje.
--   * Evita bater na API a cada visita (tem limites de rate).
--
-- Modelo de moderação: OPT-OUT. `is_hidden` nasce a 0, ou seja, um post novo
-- aparece no site assim que é sincronizado e esconde-se manualmente se não
-- servir. Foi a opção escolhida.
--
-- NOTA DE SEGURANÇA: `instagram_account.access_token` fica em texto simples,
-- como já acontece com as chaves Stripe. Faz parte do lote de segurança que
-- ficou adiado (cifrar segredos em repouso). Está assinalado aqui para não
-- se perder.
--
-- Risk Level: VERY LOW — só tabelas novas, nada existente é tocado.
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

CREATE TABLE IF NOT EXISTS `instagram_media` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ig_id` VARCHAR(64) NOT NULL COMMENT 'id do media na API do Instagram',
  `media_type` VARCHAR(32) NOT NULL COMMENT 'IMAGE, VIDEO ou CAROUSEL_ALBUM',
  `media_url` TEXT DEFAULT NULL COMMENT 'URL assinado, caduca — reposto a cada sync',
  `thumbnail_url` TEXT DEFAULT NULL COMMENT 'só existe em VIDEO',
  `permalink` VARCHAR(500) DEFAULT NULL,
  `caption` TEXT DEFAULT NULL,
  `posted_at` DATETIME DEFAULT NULL COMMENT 'timestamp do post no Instagram',
  `is_hidden` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'opt-out: 0 = visível no site',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `sort_order` INT NOT NULL DEFAULT 0,
  `last_synced_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_instagram_media_ig_id` (`ig_id`),
  KEY `idx_ig_publico` (`is_hidden`, `is_featured`, `posted_at`),
  KEY `idx_ig_ordem` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uma linha só (id = 1). Guarda o token e o resultado da última sincronização
-- para o admin poder mostrar o estado da ligação sem chamar a API.
CREATE TABLE IF NOT EXISTS `instagram_account` (
  `id` TINYINT NOT NULL DEFAULT 1,
  `access_token` TEXT DEFAULT NULL,
  `token_expires_at` DATETIME DEFAULT NULL,
  `token_refreshed_at` DATETIME DEFAULT NULL,
  `ig_user_id` VARCHAR(64) DEFAULT NULL,
  `username` VARCHAR(120) DEFAULT NULL,
  `last_sync_at` DATETIME DEFAULT NULL,
  `last_sync_count` INT DEFAULT NULL,
  `last_error` TEXT DEFAULT NULL COMMENT 'mensagem do último erro de sync ou refresh',
  `last_error_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_instagram_account_singleton` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `instagram_account` (`id`) VALUES (1);

SELECT 'Migration 010 completed: instagram_media + instagram_account ready' AS status;

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- DROP TABLE IF EXISTS `instagram_media`;
-- DROP TABLE IF EXISTS `instagram_account`;
