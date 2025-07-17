const { pool } = require('../config/database');

async function addHideCatalogPricesColumn() {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    console.log('🔄 Verificando se a coluna hide_catalog_prices já existe...');
    
    // Verificar se a coluna já existe
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'site_settings' 
        AND COLUMN_NAME = 'hide_catalog_prices'
    `);
    
    if (columns.length > 0) {
      console.log('✅ A coluna hide_catalog_prices já existe na tabela site_settings');
      return;
    }
    
    console.log('🔧 Adicionando a coluna hide_catalog_prices...');
    
    // Adicionar a coluna
    await connection.execute(`
      ALTER TABLE site_settings 
      ADD COLUMN hide_catalog_prices TINYINT(1) NOT NULL DEFAULT 0 
      COMMENT 'Hide prices in catalog, show price on request instead' 
      AFTER catalog_page_enabled
    `);
    
    console.log('✅ Coluna hide_catalog_prices adicionada com sucesso!');
    
    // Verificar se existe pelo menos um registro na tabela
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM site_settings WHERE id = 1');
    
    if (rows[0].count === 0) {
      console.log('🔧 Inserindo registro padrão na tabela site_settings...');
      await connection.execute(`
        INSERT INTO site_settings (id, featured_carousel_enabled, catalog_page_enabled, hide_catalog_prices) 
        VALUES (1, 1, 1, 0)
      `);
      console.log('✅ Registro padrão inserido!');
    } else {
      console.log('✅ Registro padrão já existe na tabela site_settings');
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('📋 Agora você pode acessar /admin/settings para configurar a ocultação de preços no catálogo.');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

// Executar a migração
addHideCatalogPricesColumn()
  .then(() => {
    console.log('🏁 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha na execução:', error);
    process.exit(1);
  }); 