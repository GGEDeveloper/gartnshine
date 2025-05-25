require('dotenv').config({ path: 'gonzagas_node/.env' });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function updateProductFamilies() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Criando famílias de produtos...');
    
    // Mapeamento dos códigos para nomes
    const families = [
      { code: 'PAN', name: 'Aneis' },
      { code: 'PPB', name: 'Brincos' },
      { code: 'PVO', name: 'Colares' },
      { code: 'PPU', name: 'Pulseiras' }
    ];
    
    // Inserir ou atualizar famílias
    for (const family of families) {
      // Verificar se a família já existe
      const [existing] = await connection.query(
        'SELECT id FROM product_families WHERE code = ?', 
        [family.code]
      );
      
      if (existing.length === 0) {
        // Inserir nova família
        await connection.query(
          'INSERT INTO product_families (code, name) VALUES (?, ?)',
          [family.code, family.name]
        );
        console.log(`Família criada: ${family.code} - ${family.name}`);
      } else {
        console.log(`Família já existe: ${family.code} - ${family.name}`);
      }
    }
    
    // Atualizar produtos com os IDs das famílias
    for (const family of families) {
      // Obter o ID da família
      const [familyData] = await connection.query(
        'SELECT id FROM product_families WHERE code = ?',
        [family.code]
      );
      
      if (familyData.length > 0) {
        const familyId = familyData[0].id;
        
        // Atualizar produtos com este código de estilo
        const [result] = await connection.query(
          'UPDATE products SET family_id = ? WHERE style = ?',
          [familyId, family.code]
        );
        
        console.log(`Atualizados ${result.affectedRows} produtos para a família ${family.code} (${family.name})`);
      }
    }
    
    await connection.commit();
    console.log('Atualização concluída com sucesso!');
    
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar famílias de produtos:', error);
    throw error;
  } finally {
    connection.release();
    pool.end();
  }
}

// Executar o script
updateProductFamilies().catch(console.error);
