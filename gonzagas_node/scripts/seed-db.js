const { pool } = require('../config/database');

async function seedDatabase() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Seeding database with initial data...');
    
    // Inserir famílias de produtos
    const [familyResult] = await connection.query(
      'INSERT IGNORE INTO product_families (code, name, description) VALUES (?, ?, ?)',
      ['BRACELETES', 'Braceletes', 'Braceletes em prata esterlina']
    );
    
    const familyId = familyResult.insertId || 1; // Usa o ID inserido ou 1 se já existir
    
    // Inserir produtos de exemplo
    await connection.query(
      `INSERT INTO products 
      (reference, family_id, name, description, sale_price, purchase_price, current_stock, is_active, featured) 
      VALUES 
      ('BRC001', ?, 'Bracelete Prata', 'Bracelete em prata esterlina com detalhes', 99.90, 49.95, 10, true, true),
      ('BRC002', ?, 'Bracelete Dourado', 'Bracelete banhado a ouro', 129.90, 64.95, 5, true, false)`,
      [familyId, familyId]
    );
    
    await connection.commit();
    console.log('Database seeded successfully!');
  } catch (error) {
    await connection.rollback();
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    connection.release();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
