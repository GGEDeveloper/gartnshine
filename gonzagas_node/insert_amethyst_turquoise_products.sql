-- ============================================
-- GONZAGA ART & SHINE - 4 PEDRAS SAGRADAS
-- Inserção de Produtos Ametista e Turquesa
-- ============================================

-- Produto 1: Anel Ametista Serenidade (ID: 192)
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'AMETHYST-001',
    'Anel Ametista Serenidade', 'anel-ametista-serenidade-191',
    'Anel artesanal em prata 925 com ametista natural do Brasil. Tom violeta profundo que acalma a mente e desperta a sabedoria interior. Cada cristal é único, carregando a energia da transformação espiritual.',
    'ametista', 'Ametista',
    'Brasil', 'Cristal de quartzo com ferro oxidado, promove clareza mental e calma interior',
    'Prata 925', 'anel',
    79.90, 35.00, 5,
    'Maria Silva', 'Oficina do Cristal', 'Especialista em engastes de cristais',
    TRUE, NOW(), NOW()
);

-- Produto 2: Colar Turquesa Proteção (ID: 193)
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'TURQUOISE-001',
    'Colar Turquesa Proteção', 'colar-turquesa-protecao-192',
    'Colar artesanal em prata 925 com turquesa autêntica da Turquia. Azul celestial que protege viajantes e conecta céu e terra. Amuleto sagrado usado há milênios por civilizações ancestrais.',
    'turquesa', 'Turquesa',
    'Turquia', 'Fosfato de cobre e alumínio, pedra de proteção milenar e cura emocional',
    'Prata 925', 'colar',
    99.90, 42.00, 3,
    'João Costa', 'Atelier da Terra', 'Mestre em joalharia ancestral',
    TRUE, NOW(), NOW()
);

-- Verificação dos produtos inseridos
SELECT 
    id, reference, name, stone_type, stone_name, sale_price, current_stock
FROM products
WHERE stone_type IN ('ametista', 'turquesa')
ORDER BY id;

-- ============================================
-- SUCESSO!
-- Produtos Ametista e Turquesa inseridos
-- ============================================

