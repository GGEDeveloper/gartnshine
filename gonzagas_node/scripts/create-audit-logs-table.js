const { pool } = require('../config/database');

async function createAuditLogsTable() {
  try {
    console.log('🔧 Criando tabela audit_logs...');

    // Criar tabela audit_logs
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        user_agent TEXT,
        ip_address VARCHAR(45) NOT NULL,
        action ENUM('data_access', 'consent_change', 'user_right_request', 'data_deletion', 'data_export', 'admin_access') NOT NULL,
        resource VARCHAR(255) NOT NULL,
        resource_id VARCHAR(255),
        details JSON,
        consent_changes JSON,
        legal_basis ENUM('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interest') NOT NULL,
        retention_period ENUM('1 year', '2 years', '3 years', '5 years', '6 years') NOT NULL,
        created_at DATETIME NOT NULL,
        INDEX idx_session_id (session_id),
        INDEX idx_ip_address (ip_address),
        INDEX idx_action (action),
        INDEX idx_resource (resource),
        INDEX idx_legal_basis (legal_basis),
        INDEX idx_retention_period (retention_period),
        INDEX idx_created_at (created_at),
        INDEX idx_action_created (action, created_at),
        INDEX idx_session_created (session_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await pool.query(createTableQuery);
    console.log('✅ Tabela audit_logs criada com sucesso!');

    // Verificar se a tabela foi criada
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'audit_logs';
    `);

    if (tables.length > 0) {
      console.log('✅ Verificação: Tabela audit_logs existe');
      
      // Obter informações da estrutura da tabela
      const [columns] = await pool.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'audit_logs'
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
        AND TABLE_NAME = 'audit_logs'
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
      console.error('❌ Erro: Tabela audit_logs não foi criada');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erro ao criar tabela audit_logs:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await createAuditLogsTable();
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

module.exports = { createAuditLogsTable }; 