-- =====================================================
-- MIGRATION 015: Capas e cartões próprios para as categorias
-- =====================================================
-- Project: Gonzaga Jewellery
-- Description: 22 das 25 categorias não tinham cabeçalho e caíam na primeira
-- fotografia de produto da família, esticada por uma faixa de 4:1 pelo
-- `background-size: cover`. As três que tinham apontavam para fotos de galeria
-- com fundo proibido pela paleta da marca (relva ao sol, céu azul). O mesmo
-- valia para os cartões dos materiais na homepage e na loja, e para o cartão
-- "Ver todos".
--
-- Esta migração NÃO cria nem altera colunas. Só reescreve caminhos de imagem
-- em `product_families` (e um em `site_settings`) para os ficheiros montados
-- por `scripts/category-headers/build.js`, que vêm no mesmo commit em
-- `public/media/categories/`.
--
-- Risk Level: LOW — toca em 3 colunas de imagem de 25 linhas de categorias e
-- em 1 coluna de definições. Não toca em produtos, preços, stock, encomendas,
-- clientes nem carrinhos.
--
-- Segurança em produção:
--   1. As colunas `card_image`, `hero_source` e `shop_all_card_image` podem
--      não existir (vieram das migrações 008 e 014). Cada uma é usada só se
--      `information_schema` a confirmar — nunca dá erro por faltar.
--   2. O valor anterior de cada linha é copiado para
--      `bak_015_imagens_categoria` ANTES de ser substituído. O INSERT é
--      IGNORE, por isso correr a migração outra vez não estraga a primeira
--      cópia. O bloco de rollback no fim repõe a partir dela.
--   3. A correspondência é por `slug`, não por `id` — os ids em produção
--      podem não ser os mesmos. Uma categoria que exista em produção e não
--      esteja nesta lista fica exactamente como está.
--   4. Nenhum DELETE, nenhum DROP, nenhum ALTER.
--
-- Idempotente: pode correr as vezes que forem precisas.
-- Rollback: ver bloco comentado no final do ficheiro.
-- =====================================================

-- ----------------------------------------------------------------------
-- 0. Que colunas existem nesta base de dados
-- ----------------------------------------------------------------------
-- Ramo "não fazer nada" dos IF() abaixo. É um SET e não o `SELECT 1` das
-- migrações antigas para não encher o registo do deploy de "1" soltos, que
-- durante um deploy parecem erro e não são.
SET @NADA = 'SET @ignorado = 1';

SET @tem_card = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'product_families'
    AND COLUMN_NAME = 'card_image');
SET @tem_hero_source = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'product_families'
    AND COLUMN_NAME = 'hero_source');
SET @tem_shop_all = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'site_settings'
    AND COLUMN_NAME = 'shop_all_card_image');

-- ----------------------------------------------------------------------
-- 1. Os caminhos novos, numa tabela temporária
-- ----------------------------------------------------------------------
DROP TEMPORARY TABLE IF EXISTS `tmp_015_imagens`;
CREATE TEMPORARY TABLE `tmp_015_imagens` (
  `slug`       VARCHAR(191) NOT NULL PRIMARY KEY,
  `hero_image` VARCHAR(255) NOT NULL,
  `card_image` VARCHAR(255) NULL
);

INSERT INTO `tmp_015_imagens` (`slug`, `hero_image`, `card_image`) VALUES
  ('prata', '/media/categories/cat-16-hero-1920.jpg', '/media/categories/cat-16-card-1200.jpg'),
  ('aneis-prata', '/media/categories/cat-1-hero-1920.jpg', NULL),
  ('brincos-prata', '/media/categories/cat-2-hero-1920.jpg', NULL),
  ('colares-prata', '/media/categories/cat-3-hero-1920.jpg', NULL),
  ('pulseiras-prata', '/media/categories/cat-4-hero-1920.jpg', NULL),
  ('cuffs-prata', '/media/categories/cat-17-hero-1920.jpg', NULL),
  ('pulseiras-pe-prata', '/media/categories/cat-26-hero-1920.jpg', NULL),
  ('pendentes-prata', '/media/categories/cat-21-hero-1920.jpg', NULL),
  ('latao', '/media/categories/cat-6-hero-1920.jpg', '/media/categories/cat-6-card-1200.jpg'),
  ('aneis-latao', '/media/categories/cat-9-hero-1920.jpg', NULL),
  ('brincos-latao', '/media/categories/cat-15-hero-1920.jpg', NULL),
  ('cuffs-latao', '/media/categories/cat-8-hero-1920.jpg', NULL),
  ('gargantilhas-latao', '/media/categories/cat-7-hero-1920.jpg', NULL),
  ('colares-latao', '/media/categories/cat-10-hero-1920.jpg', NULL),
  ('pendentes-latao', '/media/categories/cat-11-hero-1920.jpg', NULL),
  ('pentes-de-cabelo-latao', '/media/categories/cat-22-hero-1920.jpg', NULL),
  ('piercings-latao', '/media/categories/cat-23-hero-1920.jpg', NULL),
  ('piercings-sem-furo-latao', '/media/categories/cat-24-hero-1920.jpg', NULL),
  ('pulseiras-latao', '/media/categories/cat-25-hero-1920.jpg', NULL),
  ('macrame', '/media/categories/cat-12-hero-1920.jpg', '/media/categories/cat-12-card-1200.jpg'),
  ('colares-macrame', '/media/categories/cat-13-hero-1920.jpg', NULL),
  ('brincos-macrame', '/media/categories/cat-14-hero-1920.jpg', NULL),
  ('pedras-naturais', '/media/categories/cat-5-hero-1920.jpg', '/media/categories/cat-5-card-1200.jpg'),
  ('colares-pedras-naturais', '/media/categories/cat-18-hero-1920.jpg', NULL),
  ('pulseiras-pedras-naturais', '/media/categories/cat-19-hero-1920.jpg', NULL);

-- ----------------------------------------------------------------------
-- 2. Guardar o que lá está antes de escrever por cima
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bak_015_imagens_categoria` (
  `alvo`       VARCHAR(191) NOT NULL PRIMARY KEY
               COMMENT 'slug da categoria, ou site_settings.<coluna>',
  `hero_image` VARCHAR(255) NULL,
  `card_image` VARCHAR(255) NULL,
  `gravado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
  COMMENT='Valores anteriores à migração 015. Serve o rollback; pode ser apagada quando as capas novas estiverem aceites.';
-- Sem DEFAULT CHARSET de propósito: a tabela herda o da BASE DE DADOS, que é o
-- mesmo de `product_families`. Com `DEFAULT CHARSET=utf8mb4` explícito ela
-- apanhava o do SERVIDOR (utf8mb4_0900_ai_ci), diferente do da base
-- (utf8mb4_unicode_ci), e o JOIN do rollback rebentava com
-- "Illegal mix of collations".

SET @sql = IF(@tem_card = 1,
  'INSERT IGNORE INTO bak_015_imagens_categoria (alvo, hero_image, card_image)
     SELECT f.slug, f.hero_image, f.card_image
       FROM product_families f JOIN tmp_015_imagens t ON t.slug = f.slug',
  'INSERT IGNORE INTO bak_015_imagens_categoria (alvo, hero_image, card_image)
     SELECT f.slug, f.hero_image, NULL
       FROM product_families f JOIN tmp_015_imagens t ON t.slug = f.slug');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@tem_shop_all = 1,
  'INSERT IGNORE INTO bak_015_imagens_categoria (alvo, hero_image, card_image)
     SELECT ''site_settings.shop_all_card_image'', shop_all_card_image, NULL
       FROM site_settings ORDER BY id LIMIT 1',
  @NADA);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ----------------------------------------------------------------------
-- 3. Aplicar
-- ----------------------------------------------------------------------
-- Cabeçalho da página da categoria (as 25).
UPDATE `product_families` f
  JOIN `tmp_015_imagens` t ON t.`slug` = f.`slug`
   SET f.`hero_image` = t.`hero_image`;

-- hero_source aponta para o original de onde o admin recortou a hero. As capas
-- novas não são recorte de nada, por isso deixa de haver original a apontar.
SET @sql = IF(@tem_hero_source = 1,
  'UPDATE product_families f JOIN tmp_015_imagens t ON t.slug = f.slug
      SET f.hero_source = NULL',
  @NADA);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Cartão da homepage e da loja. Só os materiais de topo o usam: a consulta
-- getMaterialsForHome filtra parent_id IS NULL.
SET @sql = IF(@tem_card = 1,
  'UPDATE product_families f JOIN tmp_015_imagens t ON t.slug = f.slug
      SET f.card_image = t.card_image
    WHERE t.card_image IS NOT NULL',
  @NADA);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Cartão "Ver todos" da loja: não é uma categoria, vive nas definições.
SET @sql = IF(@tem_shop_all = 1,
  'UPDATE site_settings SET shop_all_card_image = ''/media/categories/todos-card-1200.jpg'' ORDER BY id LIMIT 1',
  @NADA);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

DROP TEMPORARY TABLE IF EXISTS `tmp_015_imagens`;

-- ----------------------------------------------------------------------
-- 4. Verificação
-- ----------------------------------------------------------------------
-- Espera-se 25. Menos do que isso significa que produção tem slugs diferentes
-- dos deste repositório — as que faltarem ficaram intactas, não partidas.
SELECT CONCAT(COUNT(*), ' de 25 categorias com capa nova') AS capas
  FROM `product_families`
 WHERE `hero_image` LIKE '/media/categories/cat-%-hero-1920.jpg';

-- Espera-se 4 (prata, latão, macramé, pedras naturais). Guardado como o resto:
-- numa base de dados sem `card_image` esta contagem nem sequer é possível.
SET @sql = IF(@tem_card = 1,
  'SELECT CONCAT(COUNT(*), '' de 4 materiais com cartão novo'') AS cartoes
     FROM product_families
    WHERE card_image LIKE ''/media/categories/cat-%-card-1200.jpg''',
  'SELECT ''sem coluna card_image nesta base de dados — cartões por aplicar'' AS cartoes');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Categorias em produção que esta migração não conhece: ficam como estavam.
SELECT `slug`, `name` AS `sem_capa_nova`
  FROM `product_families`
 WHERE `hero_image` IS NULL
    OR `hero_image` NOT LIKE '/media/categories/cat-%-hero-1920.jpg';

-- =====================================================
-- ROLLBACK (correr à mão se for preciso voltar atrás)
-- =====================================================
-- UPDATE product_families f
--   JOIN bak_015_imagens_categoria b ON b.alvo = f.slug
--    SET f.hero_image = b.hero_image,
--        f.card_image = b.card_image;
--
-- UPDATE site_settings
--    SET shop_all_card_image = (SELECT hero_image FROM bak_015_imagens_categoria
--                                WHERE alvo = 'site_settings.shop_all_card_image')
--  ORDER BY id LIMIT 1;
--
-- -- Só depois de confirmar que o site voltou ao estado anterior:
-- -- DROP TABLE bak_015_imagens_categoria;
-- =====================================================
