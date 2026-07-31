-- =====================================================
-- MIGRATION 011: Mudança de nome para "Gonzaga"
-- =====================================================
-- Project: Gonzaga Jewellery (antes "Gonzaga's Art & Shine")
-- Description: Substitui o nome antigo nos textos guardados na base de dados.
--
-- O levantamento (ver docs/rebranding/PLANO.md) mostrou que a marca quase não
-- está em dados: 0 produtos, 0 coleções, 0 nomes de categoria. Só uma
-- descrição de categoria a tinha — "Pulseiras pequenas para pé.
-- Gonzaga's Art& Shine" (repare-se no espaçamento irregular, daí as duas
-- variantes tratadas abaixo).
--
-- Porque é um UPDATE com REPLACE e não um UPDATE directo por id: os ids das
-- categorias podem não coincidir entre o ambiente local e produção, e um
-- UPDATE por id arriscava alterar a linha errada. O REPLACE só toca no que
-- contém o texto antigo.
--
-- Risk Level: VERY LOW — altera apenas texto descritivo; não toca em
-- produtos, encomendas, clientes, stock nem em qualquer estrutura.
-- Idempotente: correr outra vez não encontra nada para substituir.
-- Rollback: ver bloco comentado no final.
-- =====================================================

UPDATE `product_families`
   SET `description` = REPLACE(
         REPLACE(`description`, 'Gonzaga''s Art& Shine',  'Gonzaga Jewellery'),
                                'Gonzaga''s Art & Shine', 'Gonzaga Jewellery')
 WHERE `description` LIKE '%Art%Shine%';

UPDATE `product_families`
   SET `name` = REPLACE(
         REPLACE(`name`, 'Gonzaga''s Art& Shine',  'Gonzaga Jewellery'),
                         'Gonzaga''s Art & Shine', 'Gonzaga Jewellery')
 WHERE `name` LIKE '%Art%Shine%';

-- As mesmas substituições nas tabelas onde o levantamento local não encontrou
-- ocorrências, por precaução: produção tem produtos que não existem no
-- ambiente local e podem ter a marca em texto livre.
UPDATE `products`
   SET `description` = REPLACE(
         REPLACE(`description`, 'Gonzaga''s Art& Shine',  'Gonzaga Jewellery'),
                                'Gonzaga''s Art & Shine', 'Gonzaga Jewellery')
 WHERE `description` LIKE '%Art%Shine%';

UPDATE `collections`
   SET `description` = REPLACE(
         REPLACE(`description`, 'Gonzaga''s Art& Shine',  'Gonzaga Jewellery'),
                                'Gonzaga''s Art & Shine', 'Gonzaga Jewellery')
 WHERE `description` LIKE '%Art%Shine%';

SELECT 'Migration 011 completed: textos da marca actualizados' AS status;

-- Confirmação: deve devolver 0 em todas as linhas.
SELECT 'product_families.description' AS onde, COUNT(*) AS restantes
  FROM `product_families` WHERE `description` LIKE '%Art%Shine%'
UNION ALL SELECT 'product_families.name', COUNT(*)
  FROM `product_families` WHERE `name` LIKE '%Art%Shine%'
UNION ALL SELECT 'products.description', COUNT(*)
  FROM `products` WHERE `description` LIKE '%Art%Shine%'
UNION ALL SELECT 'collections.description', COUNT(*)
  FROM `collections` WHERE `description` LIKE '%Art%Shine%';

-- =====================================================
-- ROLLBACK (descomentar e correr manualmente se necessário)
-- =====================================================
-- Não é reversível automaticamente: o texto antigo não fica guardado em lado
-- nenhum. Repor a partir do backup feito antes do deploy, ou reescrever à mão
-- a descrição afectada (era "Pulseiras pequenas para pé. Gonzaga's Art& Shine"
-- na categoria "Pulseiras Pé - Prata").
