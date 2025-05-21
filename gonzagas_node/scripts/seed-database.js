const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

async function runQuery(query, params = []) {
  try {
    const [result] = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('Seeding database with initial data...');

    // Inserir famílias de produtos
    const families = [
      { code: 'BRACELETES', name: 'Braceletes' },
      { code: 'COLARES', name: 'Colares' },
      { code: 'ANEIS', name: 'Anéis' },
      { code: 'BRINCOS', name: 'Brincos' },
      { code: 'PULSEIRAS', name: 'Pulseiras' },
    ];

    console.log('Adding product families...');
    for (const family of families) {
      await runQuery(
        'INSERT IGNORE INTO product_families (code, name) VALUES (?, ?)',
        [family.code, family.name]
      );
    }

    // Obter IDs das famílias
    const [familyResults] = await runQuery('SELECT id, code FROM product_families');
    const familyMap = {};
    familyResults.forEach(f => familyMap[f.code] = f.id);

    // Inserir produtos de exemplo
    const products = [
      {
        reference: 'BRC001',
        family_id: familyMap['BRACELETES'],
        name: 'Bracelete Prata 925',
        description: 'Bracelete em prata 925 com detalhes em banho de ouro',
        sale_price: 199.90,
        purchase_price: 99.90,
        current_stock: 10,
        style: 'Moderno',
        material: 'Prata 925',
        weight: '15g',
        dimensions: '18cm',
        is_active: 1,
        featured: 1
      },
      {
        reference: 'COL001',
        family_id: familyMap['COLARES'],
        name: 'Colar Prata com Pingente',
        description: 'Colar em prata 925 com pingente de coração',
        sale_price: 249.90,
        purchase_price: 149.90,
        current_stock: 15,
        style: 'Elegante',
        material: 'Prata 925',
        weight: '12g',
        dimensions: '45cm',
        is_active: 1,
        featured: 1
      },
      {
        reference: 'ANL001',
        family_id: familyMap['ANEIS'],
        name: 'Anéu Prata 925',
        description: 'Anel em prata 925 com detalhes em banho de ouro',
        sale_price: 179.90,
        purchase_price: 89.90,
        current_stock: 8,
        style: 'Clássico',
        material: 'Prata 925',
        weight: '8g',
        dimensions: 'Tamanho 17',
        is_active: 1,
        featured: 0
      },
      {
        reference: 'BRC002',
        family_id: familyMap['BRINCOS'],
        name: 'Brinco Argola Prata',
        description: 'Brinco argola em prata 925',
        sale_price: 159.90,
        purchase_price: 79.90,
        current_stock: 20,
        style: 'Moderno',
        material: 'Prata 925',
        weight: '5g',
        dimensions: '2cm de diâmetro',
        is_active: 1,
        featured: 1
      },
      {
        reference: 'PLS001',
        family_id: familyMap['PULSEIRAS'],
        name: 'Pulseira de Prata',
        description: 'Pulseira em prata 925 com fecho de segurança',
        sale_price: 229.90,
        purchase_price: 129.90,
        current_stock: 12,
        style: 'Elegante',
        material: 'Prata 925',
        weight: '10g',
        dimensions: '18cm',
        is_active: 1,
        featured: 1
      }
    ];

    console.log('Adding sample products...');
    for (const product of products) {
      await runQuery(
        `INSERT IGNORE INTO products 
        (reference, family_id, name, description, sale_price, purchase_price, 
         current_stock, style, material, weight, dimensions, is_active, featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.reference,
          product.family_id,
          product.name,
          product.description,
          product.sale_price,
          product.purchase_price,
          product.current_stock,
          product.style,
          product.material,
          product.weight,
          product.dimensions,
          product.is_active,
          product.featured
        ]
      );
    }

    // Adicionar usuário admin se não existir
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await runQuery(
      `INSERT IGNORE INTO users 
      (username, password, name, email, is_admin) 
      VALUES (?, ?, ?, ?, ?)`,
      ['admin', hashedPassword, 'Administrator', 'admin@example.com', 1]
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  } finally {
    // Fechar a conexão com o pool
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  }
}

// Executar a semeadura
seedDatabase();
