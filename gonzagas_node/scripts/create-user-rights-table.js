const { pool } = require('../config/database');

async function createUserRightsTable() {
  try {
    console.log('🔧 Criando tabela user_rights_requests...');

    // Criar tabela user_rights_requests
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS user_rights_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        request_type ENUM('access', 'deletion', 'rectification', 'portability', 'objection', 'limitation') NOT NULL,
        details TEXT,
        request_token VARCHAR(255) UNIQUE NOT NULL,
        status ENUM('pending', 'processing', 'completed', 'rejected', 'expired') DEFAULT 'pending',
        response_data TEXT,
        expires_at DATETIME NOT NULL,
        processed_at DATETIME NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        INDEX idx_session_id (session_id),
        INDEX idx_email (email),
        INDEX idx_request_token (request_token),
        INDEX idx_status (status),
        INDEX idx_expires_at (expires_at),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createTableQuery);
    console.log('✅ Tabela user_rights_requests criada com sucesso!');

    // Verificar se a tabela foi criada
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'user_rights_requests';
    `);

    if (tables.length > 0) {
      console.log('✅ Verificação: Tabela user_rights_requests existe');
      
      // Obter informações da estrutura da tabela
      const [columns] = await pool.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'user_rights_requests'
        ORDER BY ORDINAL_POSITION;
      `);

      console.log('📋 Estrutura da tabela:');
      columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.EXTRA}`);
      });

      // Verificar índices
      const [indexes] = await pool.query(`
        SELECT INDEX_NAME, COLUMN_NAME 
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'user_rights_requests'
        ORDER BY INDEX_NAME, SEQ_IN_INDEX;
      `);

      console.log('🔍 Índices criados:');
      const indexGroups = {};
      indexes.forEach(idx => {
        if (!indexGroups[idx.INDEX_NAME]) {
          indexGroups[idx.INDEX_NAME] = [];
        }
        indexGroups[idx.INDEX_NAME].push(idx.COLUMN_NAME);
      });

      Object.entries(indexGroups).forEach(([indexName, columns]) => {
        console.log(`  - ${indexName}: (${columns.join(', ')})`);
      });

    } else {
      console.error('❌ Erro: Tabela user_rights_requests não foi criada');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erro ao criar tabela user_rights_requests:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await createUserRightsTable();
    console.log('🎉 Script executado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createUserRightsTable }; 