-- ============================================
-- GONZAGA ART & SHINE - 4 PEDRAS SAGRADAS
-- Inserção Completa - 16 Produtos (4 por pedra)
-- ============================================

-- === AMETISTA COLLECTION (4 produtos) ===

-- Produto 1: Anel Ametista Serenidade (já inserido ID 192)
-- Produto 2: Colar Ametista Intuição
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'AMETHYST-NECKLACE-001',
    'Colar Ametista Intuição', 'colar-ametista-intuicao',
    'Colar artesanal em prata 925 com ametista brasileira facetada. Cristal violeta que desperta a intuição e promove conexão espiritual profunda.',
    'ametista', 'Ametista',
    'Brasil - Minas Gerais', 'Quartzo violeta com ferro, facilita meditação e intuição',
    'Prata 925', 'colar',
    89.90, 38.00, 8,
    'Helena Costa', 'Atelier Cristal Violeta', 'Especialista em cristais e joalharia espiritual',
    TRUE, NOW(), NOW()
);

-- Produto 3: Pulseira Ametista Transmutação
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'AMETHYST-BRACELET-001',
    'Pulseira Ametista Transmutação', 'pulseira-ametista-transmutacao',
    'Pulseira delicada com ametistas facetadas brasileiras. Transmuta energias densas em clareza e serenidade cristalina espiritual.',
    'ametista', 'Ametista',
    'Brasil - Minas Gerais', 'Cristais facetados 6mm, energia de transmutação',
    'Prata 925', 'pulseira',
    79.90, 35.00, 12,
    'Helena Costa', 'Atelier Cristal Violeta', 'Montagem elástica especializada',
    TRUE, NOW(), NOW()
);

-- Produto 4: Brincos Ametista Clareza (usar imagens AMETHYST-001 a 004)
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'AMETHYST-EARRINGS-001',
    'Brincos Ametista Clareza', 'brincos-ametista-clareza',
    'Brincos elegantes em prata 925 com ametistas brasileiras naturais. Clareza mental e serenidade em design minimalista sofisticado.',
    'ametista', 'Ametista',
    'Brasil - Minas Gerais', 'Cristais gota naturais, promovem clareza e calma',
    'Prata 925', 'brincos',
    69.90, 30.00, 15,
    'Helena Costa', 'Atelier Cristal Violeta', 'Design minimalista premium',
    TRUE, NOW(), NOW()
);

-- === TURQUESA COLLECTION (4 produtos) ===

-- Produto 1: Colar Turquesa Proteção (já inserido ID 193)
-- Produto 2: Anel Turquesa Proteção
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'TURQUOISE-RING-001',
    'Anel Turquesa Proteção', 'anel-turquesa-protecao',
    'Anel artesanal em turquesa tibetana autêntica. Proteção ancestral dos oceanos em design contemporâneo minimalista elegante.',
    'turquesa', 'Turquesa',
    'Tibete - Planalto Changtang', 'Gema porosa, proteção de viajantes',
    'Prata 925', 'anel',
    89.90, 40.00, 7,
    'Carlos Mendes', 'Oficina Oceano Antigo', 'Cravação tradicional tibetana',
    TRUE, NOW(), NOW()
);

-- Produto 3: Pingente Turquesa Ancestral
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'TURQUOISE-PENDANT-001',
    'Pingente Turquesa Ancestral', 'pingente-turquesa-ancestral',
    'Pingente artesanal com turquesa bruta do Arizona. Sabedoria ancestral e autenticidade em forma pura natural preservada.',
    'turquesa', 'Turquesa',
    'Arizona - Sleeping Beauty Mine', 'Turquesa bruta com matrix, sabedoria antiga',
    'Prata 925', 'pingente',
    69.90, 32.00, 9,
    'Carlos Mendes', 'Oficina Oceano Antigo', 'Lapidação irregular preservando matrix',
    TRUE, NOW(), NOW()
);

-- Produto 4: Brincos Turquesa Comunicação
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'TURQUOISE-EARRINGS-001',
    'Brincos Turquesa Comunicação', 'brincos-turquesa-comunicacao',
    'Brincos discretos em turquesa iraniana. Promovem comunicação autêntica e expressão verdadeira do ser interior mais profundo.',
    'turquesa', 'Turquesa',
    'Irão - Minas de Nishapur', 'Turquesas calibradas, chakra garganta',
    'Prata 925', 'brincos',
    59.90, 28.00, 15,
    'Carlos Mendes', 'Oficina Oceano Antigo', 'Montagem minimalista delicada',
    TRUE, NOW(), NOW()
);

-- === ÓNIX COLLECTION (4 produtos) ===

-- Produto 1: Anel Ónix Proteção (já existe ID 190)
-- Produto 2: Colar Ónix Presença
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'ONIX-NECKLACE-001',
    'Colar Ónix Presença', 'colar-onix-presenca',
    'Colar statement em ónix mexicano. Presença magnética e força ancestral em design bold contemporâneo sofisticado.',
    'onix', 'Ónix',
    'México - Baja California', 'Ónix negro puro, presença e autoridade',
    'Prata 925', 'colar',
    159.90, 65.00, 4,
    'Maria Santos', 'Atelier Terra Sagrada', 'Lapidação statement com corrente artesanal',
    TRUE, NOW(), NOW()
);

-- Produto 3: Brincos Ónix Elegância
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'ONIX-EARRINGS-001',
    'Brincos Ónix Elegância', 'brincos-onix-elegancia',
    'Brincos minimalistas em ónix indiano. Elegância urbana e sofisticação discreta para o quotidiano alternativo contemporâneo.',
    'onix', 'Ónix',
    'Índia - Rajasthan', 'Ónix facetado quadrado, elegância discreta',
    'Prata 925', 'brincos',
    69.90, 32.00, 18,
    'Maria Santos', 'Atelier Terra Sagrada', 'Cravação quadrada minimalista fosca',
    TRUE, NOW(), NOW()
);

-- Produto 4: Pulseira Ónix Força
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'ONIX-BRACELET-001',
    'Pulseira Ónix Força', 'pulseira-onix-forca',
    'Pulseira unissex em ónix brasileiro. Força interior e proteção discreta em design robusto contemporâneo minimalista.',
    'onix', 'Ónix',
    'Brasil - Minas Gerais', 'Esferas ónix polidas 8mm, força masculina',
    'Prata 925', 'pulseira',
    89.90, 38.00, 10,
    'Maria Santos', 'Atelier Terra Sagrada', 'Montagem masculina robusta',
    TRUE, NOW(), NOW()
);

-- === OLHO-DE-TIGRE COLLECTION (4 produtos) ===

-- Produto 1: Colar Olho-de-tigre Coragem (já existe ID 191)
-- Produto 2: Anel Olho-de-tigre Poder
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'TIGER-RING-001',
    'Anel Olho-de-tigre Poder', 'anel-olho-de-tigre-poder',
    'Anel masculino em olho-de-tigre sul-africano. Poder terrestre e liderança natural em design robusto elegante contemporâneo.',
    'olho-de-tigre', 'Olho-de-tigre',
    'África do Sul - Northern Cape', 'Cabochão oval chatoyant, liderança',
    'Prata 925', 'anel',
    99.90, 42.00, 6,
    'João Silva', 'Oficina Dourada', 'Lapidação cabochão com setting duplo',
    TRUE, NOW(), NOW()
);

-- Produto 3: Pulseira Olho-de-tigre Coragem
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'TIGER-BRACELET-001',
    'Pulseira Olho-de-tigre Coragem', 'pulseira-olho-de-tigre-coragem',
    'Pulseira unissex em olho-de-tigre australiano. Coragem quotidiana e energia solar em design versátil contemporâneo.',
    'olho-de-tigre', 'Olho-de-tigre',
    'Austrália - Pilbara Region', 'Esferas chatoyantes 7mm, coragem diária',
    'Prata 925', 'pulseira',
    79.90, 35.00, 14,
    'João Silva', 'Oficina Dourada', 'Montagem elástica com esferas chatoyantes',
    TRUE, NOW(), NOW()
);

-- Produto 4: Brincos Olho-de-tigre Charme
INSERT INTO products (
    reference, name, slug, description,
    stone_type, stone_name, stone_origin, stone_properties,
    metal_name, style,
    sale_price, purchase_price, current_stock,
    artisan_name, artisan_workshop, artisan_specialty,
    active, created_at, updated_at
) VALUES (
    'TIGER-EARRINGS-001',
    'Brincos Olho-de-tigre Charme', 'brincos-olho-de-tigre-charme',
    'Brincos femininos em olho-de-tigre brasileiro. Feminilidade poderosa e charme solar em design elegante delicado.',
    'olho-de-tigre', 'Olho-de-tigre',
    'Brasil - Minas Gerais', 'Lapidação gota chatoyante, feminilidade solar',
    'Prata 925', 'brincos',
    79.90, 34.00, 11,
    'João Silva', 'Oficina Dourada', 'Lapidação gota com chatoyância realçada',
    TRUE, NOW(), NOW()
);

-- Verificação dos 16 produtos completos
SELECT 
    stone_type, 
    COUNT(*) as quantidade,
    GROUP_CONCAT(name SEPARATOR ' | ') as produtos
FROM products
WHERE stone_type IN ('onix', 'olho-de-tigre', 'ametista', 'turquesa')
GROUP BY stone_type
ORDER BY stone_type;

-- Lista completa
SELECT 
    id, reference, name, stone_type, sale_price, current_stock
FROM products
WHERE stone_type IN ('onix', 'olho-de-tigre', 'ametista', 'turquesa')
ORDER BY stone_type, id;

-- ============================================
-- SUCESSO!
-- 16 Produtos Completos - 4 Pedras Sagradas
-- ============================================

