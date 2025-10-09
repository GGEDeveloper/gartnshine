-- =============================================
-- PRODUTOS DE TESTE PARA PDP DARK NATURE
-- Inserir produtos completos com todos os campos
-- =============================================

-- Verificar se colunas existem (adicionar se necessário)
-- Se der erro, significa que as colunas não existem ainda

-- Produto 1: Anel Ónix Proteção
INSERT INTO products (
    reference,
    name,
    description,
    sale_price,
    purchase_price,
    current_stock,
    is_active,
    featured,
    family_id,
    -- Campos novos para PDP (se não existirem, comentar)
    slug,
    stone_type,
    stone_name,
    stone_origin,
    stone_properties,
    metal_name,
    metal_finish,
    metal_purity,
    artisan_name,
    artisan_workshop,
    artisan_specialty,
    crafting_technique,
    weight,
    dimensions,
    meta_title,
    meta_description
) VALUES (
    'ONIX-ANEL-001',
    'Anel Ónix Proteção',
    'Anel unissex em prata 925 com ónix facetado brasileiro. Peça única artesanal que combina a força ancestral do ónix negro com acabamento em prata polida. Ideal para quem busca proteção energética e estilo atemporal.',
    59.90,
    29.90,
    5,
    1,
    1,
    1, -- Ajustar family_id conforme teu DB
    -- Campos PDP
    'anel-onix-protecao',
    'onix',
    'Ónix Negro',
    'Brasil - Minas Gerais',
    'Proteção contra energia negativa, força interior, estabilidade emocional',
    'Prata 925',
    'prata_925',
    '925',
    'Maria Santos',
    'Atelier Terra Sagrada',
    'Especialista em pedras de proteção há 15 anos',
    'Cravação tradicional com garra dupla em prata oxidada',
    '8.5g',
    '18mm x 12mm x 8mm',
    'Anel Ónix Proteção - Prata 925 Artesanal | Gonzaga Art & Shine',
    'Anel artesanal em ónix brasileiro e prata 925. Proteção ancestral em design contemporâneo. Pedra natural autêntica com certificado de origem.'
);

-- Produto 2: Colar Olho-de-tigre Coragem
INSERT INTO products (
    reference,
    name,
    description,
    sale_price,
    purchase_price,
    current_stock,
    is_active,
    featured,
    family_id,
    slug,
    stone_type,
    stone_name,
    stone_origin,
    stone_properties,
    metal_name,
    metal_finish,
    metal_purity,
    artisan_name,
    artisan_workshop,
    artisan_specialty,
    crafting_technique,
    weight,
    dimensions,
    meta_title,
    meta_description
) VALUES (
    'TIGER-COLAR-001',
    'Colar Olho-de-tigre Coragem',
    'Colar pendente em olho-de-tigre natural com veios dourados únicos, montado em prata 925. Cada pedra é cuidadosamente selecionada pela intensidade dos seus reflexos dourados. Peça que desperta coragem e clareza mental.',
    89.90,
    44.90,
    3,
    1,
    1,
    2, -- Ajustar family_id
    'colar-olho-tigre-coragem',
    'olho-de-tigre',
    'Olho-de-tigre Natural',
    'África do Sul - Northern Cape',
    'Coragem, clareza mental, proteção energética, força de vontade',
    'Prata 925',
    'prata_925',
    '925',
    'João Silva',
    'Oficina Dourada',
    'Mestre em lapidação de pedras chatoyant há 20 anos',
    'Lapidação cabochão com polimento espelhado, montagem bezel',
    '12.3g',
    'Pendente: 25mm x 18mm, Corrente: 50cm',
    'Colar Olho-de-tigre Coragem - Prata 925 | Gonzaga Art & Shine',
    'Colar artesanal com olho-de-tigre da África do Sul e prata 925. Veios dourados naturais que capturam a luz. Pedra de coragem e determinação.'
);

-- Produto 3: Pulseira Ónix Minimalista
INSERT INTO products (
    reference,
    name,
    description,
    sale_price,
    purchase_price,
    current_stock,
    is_active,
    featured,
    family_id,
    slug,
    stone_type,
    stone_name,
    stone_origin,
    stone_properties,
    metal_name,
    metal_finish,
    metal_purity,
    artisan_name,
    artisan_workshop,
    artisan_specialty,
    crafting_technique,
    weight,
    dimensions,
    meta_title,
    meta_description
) VALUES (
    'ONIX-PULSE-001',
    'Pulseira Ónix Minimalista',
    'Pulseira delicada em prata 925 com três contas de ónix facetado. Design minimalista que combina elegância discreta com a energia protetora do ónix. Ajustável para diferentes tamanhos de pulso.',
    45.90,
    22.90,
    8,
    1,
    0,
    3, -- Ajustar family_id
    'pulseira-onix-minimalista',
    'onix',
    'Ónix Facetado',
    'Brasil - Minas Gerais',
    'Proteção discreta, equilíbrio emocional, grounding',
    'Prata 925',
    'prata_925',
    '925',
    'Maria Santos',
    'Atelier Terra Sagrada',
    'Especialista em joias minimalistas e pedras de proteção',
    'Facetação manual em 8 faces, montagem wire-wrapped',
    '6.2g',
    'Ajustável 16-19cm',
    'Pulseira Ónix Minimalista - Prata 925 | Gonzaga Art & Shine',
    'Pulseira delicada com ónix brasileiro facetado e prata 925. Design minimalista para proteção quotidiana. Ajustável e confortável.'
);

-- Produto 4: Brincos Olho-de-tigre Pendentes
INSERT INTO products (
    reference,
    name,
    description,
    sale_price,
    purchase_price,
    current_stock,
    is_active,
    featured,
    family_id,
    slug,
    stone_type,
    stone_name,
    stone_origin,
    stone_properties,
    metal_name,
    metal_finish,
    metal_purity,
    artisan_name,
    artisan_workshop,
    artisan_specialty,
    crafting_technique,
    weight,
    dimensions,
    meta_title,
    meta_description
) VALUES (
    'TIGER-BRINCOS-001',
    'Brincos Olho-de-tigre Pendentes',
    'Par de brincos pendentes em olho-de-tigre natural com prata 925. Cada pedra exibe veios dourados únicos que dançam com a luz. Fecho de segurança em prata. Leves e confortáveis para uso prolongado.',
    69.90,
    34.90,
    4,
    1,
    1,
    4, -- Ajustar family_id
    'brincos-olho-tigre-pendentes',
    'olho-de-tigre',
    'Olho-de-tigre Premium',
    'África do Sul',
    'Clareza mental, confiança, proteção contra negatividade',
    'Prata 925',
    'prata_925',
    '925',
    'João Silva',
    'Oficina Dourada',
    'Especialista em brincos com pedras chatoyant',
    'Lapidação gota com acabamento polido, montagem em prata oxidada',
    '4.8g (par)',
    'Comprimento: 35mm, Largura: 10mm',
    'Brincos Olho-de-tigre Pendentes - Prata 925 | Gonzaga Art & Shine',
    'Brincos artesanais com olho-de-tigre africano e prata 925. Veios dourados únicos em cada peça. Leves e elegantes para uso diário.'
);

-- =============================================
-- SCRIPT ALTERNATIVO SE COLUNAS NÃO EXISTIREM
-- =============================================

-- Se as colunas PDP não existirem no teu DB, usa este insert básico:
/*
INSERT INTO products (reference, name, description, sale_price, purchase_price, current_stock, is_active, featured, family_id)
VALUES
('ONIX-ANEL-001', 'Anel Ónix Proteção', 'Anel artesanal em ónix brasileiro e prata 925. Proteção ancestral.', 59.90, 29.90, 5, 1, 1, 1),
('TIGER-COLAR-001', 'Colar Olho-de-tigre Coragem', 'Colar com olho-de-tigre da África do Sul. Coragem e clareza.', 89.90, 44.90, 3, 1, 1, 2),
('ONIX-PULSE-001', 'Pulseira Ónix Minimalista', 'Pulseira delicada com ónix facetado.', 45.90, 22.90, 8, 1, 0, 3),
('TIGER-BRINCOS-001', 'Brincos Olho-de-tigre Pendentes', 'Brincos pendentes com veios dourados únicos.', 69.90, 34.90, 4, 1, 1, 4);
*/

-- =============================================
-- ADICIONAR IMAGENS (OPCIONAL)
-- =============================================

-- Se quiser adicionar imagens placeholder aos produtos:
/*
-- Assumindo que os IDs dos produtos inseridos são 1, 2, 3, 4
INSERT INTO product_images (product_id, image_filename, is_primary, sort_order)
VALUES
(1, 'placeholder-onix-anel.jpg', 1, 1),
(2, 'placeholder-tiger-colar.jpg', 1, 1),
(3, 'placeholder-onix-pulse.jpg', 1, 1),
(4, 'placeholder-tiger-brincos.jpg', 1, 1);
*/

-- =============================================
-- VERIFICAR INSERÇÕES
-- =============================================

SELECT 
    id,
    reference,
    name,
    sale_price,
    COALESCE(slug, id) as slug_or_id,
    stone_type,
    current_stock
FROM products
WHERE reference LIKE 'ONIX-%' OR reference LIKE 'TIGER-%'
ORDER BY id DESC
LIMIT 10;

