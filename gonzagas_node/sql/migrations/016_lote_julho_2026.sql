-- =====================================================
-- MIGRATION 016: Lote de peças novas de Julho de 2026
-- =====================================================
-- Project: Gonzaga Jewellery
-- Description: 70 peças fotografadas na sessão de Julho de 2026
-- (66 anéis de prata, 1 colar de âmbar, 1 pendente de larimar e 2 pendentes
-- crescente). Entram **sem preço** e com **stock 1**:
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

-- PAN0091 · Anel de Prata Onda Lisa
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0091', f.`id`, 'Anel de Prata Onda Lisa', 'anel-de-prata-onda-lisa', 'Anel em prata 925 de superfície lisa e polida, com o aro a cruzar-se numa onda contínua. Sem pedra: o desenho está todo no volume e no brilho do metal.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0091');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0091' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0091.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0091.jpg');

-- PAN0092 · Anel de Prata Pedra da Lua com Filigrana
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0092', f.`id`, 'Anel de Prata Pedra da Lua com Filigrana', 'anel-de-prata-pedra-da-lua-com-filigrana', 'Pedra da lua oval, de brilho leitoso, assente num aro fino de prata 925 com filigrana trabalhada de ambos os lados.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0092');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0092' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0092.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0092.jpg');

-- PAN0093 · Anel de Prata Ónix com Espirais
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0093', f.`id`, 'Anel de Prata Ónix com Espirais', 'anel-de-prata-onix-com-espirais', 'Ónix preto oval em aro de prata 925, ladeado por espirais em relevo. O contraste entre a pedra mate e a prata oxidada dá-lhe presença sem peso.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0093');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0093' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0093.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0093.jpg');

-- PAN0094 · Anel de Prata Ónix Gota com Aro Trançado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0094', f.`id`, 'Anel de Prata Ónix Gota com Aro Trançado', 'anel-de-prata-onix-gota-com-aro-trancado', 'Ónix preto em talhe de gota sobre um aro de prata 925 trabalhado em trança. Peça discreta, de uso diário.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0094');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0094' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0094.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0094.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0094-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0094-alt1.jpg');

-- PAN0095 · Anel de Prata Ónix Redondo com Laçada
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0095', f.`id`, 'Anel de Prata Ónix Redondo com Laçada', 'anel-de-prata-onix-redondo-com-lacada', 'Ónix preto redondo pequeno, com o aro de prata 925 a desenhar uma laçada de um dos lados.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0095');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0095' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0095.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0095.jpg');

-- PAN0096 · Anel de Prata Três Turquesas
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0096', f.`id`, 'Anel de Prata Três Turquesas', 'anel-de-prata-tres-turquesas', 'Três turquesas naturais em linha, cada uma com o seu engaste, sobre aro de prata 925. As veias da pedra mudam de peça para peça.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0096');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0096' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0096.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0096.jpg');

-- PAN0097 · Anel de Prata Pedra da Lua Oval Fina
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0097', f.`id`, 'Anel de Prata Pedra da Lua Oval Fina', 'anel-de-prata-pedra-da-lua-oval-fina', 'Pedra da lua oval pequena em aro fino de prata 925. Discreto, pensado para usar em conjunto com outros anéis.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0097');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0097' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0097.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0097.jpg');

-- PAN0098 · Anel de Prata Labradorite com Pontos
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0098', f.`id`, 'Anel de Prata Labradorite com Pontos', 'anel-de-prata-labradorite-com-pontos', 'Labradorite oval, com os reflexos azuis a acenderem consoante a luz, num aro de prata 925 pontuado por esferas.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0098');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0098' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0098.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0098.jpg');

-- PAN0099 · Anel de Prata Labradorite com Filigrana
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0099', f.`id`, 'Anel de Prata Labradorite com Filigrana', 'anel-de-prata-labradorite-com-filigrana', 'Labradorite oval em engaste de prata 925 com filigrana e granulado nos ombros do aro.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0099');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0099' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0099.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0099.jpg');

-- PAN0100 · Anel de Prata Ónix Redondo Liso
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0100', f.`id`, 'Anel de Prata Ónix Redondo Liso', 'anel-de-prata-onix-redondo-liso', 'Ónix preto redondo em engaste liso de prata 925, sem ornamento. A leitura é o contraste entre o preto mate e a prata polida.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0100');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0100' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0100.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0100.jpg');

-- PAN0101 · Anel de Prata Labradorite com Volutas
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0101', f.`id`, 'Anel de Prata Labradorite com Volutas', 'anel-de-prata-labradorite-com-volutas', 'Labradorite oval assente entre volutas de prata 925 trabalhadas à mão.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0101');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0101' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0101.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0101.jpg');

-- PAN0102 · Anel de Prata Pedra da Lua com Granulado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0102', f.`id`, 'Anel de Prata Pedra da Lua com Granulado', 'anel-de-prata-pedra-da-lua-com-granulado', 'Pedra da lua redonda cercada por um anel de granulado em prata 925. O granulado apanha a luz em volta da pedra.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0102');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0102' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0102.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0102.jpg');

-- PAN0103 · Anel de Prata Pedra da Lua Oval Simples
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0103', f.`id`, 'Anel de Prata Pedra da Lua Oval Simples', 'anel-de-prata-pedra-da-lua-oval-simples', 'Pedra da lua oval em engaste liso de prata 925, com o aro a abrir-se em duas hastes finas.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0103');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0103' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0103.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0103.jpg');

-- PAN0104 · Anel de Prata Labradorite Pequena
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0104', f.`id`, 'Anel de Prata Labradorite Pequena', 'anel-de-prata-labradorite-pequena', 'Labradorite pequena em aro de prata 925 com espirais discretas nos ombros.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0104');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0104' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0104.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0104.jpg');

-- PAN0105 · Anel de Prata Pedra Verde com Cordão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0105', f.`id`, 'Anel de Prata Pedra Verde com Cordão', 'anel-de-prata-pedra-verde-com-cordao', 'Pedra verde oval cercada por um cordão de prata 925 torcido, sobre aro fino.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0105');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0105' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0105.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0105.jpg');

-- PAN0106 · Anel de Prata Turquesa Oval
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0106', f.`id`, 'Anel de Prata Turquesa Oval', 'anel-de-prata-turquesa-oval', 'Turquesa natural oval, com as veias castanhas à vista, em aro fino de prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0106');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0106' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0106.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0106.jpg');

-- PAN0107 · Anel de Prata Larimar Redondo
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0107', f.`id`, 'Anel de Prata Larimar Redondo', 'anel-de-prata-larimar-redondo', 'Larimar redondo, de azul claro marmoreado, em engaste de prata 925 com moldura estriada.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0107');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0107' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0107.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0107.jpg');

-- PAN0108 · Anel de Prata Labradorite Oval Grande
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0108', f.`id`, 'Anel de Prata Labradorite Oval Grande', 'anel-de-prata-labradorite-oval-grande', 'Labradorite oval de bom tamanho em engaste liso de prata 925. A pedra muda de cor conforme o ângulo.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0108');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0108' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0108.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0108.jpg');

-- PAN0109 · Anel de Prata Ónix Oval com Laçada
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0109', f.`id`, 'Anel de Prata Ónix Oval com Laçada', 'anel-de-prata-onix-oval-com-lacada', 'Ónix preto oval com o aro de prata 925 a formar uma laçada aberta junto à pedra.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0109');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0109' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0109.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0109.jpg');

-- PAN0110 · Anel de Prata Pedra Azul em V
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0110', f.`id`, 'Anel de Prata Pedra Azul em V', 'anel-de-prata-pedra-azul-em-v', 'Aro de prata 925 em V, com uma pedra azul redonda no vértice. Assenta em bico no dedo.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0110');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0110' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0110.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0110.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0110-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0110-alt1.jpg');

-- PAN0111 · Anel de Prata Pedra da Lua Étnico
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0111', f.`id`, 'Anel de Prata Pedra da Lua Étnico', 'anel-de-prata-pedra-da-lua-etnico', 'Pedra da lua clara cercada de granulado e volutas em prata 925, de inspiração étnica.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0111');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0111' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0111.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0111.jpg');

-- PAN0112 · Anel de Prata Ónix com Espirais Abertas
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0112', f.`id`, 'Anel de Prata Ónix com Espirais Abertas', 'anel-de-prata-onix-com-espirais-abertas', 'Ónix preto pequeno num aro de prata 925 aberto, rematado por duas espirais.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0112');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0112' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0112.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0112.jpg');

-- PAN0113 · Anel de Prata Pedra da Lua Marquise
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0113', f.`id`, 'Anel de Prata Pedra da Lua Marquise', 'anel-de-prata-pedra-da-lua-marquise', 'Pedra da lua em talhe marquise, alongada, sobre aro de prata 925 com gravado fino.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0113');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0113' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0113.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0113.jpg');

-- PAN0114 · Anel de Prata Labradorite com Círculos
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0114', f.`id`, 'Anel de Prata Labradorite com Círculos', 'anel-de-prata-labradorite-com-circulos', 'Labradorite redonda escura, com pequenos círculos em relevo a acompanhar o engaste em prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0114');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0114' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0114.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0114.jpg');

-- PAN0115 · Anel de Prata Olho de Tigre Pequeno
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0115', f.`id`, 'Anel de Prata Olho de Tigre Pequeno', 'anel-de-prata-olho-de-tigre-pequeno', 'Olho de tigre redondo pequeno, de bandas douradas, cercado por granulado em prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0115');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0115' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0115.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0115.jpg');

-- PAN0116 · Anel de Prata Âmbar Alongado Ajustável
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0116', f.`id`, 'Anel de Prata Âmbar Alongado Ajustável', 'anel-de-prata-ambar-alongado-ajustavel', 'Âmbar em oval alongado, quente e translúcido, sobre aro de prata 925 ajustável.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0116');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0116' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0116.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0116.jpg');

-- PAN0117 · Anel de Prata Ónix com Espiral
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0117', f.`id`, 'Anel de Prata Ónix com Espiral', 'anel-de-prata-onix-com-espiral', 'Ónix preto oval com uma espiral em relevo de um dos lados do aro, em prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0117');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0117' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0117.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0117.jpg');

-- PAN0118 · Anel de Prata Labradorite com Espinha
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0118', f.`id`, 'Anel de Prata Labradorite com Espinha', 'anel-de-prata-labradorite-com-espinha', 'Labradorite oval com o aro de prata 925 trabalhado em espinha junto ao engaste.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0118');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0118' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0118.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0118.jpg');

-- PAN0119 · Anel de Prata Pedra da Lua Pequena
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0119', f.`id`, 'Anel de Prata Pedra da Lua Pequena', 'anel-de-prata-pedra-da-lua-pequena', 'Pedra da lua oval pequena, engaste liso, aro fino de prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0119');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0119' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0119.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0119.jpg');

-- PAN0120 · Anel de Prata Pedra da Lua Ornamentado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0120', f.`id`, 'Anel de Prata Pedra da Lua Ornamentado', 'anel-de-prata-pedra-da-lua-ornamentado', 'Pedra da lua clara rodeada de granulado, com o aro de prata 925 a abrir-se em volutas.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0120');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0120' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0120.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0120.jpg');

-- PAN0121 · Anel de Prata Ónix Losango
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0121', f.`id`, 'Anel de Prata Ónix Losango', 'anel-de-prata-onix-losango', 'Ónix preto em losango, cercado de granulado em prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0121');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0121' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0121.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0121.jpg');

-- PAN0122 · Anel de Prata Olho de Tigre Oval
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0122', f.`id`, 'Anel de Prata Olho de Tigre Oval', 'anel-de-prata-olho-de-tigre-oval', 'Olho de tigre oval, de bandas douradas e castanhas, em engaste de prata 925 com moldura em corda.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0122');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0122' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0122.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0122.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0122-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0122-alt1.jpg');

-- PAN0123 · Anel de Prata Quartzo Místico Ajustável
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0123', f.`id`, 'Anel de Prata Quartzo Místico Ajustável', 'anel-de-prata-quartzo-mistico-ajustavel', 'Quartzo místico de reflexos verdes e violeta sobre um aro largo de prata 925 martelado, com espiral gravada. Ajustável.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0123');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0123' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0123.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0123.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0123-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0123-alt1.jpg');

-- PAN0124 · Anel de Prata Sinete Pedra da Lua
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0124', f.`id`, 'Anel de Prata Sinete Pedra da Lua', 'anel-de-prata-sinete-pedra-da-lua', 'Anel de sinete em prata 925 com pedra da lua oval e os ombros gravados em padrão geométrico. Peça de bom peso.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0124');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0124' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0124.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0124.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0124-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0124-alt1.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0124-alt2.jpg', 0, 2 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0124-alt2.jpg');

-- PAN0125 · Anel de Prata Marquise Espiralado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0125', f.`id`, 'Anel de Prata Marquise Espiralado', 'anel-de-prata-marquise-espiralado', 'Placa em marquise, alongada, coberta de espirais concêntricas em prata 925 oxidada.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0125');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0125' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0125.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0125.jpg');

-- PAN0126 · Anel de Prata Olho de Tigre com Volutas
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0126', f.`id`, 'Anel de Prata Olho de Tigre com Volutas', 'anel-de-prata-olho-de-tigre-com-volutas', 'Olho de tigre oval entre volutas e granulado em prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0126');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0126' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0126.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0126.jpg');

-- PAN0127 · Anel de Prata Aro Largo Escamado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0127', f.`id`, 'Anel de Prata Aro Largo Escamado', 'anel-de-prata-aro-largo-escamado', 'Aro largo de prata 925 coberto por um padrão de escamas em relevo, oxidado nos vãos.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0127');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0127' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0127.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0127.jpg');

-- PAN0128 · Anel de Prata Aro Ajustável Granulado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0128', f.`id`, 'Anel de Prata Aro Ajustável Granulado', 'anel-de-prata-aro-ajustavel-granulado', 'Aro aberto de prata 925, ajustável, com faixa central de granulado.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0128');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0128' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0128.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0128.jpg');

-- PAN0129 · Anel de Prata Aro com Pontos
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0129', f.`id`, 'Anel de Prata Aro com Pontos', 'anel-de-prata-aro-com-pontos', 'Aro aberto de prata 925 com fileiras de pontos e riscas gravadas.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0129');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0129' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0129.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0129.jpg');

-- PAN0130 · Anel de Prata Elos Grumete
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0130', f.`id`, 'Anel de Prata Elos Grumete', 'anel-de-prata-elos-grumete', 'Anel feito de elos de grumete em prata 925, articulado, com o desenho de uma corrente fechada.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0130');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0130' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0130.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0130.jpg');

-- PAN0131 · Anel de Prata Trança Grossa
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0131', f.`id`, 'Anel de Prata Trança Grossa', 'anel-de-prata-tranca-grossa', 'Trança larga de prata 925 oxidada, de bom volume, a dar a volta ao dedo.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0131');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0131' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0131.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0131.jpg');

-- PAN0132 · Anel de Prata Ónix com Aro Texturado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0132', f.`id`, 'Anel de Prata Ónix com Aro Texturado', 'anel-de-prata-onix-com-aro-texturado', 'Ónix preto oval assente num aro de prata 925 com textura gravada em toda a face.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0132');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0132' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0132.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0132.jpg');

-- PAN0133 · Anel de Prata Domo Escamado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0133', f.`id`, 'Anel de Prata Domo Escamado', 'anel-de-prata-domo-escamado', 'Domo em prata 925 coberto de escamas arredondadas em relevo, oxidado nos vãos.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0133');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0133' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0133.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0133.jpg');

-- PAN0134 · Anel de Prata Domo Granulado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0134', f.`id`, 'Anel de Prata Domo Granulado', 'anel-de-prata-domo-granulado', 'Domo de prata 925 inteiramente granulado, atravessado por uma faixa lisa em diagonal.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0134');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0134' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0134.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0134.jpg');

-- PAN0135 · Anel de Prata Olho de Tigre Granulado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0135', f.`id`, 'Anel de Prata Olho de Tigre Granulado', 'anel-de-prata-olho-de-tigre-granulado', 'Olho de tigre oval num engaste de prata 925 rodeado de granulado denso. Peça de homem, de bom peso.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0135');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0135' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0135.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0135.jpg');

-- PAN0136 · Anel de Prata Filigrana com Pedra Azul
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0136', f.`id`, 'Anel de Prata Filigrana com Pedra Azul', 'anel-de-prata-filigrana-com-pedra-azul', 'Anel largo em filigrana de prata 925, com pedra azul clara ao centro e trabalho vazado em toda a volta.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0136');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0136' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0136.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0136.jpg');

-- PAN0137 · Anel de Prata Ónix com Grelha
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0137', f.`id`, 'Anel de Prata Ónix com Grelha', 'anel-de-prata-onix-com-grelha', 'Ónix preto rectangular em anel de prata 925 com os ombros gravados em grelha.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0137');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0137' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0137.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0137.jpg');

-- PAN0138 · Anel de Prata Ónix Triangular
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0138', f.`id`, 'Anel de Prata Ónix Triangular', 'anel-de-prata-onix-triangular', 'Ónix preto em talhe triangular, engaste liso, aro largo de prata 925 polida.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0138');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0138' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0138.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0138.jpg');

-- PAN0139 · Anel de Prata Sinete Ónix Quadrado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0139', f.`id`, 'Anel de Prata Sinete Ónix Quadrado', 'anel-de-prata-sinete-onix-quadrado', 'Sinete de prata 925 com ónix preto quadrado e aro liso. Desenho sóbrio, sem ornamento.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0139');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0139' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0139.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0139.jpg');

-- PAN0140 · Anel de Prata Ónix Quadrado Facetado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0140', f.`id`, 'Anel de Prata Ónix Quadrado Facetado', 'anel-de-prata-onix-quadrado-facetado', 'Ónix preto quadrado facetado, montado em garras sobre aro largo de prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0140');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0140' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0140.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0140.jpg');

-- PAN0141 · Anel de Prata Polvo
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0141', f.`id`, 'Anel de Prata Polvo', 'anel-de-prata-polvo', 'Polvo em prata 925, com os tentáculos a darem a volta ao dedo e duas pedras escuras no corpo. Peça de autor, para quem quer uma peça que se note.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0141');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0141' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0141.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0141.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0141-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0141-alt1.jpg');

-- PAN0142 · Anel de Prata Relicário Filigrana
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0142', f.`id`, 'Anel de Prata Relicário Filigrana', 'anel-de-prata-relicario-filigrana', 'Anel-relicário em prata 925: a tampa em filigrana abre e fecha sobre um compartimento interior. Trabalho todo feito à mão.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0142');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0142' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0142.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0142.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0142-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0142-alt1.jpg');

-- PAN0143 · Anel de Prata Sol Raiado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0143', f.`id`, 'Anel de Prata Sol Raiado', 'anel-de-prata-sol-raiado', 'Anel largo de prata 925 com raios gravados a partir de um centro em relevo, como um sol.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0143');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0143' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0143.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0143.jpg');

-- PAN0144 · Anel de Prata Ónix Tribal
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0144', f.`id`, 'Anel de Prata Ónix Tribal', 'anel-de-prata-onix-tribal', 'Ónix preto em anel de prata 925 com gravado tribal nos ombros.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0144');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0144' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0144.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0144.jpg');

-- PAN0145 · Anel de Prata Aro Canelado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0145', f.`id`, 'Anel de Prata Aro Canelado', 'anel-de-prata-aro-canelado', 'Aro largo e côncavo de prata 925, canelado de ponta a ponta.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0145');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0145' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0145.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0145.jpg');

-- PAN0146 · Anel de Prata Aro Ondulado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0146', f.`id`, 'Anel de Prata Aro Ondulado', 'anel-de-prata-aro-ondulado', 'Aro largo de prata 925 com ondas em relevo a correrem em torno do dedo.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0146');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0146' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0146.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0146.jpg');

-- PAN0147 · Anel de Prata Aro Côncavo Liso
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0147', f.`id`, 'Anel de Prata Aro Côncavo Liso', 'anel-de-prata-aro-concavo-liso', 'Aro largo e côncavo em prata 925 polida, sem qualquer ornamento. Todo o efeito vem do reflexo.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0147');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0147' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0147.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0147.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0147-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0147-alt1.jpg');

-- PAN0148 · Anel de Prata Elos Grumete Grosso
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0148', f.`id`, 'Anel de Prata Elos Grumete Grosso', 'anel-de-prata-elos-grumete-grosso', 'Elos de grumete grossos em prata 925, articulados, com o peso de uma corrente.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0148');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0148' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0148.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0148.jpg');

-- PAN0149 · Anel de Prata Sinete Ónix com Grelha
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0149', f.`id`, 'Anel de Prata Sinete Ónix com Grelha', 'anel-de-prata-sinete-onix-com-grelha', 'Sinete de prata 925 com ónix preto oval e os ombros gravados em grelha fina.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0149');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0149' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0149.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0149.jpg');

-- PAN0150 · Anel de Prata Ónix Discreto
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0150', f.`id`, 'Anel de Prata Ónix Discreto', 'anel-de-prata-onix-discreto', 'Aro de prata 925 liso e arredondado, com um ónix preto pequeno embutido à face.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0150');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0150' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0150.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0150.jpg');

-- PAN0151 · Anel de Prata Marquise Liso
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0151', f.`id`, 'Anel de Prata Marquise Liso', 'anel-de-prata-marquise-liso', 'Placa em marquise, lisa e polida, sobre aro de prata 925. Desenho limpo, sem pedra.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0151');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0151' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0151.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0151.jpg');

-- PAN0152 · Anel de Prata Ónix com Contorno
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0152', f.`id`, 'Anel de Prata Ónix com Contorno', 'anel-de-prata-onix-com-contorno', 'Ónix preto redondo com um contorno gravado a acompanhar o engaste, em prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0152');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0152' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0152.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0152.jpg');

-- PAN0153 · Anel de Prata Ónix com Garras
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0153', f.`id`, 'Anel de Prata Ónix com Garras', 'anel-de-prata-onix-com-garras', 'Ónix preto seguro por garras de prata 925, com os ombros do aro gravados em riscas.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0153');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0153' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0153.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0153.jpg');

-- PAN0154 · Anel de Prata Ónix com Aro Canelado
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0154', f.`id`, 'Anel de Prata Ónix com Aro Canelado', 'anel-de-prata-onix-com-aro-canelado', 'Ónix preto oval em anel de prata 925 com o aro canelado de ambos os lados.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0154');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0154' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0154.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0154.jpg');

-- PAN0155 · Anel de Prata Ónix com Cruzes
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0155', f.`id`, 'Anel de Prata Ónix com Cruzes', 'anel-de-prata-onix-com-cruzes', 'Ónix preto facetado num anel de prata 925 com cruzes gravadas ao longo dos ombros.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0155');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0155' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0155.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0155.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0155-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0155-alt1.jpg');

-- PAN0156 · Anel de Prata Pedra da Lua Gota
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PAN0156', f.`id`, 'Anel de Prata Pedra da Lua Gota', 'anel-de-prata-pedra-da-lua-gota', 'Pedra da lua em talhe de gota, pequena, sobre aro fino de prata 925.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'aneis-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PAN0156');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PAN0156' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PAN0156.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PAN0156.jpg');

-- PNC0007 · Colar de Âmbar em Pedra Bruta
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PNC0007', f.`id`, 'Colar de Âmbar em Pedra Bruta', 'colar-de-ambar-em-pedra-bruta', 'Fio comprido de âmbar em pedras irregulares, de tons de mel a castanho. Cada conta é diferente — o âmbar é resina fóssil e não se repete.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'colares-pedras-naturais'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PNC0007');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PNC0007' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PNC0007.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PNC0007.jpg');

-- PNP0001 · Pendente de Prata com Larimar
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'PNP0001', f.`id`, 'Pendente de Prata com Larimar', 'pendente-de-prata-com-larimar', 'Larimar redondo, de azul claro marmoreado, em engaste de prata 925 com moldura em raios. Vem em fio de prata tipo cobra.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pendentes-prata'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'PNP0001');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'PNP0001' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PNP0001.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PNP0001.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PNP0001-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PNP0001-alt1.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'PNP0001-alt2.jpg', 0, 2 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'PNP0001-alt2.jpg');

-- LTPD0006 · Pendente Crescente em Osso e Latão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'LTPD0006', f.`id`, 'Pendente Crescente em Osso e Latão', 'pendente-crescente-em-osso-e-latao', 'Crescente em osso claro com pontas e argola em latão trabalhado. Forma de chifre duplo, de inspiração tribal. Peça grande, para usar em fio comprido.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pendentes-latao'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'LTPD0006');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'LTPD0006' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'LTPD0006.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'LTPD0006.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'LTPD0006-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'LTPD0006-alt1.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'LTPD0006-alt2.jpg', 0, 2 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'LTPD0006-alt2.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'LTPD0006-alt3.jpg', 0, 3 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'LTPD0006-alt3.jpg');

-- LTPD0007 · Pendente Crescente em Madeira e Latão
INSERT INTO `products`
  (`reference`, `family_id`, `name`, `slug`, `description`,
   `purchase_price`, `sale_price`, `base_price`, `current_stock`, `min_stock`,
   `active`, `is_active`, `is_catalog_visible`)
SELECT 'LTPD0007', f.`id`, 'Pendente Crescente em Madeira e Latão', 'pendente-crescente-em-madeira-e-latao', 'O mesmo crescente de chifre duplo, aqui em madeira escura com pontas e argola em latão. O veio da madeira muda de peça para peça.',
       0, 0, 0, 1, 0, 1, 1, 1
  FROM `product_families` f
 WHERE f.`slug` = 'pendentes-latao'
   AND NOT EXISTS (SELECT 1 FROM `products` p WHERE p.`reference` = 'LTPD0007');
SET @pid = (SELECT `id` FROM `products` WHERE `reference` = 'LTPD0007' LIMIT 1);
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'LTPD0007.jpg', 1, 0 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'LTPD0007.jpg');
  INSERT INTO `product_images` (`product_id`, `image_filename`, `is_primary`, `sort_order`)
    SELECT @pid, 'LTPD0007-alt1.jpg', 0, 1 FROM DUAL
     WHERE @pid IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM `product_images` WHERE `product_id` = @pid AND `image_filename` = 'LTPD0007-alt1.jpg');

-- ----------------------------------------------------------------------
-- Verificação
-- ----------------------------------------------------------------------
SELECT CONCAT(COUNT(*), ' de 70 peças do lote presentes') AS estado
  FROM `products` WHERE `reference` IN ('PAN0091','PAN0092','PAN0093','PAN0094','PAN0095','PAN0096','PAN0097','PAN0098','PAN0099','PAN0100','PAN0101','PAN0102','PAN0103','PAN0104','PAN0105','PAN0106','PAN0107','PAN0108','PAN0109','PAN0110','PAN0111','PAN0112','PAN0113','PAN0114','PAN0115','PAN0116','PAN0117','PAN0118','PAN0119','PAN0120','PAN0121','PAN0122','PAN0123','PAN0124','PAN0125','PAN0126','PAN0127','PAN0128','PAN0129','PAN0130','PAN0131','PAN0132','PAN0133','PAN0134','PAN0135','PAN0136','PAN0137','PAN0138','PAN0139','PAN0140','PAN0141','PAN0142','PAN0143','PAN0144','PAN0145','PAN0146','PAN0147','PAN0148','PAN0149','PAN0150','PAN0151','PAN0152','PAN0153','PAN0154','PAN0155','PAN0156','PNC0007','PNP0001','LTPD0006','LTPD0007');

SELECT CONCAT(COUNT(*), ' sem preço e com stock (como esperado)') AS estado
  FROM `products` WHERE `reference` IN ('PAN0091','PAN0092','PAN0093','PAN0094','PAN0095','PAN0096','PAN0097','PAN0098','PAN0099','PAN0100','PAN0101','PAN0102','PAN0103','PAN0104','PAN0105','PAN0106','PAN0107','PAN0108','PAN0109','PAN0110','PAN0111','PAN0112','PAN0113','PAN0114','PAN0115','PAN0116','PAN0117','PAN0118','PAN0119','PAN0120','PAN0121','PAN0122','PAN0123','PAN0124','PAN0125','PAN0126','PAN0127','PAN0128','PAN0129','PAN0130','PAN0131','PAN0132','PAN0133','PAN0134','PAN0135','PAN0136','PAN0137','PAN0138','PAN0139','PAN0140','PAN0141','PAN0142','PAN0143','PAN0144','PAN0145','PAN0146','PAN0147','PAN0148','PAN0149','PAN0150','PAN0151','PAN0152','PAN0153','PAN0154','PAN0155','PAN0156','PNC0007','PNP0001','LTPD0006','LTPD0007') AND `sale_price` = 0 AND `current_stock` > 0;

SELECT f.`name` AS familia, COUNT(*) AS pecas
  FROM `products` p JOIN `product_families` f ON f.`id` = p.`family_id`
 WHERE p.`reference` IN ('PAN0091','PAN0092','PAN0093','PAN0094','PAN0095','PAN0096','PAN0097','PAN0098','PAN0099','PAN0100','PAN0101','PAN0102','PAN0103','PAN0104','PAN0105','PAN0106','PAN0107','PAN0108','PAN0109','PAN0110','PAN0111','PAN0112','PAN0113','PAN0114','PAN0115','PAN0116','PAN0117','PAN0118','PAN0119','PAN0120','PAN0121','PAN0122','PAN0123','PAN0124','PAN0125','PAN0126','PAN0127','PAN0128','PAN0129','PAN0130','PAN0131','PAN0132','PAN0133','PAN0134','PAN0135','PAN0136','PAN0137','PAN0138','PAN0139','PAN0140','PAN0141','PAN0142','PAN0143','PAN0144','PAN0145','PAN0146','PAN0147','PAN0148','PAN0149','PAN0150','PAN0151','PAN0152','PAN0153','PAN0154','PAN0155','PAN0156','PNC0007','PNP0001','LTPD0006','LTPD0007') GROUP BY f.`name`;

-- =====================================================
-- ROLLBACK (correr à mão se for preciso)
-- =====================================================
-- DELETE FROM product_images WHERE product_id IN
--   (SELECT id FROM products WHERE reference IN ('PAN0091','PAN0092','PAN0093','PAN0094','PAN0095','PAN0096','PAN0097','PAN0098','PAN0099','PAN0100','PAN0101','PAN0102','PAN0103','PAN0104','PAN0105','PAN0106','PAN0107','PAN0108','PAN0109','PAN0110','PAN0111','PAN0112','PAN0113','PAN0114','PAN0115','PAN0116','PAN0117','PAN0118','PAN0119','PAN0120','PAN0121','PAN0122','PAN0123','PAN0124','PAN0125','PAN0126','PAN0127','PAN0128','PAN0129','PAN0130','PAN0131','PAN0132','PAN0133','PAN0134','PAN0135','PAN0136','PAN0137','PAN0138','PAN0139','PAN0140','PAN0141','PAN0142','PAN0143','PAN0144','PAN0145','PAN0146','PAN0147','PAN0148','PAN0149','PAN0150','PAN0151','PAN0152','PAN0153','PAN0154','PAN0155','PAN0156','PNC0007','PNP0001','LTPD0006','LTPD0007'));
-- DELETE FROM products WHERE reference IN ('PAN0091','PAN0092','PAN0093','PAN0094','PAN0095','PAN0096','PAN0097','PAN0098','PAN0099','PAN0100','PAN0101','PAN0102','PAN0103','PAN0104','PAN0105','PAN0106','PAN0107','PAN0108','PAN0109','PAN0110','PAN0111','PAN0112','PAN0113','PAN0114','PAN0115','PAN0116','PAN0117','PAN0118','PAN0119','PAN0120','PAN0121','PAN0122','PAN0123','PAN0124','PAN0125','PAN0126','PAN0127','PAN0128','PAN0129','PAN0130','PAN0131','PAN0132','PAN0133','PAN0134','PAN0135','PAN0136','PAN0137','PAN0138','PAN0139','PAN0140','PAN0141','PAN0142','PAN0143','PAN0144','PAN0145','PAN0146','PAN0147','PAN0148','PAN0149','PAN0150','PAN0151','PAN0152','PAN0153','PAN0154','PAN0155','PAN0156','PNC0007','PNP0001','LTPD0006','LTPD0007');
-- =====================================================
