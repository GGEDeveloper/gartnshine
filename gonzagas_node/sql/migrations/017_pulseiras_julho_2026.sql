-- =====================================================
-- MIGRATION 017: Pulseiras de prata da sessão de Julho de 2026
-- =====================================================
-- Project: Gonzaga Jewellery
-- Description: 32 pulseiras de prata da mesma sessão de Julho de
-- 2026 (pasta prata-pulseira). 36 fotografias deram 32 peças: três grupos são
-- a mesma peça fotografada mais do que uma vez. Entram **sem preço** e com **stock 1**:
--
--   * `sale_price = 0` faz as fichas e os cartões mostrarem "Preço sob
--     consulta" — ver views/partials/_productCard.ejs;
--   * `current_stock = 1` é o que as torna visíveis enquanto a definição
--     `hide_out_of_stock` estiver ligada;
--   * o carrinho recusa-as por não terem preço, na API e não só no botão —
--     ver modules/ecommerce/cart/services/cartService.js.
--
-- As fotografias vêm no mesmo commit, em public/media/products/, já com as
-- variantes full/medium/small/thumb em jpg e webp.
--
-- Risk Level: LOW — só INSERT. Não altera nem apaga nenhum produto existente.
-- A família é resolvida por `slug` (os ids diferem entre ambientes) e cada
-- INSERT tem NOT EXISTS pela referência, por isso correr duas vezes não cria
-- duplicados.
--
-- Idempotente. Rollback: ver bloco comentado no final.
-- =====================================================

-- PPU0079 · Pulseira de Prata Malha Serpente Larga
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0079', f.`id`, 'Pulseira de Prata Malha Serpente Larga', 'pulseira-de-prata-malha-serpente-larga', 'Malha serpente em prata 925, larga e de superfície lisa, com fecho em gancho e terminais em esfera. O brilho contínuo do metal faz toda a peça — não há gravação nem pedra.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0079');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0079' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0079.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0079.jpg');

-- PPU0080 · Pulseira de Prata Bizantina com Fecho de Caixa
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0080', f.`id`, 'Pulseira de Prata Bizantina com Fecho de Caixa', 'pulseira-de-prata-bizantina-com-fecho-de-caixa', 'Malha bizantina grossa em prata 925, com fecho de caixa e dois anéis de esferas a marcar o encaixe. Peça pesada, de homem ou de pulso largo.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0080');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0080' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0080.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0080.jpg');

-- PPU0081 · Pulseira de Prata Malha Achatada Larga
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0081', f.`id`, 'Pulseira de Prata Malha Achatada Larga', 'pulseira-de-prata-malha-achatada-larga', 'Banda achatada de malha entrelaçada em prata 925, com o rebordo em corda e fecho em gancho. Assenta rente ao pulso como uma fita de metal.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0081');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0081' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0081.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0081.jpg');

-- PPU0082 · Pulseira de Prata Cordão Torcido com Extensão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0082', f.`id`, 'Pulseira de Prata Cordão Torcido com Extensão', 'pulseira-de-prata-cordao-torcido-com-extensao', 'Cordão torcido fino em prata 925, polido, com fecho de mosquetão e corrente de extensão. O comprimento ajusta-se ao pulso.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0082');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0082' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0082.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0082.jpg');

-- PPU0083 · Pulseira de Prata Trançada Fina Estilo Bali
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0083', f.`id`, 'Pulseira de Prata Trançada Fina Estilo Bali', 'pulseira-de-prata-trancada-fina-estilo-bali', 'Malha trançada fina em prata 925, oxidada para o desenho saltar, com terminais em filigrana e fecho em S. Trabalho balinês tradicional.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0083');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0083' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0083.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0083.jpg');

-- PPU0084 · Pulseira de Prata Espiga com Cabeças de Dragão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0084', f.`id`, 'Pulseira de Prata Espiga com Cabeças de Dragão', 'pulseira-de-prata-espiga-com-cabecas-de-dragao', 'Malha espiga em prata 925 rematada por duas cabeças de dragão que se encontram no fecho. A oxidação escurece os recessos e realça as escamas.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0084');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0084' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0084.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0084.jpg');

-- PPU0085 · Pulseira de Prata Trançada Achatada Estilo Bali
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0085', f.`id`, 'Pulseira de Prata Trançada Achatada Estilo Bali', 'pulseira-de-prata-trancada-achatada-estilo-bali', 'Malha trançada achatada em prata 925, oxidada, com terminais gravados e fecho em S. Fina o suficiente para usar em conjunto com outras.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0085');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0085' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0085.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0085.jpg');

-- PPU0086 · Pulseira de Prata Bizantina com Secções Gravadas
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0086', f.`id`, 'Pulseira de Prata Bizantina com Secções Gravadas', 'pulseira-de-prata-bizantina-com-seccoes-gravadas', 'Malha bizantina em prata 925 interrompida por secções cilíndricas com gravação floral. O contraste entre o polido dos elos e o oxidado das barras é o desenho da peça.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0086');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0086' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0086.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0086.jpg');

-- PPU0087 · Pulseira de Prata Trançada Larga Estilo Bali
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0087', f.`id`, 'Pulseira de Prata Trançada Larga Estilo Bali', 'pulseira-de-prata-trancada-larga-estilo-bali', 'Malha trançada larga e achatada em prata 925, com terminais em filigrana e fecho em S. Peça de volume, com a trama bem visível.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0087');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0087' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0087.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0087.jpg');

-- PPU0088 · Pulseira de Prata Trançada Redonda Estilo Bali
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0088', f.`id`, 'Pulseira de Prata Trançada Redonda Estilo Bali', 'pulseira-de-prata-trancada-redonda-estilo-bali', 'Malha trançada de secção redonda em prata 925, oxidada, com terminais gravados e fecho em S. Cai bem sozinha ou empilhada.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0088');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0088' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0088.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0088.jpg');

-- PPU0089 · Pulseira de Prata Elos Cubanos com Extensão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0089', f.`id`, 'Pulseira de Prata Elos Cubanos com Extensão', 'pulseira-de-prata-elos-cubanos-com-extensao', 'Elos cubanos achatados e polidos em prata 925, com fecho de mosquetão e corrente de extensão. Peça clássica, de brilho limpo.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0089');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0089' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0089.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0089.jpg');

-- PPU0090 · Pulseira de Prata Trançada com Fecho Trabalhado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0090', f.`id`, 'Pulseira de Prata Trançada com Fecho Trabalhado', 'pulseira-de-prata-trancada-com-fecho-trabalhado', 'Malha trançada larga em prata 925 com fecho de caixa vazado em volutas, ladeado por dois anéis gravados. O fecho é a peça de joalharia.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0090');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0090' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0090.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0090.jpg');

-- PPU0091 · Pulseira de Prata Espiga Polida com Cabeças de Dragão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0091', f.`id`, 'Pulseira de Prata Espiga Polida com Cabeças de Dragão', 'pulseira-de-prata-espiga-polida-com-cabecas-de-dragao', 'Malha espiga em prata 925, deixada polida, com duas cabeças de dragão a segurar o fecho em S. Mais luminosa do que as versões oxidadas.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0091');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0091' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0091.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0091.jpg');

-- PPU0092 · Pulseira de Prata Trançada Oxidada com Cabeças de Dragão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0092', f.`id`, 'Pulseira de Prata Trançada Oxidada com Cabeças de Dragão', 'pulseira-de-prata-trancada-oxidada-com-cabecas-de-dragao', 'Malha trançada fina em prata 925, oxidada, terminada em duas cabeças de dragão. Versão discreta do mesmo motivo, para pulso mais estreito.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0092');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0092' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0092.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0092.jpg');

-- PPU0093 · Pulseira de Prata Malha Box Redonda
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0093', f.`id`, 'Pulseira de Prata Malha Box Redonda', 'pulseira-de-prata-malha-box-redonda', 'Malha box de secção redonda em prata 925, com o quadriculado miúdo à vista e fecho em gancho com terminal cilíndrico. Flexível e sem arestas.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0093');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0093' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0093.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0093.jpg');

-- PPU0094 · Pulseira de Prata com Barras Gravadas
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0094', f.`id`, 'Pulseira de Prata com Barras Gravadas', 'pulseira-de-prata-com-barras-gravadas', 'Alternância de barras cilíndricas gravadas e troços de malha trançada, em prata 925 oxidada. O relevo das barras muda de face para face.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0094');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0094' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0094.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0094.jpg');

-- PPU0095 · Pulseira de Prata Espiga Grossa
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0095', f.`id`, 'Pulseira de Prata Espiga Grossa', 'pulseira-de-prata-espiga-grossa', 'Malha espiga grossa em prata 925, polida, com terminais de anéis empilhados e fecho em gancho. Das peças mais pesadas do lote.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0095');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0095' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0095.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0095.jpg');

-- PPU0096 · Pulseira de Prata Elos Florais Oxidada
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0096', f.`id`, 'Pulseira de Prata Elos Florais Oxidada', 'pulseira-de-prata-elos-florais-oxidada', 'Elos em forma de flor alternados com contas, em prata 925 fortemente oxidada. O escurecimento deixa o desenho a ler-se de longe.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0096');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0096' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0096.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0096.jpg');

-- PPU0097 · Pulseira de Prata Espiga Fina
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0097', f.`id`, 'Pulseira de Prata Espiga Fina', 'pulseira-de-prata-espiga-fina', 'Malha espiga estreita em prata 925, oxidada, com fecho de mola. Leve, para usar todos os dias ou a acompanhar peças maiores.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0097');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0097' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0097.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0097.jpg');

-- PPU0098 · Pulseira de Prata Trançada com Terminais em Filigrana
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0098', f.`id`, 'Pulseira de Prata Trançada com Terminais em Filigrana', 'pulseira-de-prata-trancada-com-terminais-em-filigrana', 'Malha trançada em prata 925 com terminais em filigrana vazada e fecho em S. O polido da malha contrasta com o oxidado dos terminais.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0098');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0098' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0098.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0098.jpg');

-- PPU0099 · Pulseira de Prata Malha Achatada Fina
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0099', f.`id`, 'Pulseira de Prata Malha Achatada Fina', 'pulseira-de-prata-malha-achatada-fina', 'Banda achatada estreita em prata 925, de superfície lisa, com fecho em gancho e terminais em esfera. Discreta, quase uma linha de metal.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0099');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0099' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0099.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0099.jpg');

-- PPU0100 · Pulseira de Prata Trançada com Terminais Gravados
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0100', f.`id`, 'Pulseira de Prata Trançada com Terminais Gravados', 'pulseira-de-prata-trancada-com-terminais-gravados', 'Malha trançada média em prata 925, oxidada, com terminais cilíndricos gravados e fecho em S. Trabalho balinês de linha corrente.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0100');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0100' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0100.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0100.jpg');

-- PPU0101 · Pulseira de Prata Cordões Torcidos com Anilhas
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0101', f.`id`, 'Pulseira de Prata Cordões Torcidos com Anilhas', 'pulseira-de-prata-cordoes-torcidos-com-anilhas', 'Dois cordões de malha serpente torcidos um sobre o outro, presos por anilhas gravadas, em prata 925 oxidada. O torcido muda de sentido ao longo da peça.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0101');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0101' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0101.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0101.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0101-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0101-alt1.jpg');

-- PPU0102 · Pulseira de Prata Malha Achatada com Fecho em Gancho
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0102', f.`id`, 'Pulseira de Prata Malha Achatada com Fecho em Gancho', 'pulseira-de-prata-malha-achatada-com-fecho-em-gancho-ppu0102', 'Banda achatada em prata 925 com a trama fina à vista, fecho em gancho e terminais em esfera. Assenta lisa sobre o pulso.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0102');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0102' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0102.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0102.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0102-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0102-alt1.jpg');

-- PPU0103 · Pulseira de Prata Espinha de Dragão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0103', f.`id`, 'Pulseira de Prata Espinha de Dragão', 'pulseira-de-prata-espinha-de-dragao', 'Elos em espinha de dragão em prata 925, oxidada, com terminais em filigrana e fecho em gancho. A face de cima é canelada, a de baixo lisa.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0103');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0103' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0103.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0103.jpg');

-- PPU0104 · Pulseira de Prata Malha Achatada Estreita
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0104', f.`id`, 'Pulseira de Prata Malha Achatada Estreita', 'pulseira-de-prata-malha-achatada-estreita', 'Banda achatada estreita em prata 925, polida, com fecho em gancho alongado. Das peças mais leves do lote.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0104');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0104' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0104.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0104.jpg');

-- PPU0105 · Pulseira de Prata Malha Serpente Fina
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0105', f.`id`, 'Pulseira de Prata Malha Serpente Fina', 'pulseira-de-prata-malha-serpente-fina', 'Malha serpente redonda e fina em prata 925, de superfície contínua, com fecho em gancho. Lisa ao toque, sem elos a marcar.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0105');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0105' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0105.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0105.jpg');

-- PPU0106 · Pulseira de Prata Malha Achatada Polida
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0106', f.`id`, 'Pulseira de Prata Malha Achatada Polida', 'pulseira-de-prata-malha-achatada-polida', 'Banda achatada em prata 925 com acabamento espelhado e fecho em gancho. Reflecte a luz de ponta a ponta.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0106');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0106' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0106.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0106.jpg');

-- PPU0107 · Pulseira de Prata Cordão Torcido com Terminais Cilíndricos
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0107', f.`id`, 'Pulseira de Prata Cordão Torcido com Terminais Cilíndricos', 'pulseira-de-prata-cordao-torcido-com-terminais-cilindricos', 'Cordão torcido em prata 925, polido, entre dois terminais cilíndricos lisos, com fecho em gancho e corrente de extensão.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0107');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0107' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0107.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0107.jpg');

-- PPU0108 · Pulseira de Prata Malha Escamas
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0108', f.`id`, 'Pulseira de Prata Malha Escamas', 'pulseira-de-prata-malha-escamas', 'Malha grossa de escamas em prata 925, oxidada nos vãos, com terminais de anéis empilhados e fecho em gancho. A superfície lembra pele de réptil.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0108');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0108' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0108.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0108.jpg');

-- PPU0109 · Pulseira de Prata com Âmbar
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0109', f.`id`, 'Pulseira de Prata com Âmbar', 'pulseira-de-prata-com-ambar', 'Seis cabochões ovais de âmbar do Báltico, cor de mel, engastados em prata 925 e ligados por elos duplos. Cada pedra tem inclusões próprias.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0109');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0109' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0109.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0109.jpg');

-- PPU0110 · Pulseira de Prata com Larimar
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PPU0110', f.`id`, 'Pulseira de Prata com Larimar', 'pulseira-de-prata-com-larimar', 'Cabochões ovais de larimar, de azul leitoso com veios brancos, engastados em prata 925 e ligados por elos duplos. Pedra vulcânica das Caraíbas — o desenho não se repete.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pulseiras-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PPU0110');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PPU0110' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0110.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0110.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0110-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0110-alt1.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PPU0110-alt2.jpg', 0, 2 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PPU0110-alt2.jpg');

-- ----------------------------------------------------------------------
-- Material das peças com pedra
-- ----------------------------------------------------------------------
-- A coluna `material` pode não existir nesta base de dados, por isso não vai
-- no INSERT: é consultada primeiro e o UPDATE só é preparado se ela existir.
SET @tem_material = (SELECT COUNT(*) FROM information_schema.COLUMNS
                      WHERE TABLE_SCHEMA = DATABASE()
                        AND TABLE_NAME = 'products' AND COLUMN_NAME = 'material');
SET @NADA = 'SET @ignorado = 1';
SET @sql = IF(@tem_material > 0,
  "UPDATE `products` SET `material` = 'Prata 925 e âmbar' WHERE `reference` = 'PPU0109'",
  @NADA);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF(@tem_material > 0,
  "UPDATE `products` SET `material` = 'Prata 925 e larimar' WHERE `reference` = 'PPU0110'",
  @NADA);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ----------------------------------------------------------------------
-- Verificação
-- ----------------------------------------------------------------------
SELECT CONCAT(COUNT(*), ' de 32 peças do lote presentes') AS estado
  FROM `products` WHERE `reference` IN ('PPU0079','PPU0080','PPU0081','PPU0082','PPU0083','PPU0084','PPU0085','PPU0086','PPU0087','PPU0088','PPU0089','PPU0090','PPU0091','PPU0092','PPU0093','PPU0094','PPU0095','PPU0096','PPU0097','PPU0098','PPU0099','PPU0100','PPU0101','PPU0102','PPU0103','PPU0104','PPU0105','PPU0106','PPU0107','PPU0108','PPU0109','PPU0110');

SELECT CONCAT(COUNT(*), ' sem preço e com stock (como esperado)') AS estado
  FROM `products` WHERE `reference` IN ('PPU0079','PPU0080','PPU0081','PPU0082','PPU0083','PPU0084','PPU0085','PPU0086','PPU0087','PPU0088','PPU0089','PPU0090','PPU0091','PPU0092','PPU0093','PPU0094','PPU0095','PPU0096','PPU0097','PPU0098','PPU0099','PPU0100','PPU0101','PPU0102','PPU0103','PPU0104','PPU0105','PPU0106','PPU0107','PPU0108','PPU0109','PPU0110') AND `sale_price` = 0 AND `current_stock` > 0;

SELECT f.`name` AS familia, COUNT(*) AS pecas
  FROM `products` p JOIN `product_families` f ON f.`id` = p.`family_id`
 WHERE p.`reference` IN ('PPU0079','PPU0080','PPU0081','PPU0082','PPU0083','PPU0084','PPU0085','PPU0086','PPU0087','PPU0088','PPU0089','PPU0090','PPU0091','PPU0092','PPU0093','PPU0094','PPU0095','PPU0096','PPU0097','PPU0098','PPU0099','PPU0100','PPU0101','PPU0102','PPU0103','PPU0104','PPU0105','PPU0106','PPU0107','PPU0108','PPU0109','PPU0110') GROUP BY f.`name`;

-- =====================================================
-- ROLLBACK (correr à mão se for preciso)
-- =====================================================
-- DELETE FROM product_images WHERE product_id IN
--   (SELECT id FROM products WHERE reference IN ('PPU0079','PPU0080','PPU0081','PPU0082','PPU0083','PPU0084','PPU0085','PPU0086','PPU0087','PPU0088','PPU0089','PPU0090','PPU0091','PPU0092','PPU0093','PPU0094','PPU0095','PPU0096','PPU0097','PPU0098','PPU0099','PPU0100','PPU0101','PPU0102','PPU0103','PPU0104','PPU0105','PPU0106','PPU0107','PPU0108','PPU0109','PPU0110'));
-- DELETE FROM products WHERE reference IN ('PPU0079','PPU0080','PPU0081','PPU0082','PPU0083','PPU0084','PPU0085','PPU0086','PPU0087','PPU0088','PPU0089','PPU0090','PPU0091','PPU0092','PPU0093','PPU0094','PPU0095','PPU0096','PPU0097','PPU0098','PPU0099','PPU0100','PPU0101','PPU0102','PPU0103','PPU0104','PPU0105','PPU0106','PPU0107','PPU0108','PPU0109','PPU0110');
-- =====================================================
