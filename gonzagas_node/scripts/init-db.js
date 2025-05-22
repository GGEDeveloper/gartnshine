require('dotenv').config();
const mysql = require('mysql2/promise');

// Carrega as variáveis de ambiente
console.log('🔍 Variáveis de ambiente carregadas:');
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_ROOT_USER: ${process.env.DB_ROOT_USER}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);

// Configuração do banco de dados raiz para criar o banco de dados se não existir
const rootConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_ROOT_USER || 'root',
  password: process.env.DB_ROOT_PASSWORD || '',
  multipleStatements: true
};

// Configuração do banco de dados da aplicação
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'gonzagas_user',
  password: process.env.DB_PASSWORD || 'gonzagas_pass',
  database: process.env.DB_NAME || 'gonzagas_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z'
};

console.log('🔑 Configuração do banco de dados raiz:', {
  host: rootConfig.host,
  user: rootConfig.user,
  hasPassword: !!rootConfig.password
});

// Função para tentar conectar ao MySQL com as credenciais fornecidas
async function tryConnection(config) {
  let connection;
  try {
    console.log('🔑 Tentando conectar com as credenciais:', {
      host: config.host,
      user: config.user,
      hasPassword: !!config.password
    });
    
    const connectionConfig = {
      host: config.host,
      user: config.user,
      password: config.password || undefined, // Evita enviar senha vazia
      multipleStatements: true,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000 // 10 segundos de timeout
    };
    
    console.log('🔌 Configuração de conexão:', JSON.stringify(connectionConfig, null, 2));
    
    // Cria uma nova conexão
    connection = await mysql.createConnection(connectionConfig);
    console.log('🔌 Conexão criada, estado:', connection.state);
    
    // Verifica se a conexão está ativa
    console.log('🔍 Verificando estado da conexão...');
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('✅ Teste de consulta bem-sucedido:', rows);
    
    return { success: true, connection };
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    if (connection) {
      console.log('🔌 Estado da conexão no erro:', connection.state);
      try {
        await connection.end();
      } catch (endError) {
        console.error('❌ Erro ao fechar conexão:', endError);
      }
    }
    return { success: false, error };
  }
}

// Cria uma pool de conexões para o banco de dados da aplicação
const pool = mysql.createPool(dbConfig);

// Função para testar a conexão com o banco de dados
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    return true;
  } catch (error) {
    console.error('Erro de conexão:', error.message);
    return false;
  } finally {
    if (connection) await connection.release();
  }
}

// Função para criar o banco de dados e o usuário se não existirem
async function setupDatabase() {
  let rootConn;
  
  try {
    console.log('🔍 Conectando ao servidor MySQL...');
    
    // Tenta conectar com as credenciais fornecidas
    const connectionResult = await tryConnection(rootConfig);
    
    if (!connectionResult.success) {
      console.error('❌ Falha na autenticação. Verifique as credenciais do MySQL no arquivo .env');
      console.error('Certifique-se de que as variáveis DB_ROOT_USER e DB_ROOT_PASSWORD estão configuradas corretamente.');
      return false;
    }
    
    rootConn = connectionResult.connection;

    // Executa cada comando separadamente para garantir que a conexão não seja fechada
    try {
      // Cria o banco de dados se não existir
      console.log('🔄 Criando banco de dados...');
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      
      // Remove o usuário se existir
      console.log('🔄 Configurando usuário...');
      try {
        await rootConn.query(`DROP USER IF EXISTS '${dbConfig.user}'@'%'`);
      } catch (dropError) {
        console.log('ℹ️  Usuário não existia, continuando...');
      }
      
      // Cria o usuário
      await rootConn.query(`CREATE USER '${dbConfig.user}'@'%' IDENTIFIED BY ?`, [dbConfig.password]);
      
      // Concede permissões
      await rootConn.query(`GRANT ALL PRIVILEGES ON \`${dbConfig.database}\`.* TO '${dbConfig.user}'@'%'`);
      
      // Atualiza as permissões
      await rootConn.query('FLUSH PRIVILEGES');

      console.log('✅ Banco de dados e usuário configurados com sucesso!');
      return true;
    } catch (queryError) {
      console.error('❌ Erro ao executar consulta SQL:', queryError.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao configurar o banco de dados:', error.message);
    return false;
  } finally {
    if (rootConn) {
      try {
        await rootConn.end();
      } catch (endError) {
        console.error('❌ Erro ao fechar a conexão:', endError.message);
      }
    }
  }
}

// Função para inicializar as tabelas do banco de dados
async function initializeDatabase() {
  let connection;
  try {
    console.log('🔄 Conectando ao banco de dados...');
    connection = await pool.getConnection();
    
    // Habilita chaves estrangeiras
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Lista de tabelas para remoção (em ordem reversa para evitar problemas de chave estrangeira)
    const tablesToDrop = [
      'inventory_movements',
      'product_sales',
      'product_purchases',
      'product_pricing',
      'product_images',
      'products',
      'customers',
      'suppliers',
      'product_families'
    ];
    
    // Remove as tabelas existentes
    for (const table of tablesToDrop) {
      try {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      } catch (error) {
        console.warn(`⚠️  Aviso ao remover tabela ${table}:`, error.message);
      }
    }
    
    // Cria as tabelas
    console.log('🔄 Criando tabelas...');
    
    // Tabela product_families
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_families (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Tabela suppliers
    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact_person VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        tax_number VARCHAR(20) COMMENT 'NIF',
        address TEXT,
        city VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Portugal',
        payment_terms TEXT,
        notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Tabela customers
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        tax_number VARCHAR(20) COMMENT 'NIF',
        address TEXT,
        city VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Portugal',
        notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        login_attempts INT DEFAULT 0,
        password_hash VARCHAR(255),
        password_reset_token VARCHAR(100),
        password_reset_expires TIMESTAMP NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Tabela products
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference VARCHAR(50) UNIQUE NOT NULL,
        barcode VARCHAR(50),
        family_id INT,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        weight DECIMAL(10,3) DEFAULT 0,
        weight_unit ENUM('g', 'kg') DEFAULT 'g',
        dimensions VARCHAR(50) COMMENT 'LxAxP em mm',
        style VARCHAR(100),
        material VARCHAR(100),
        notes TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        min_stock_level INT DEFAULT 0,
        max_stock_level INT DEFAULT 0,
        location VARCHAR(50) COMMENT 'Localização no armazém',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES product_families(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Tabela product_images
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Tabela product_pricing
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        pvp_price DECIMAL(10,2) NOT NULL COMMENT 'Preço de venda ao público',
        wholesale_price DECIMAL(10,2) COMMENT 'Preço de atacado',
        special_price DECIMAL(10,2) COMMENT 'Preço promocional',
        special_price_start DATE,
        special_price_end DATE,
        cost_price DECIMAL(10,2) COMMENT 'Custo médio',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Tabela product_purchases
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        supplier_id INT,
        purchase_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        purchase_date DATE NOT NULL,
        batch_number VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Tabela product_sales
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        customer_id INT,
        sale_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        discount_percent DECIMAL(5,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Tabela inventory_movements
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        movement_type ENUM('purchase', 'sale', 'adjustment', 'return', 'loss') NOT NULL,
        quantity DECIMAL(10,3) NOT NULL COMMENT 'Pode ser fracionado para itens que usam casas decimais',
        reference_id INT COMMENT 'ID da transação relacionada',
        reference_type VARCHAR(50) COMMENT 'Tipo de transação relacionada',
        notes TEXT,
        created_by INT COMMENT 'ID do usuário que realizou o movimento',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Habilita novamente as verificações de chave estrangeira
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Tabelas criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar as tabelas:', error);
    throw error;
  } finally {
    if (connection) await connection.release();
  }
}

// Função principal
async function main() {
  try {
    // Configura o banco de dados e o usuário
    const dbSetup = await setupDatabase();
    if (!dbSetup) {
      console.error('❌ Falha na configuração inicial do banco de dados.');
      process.exit(1);
    }
    
    // Inicializa o banco de dados
    console.log('🔄 Inicializando as tabelas do banco de dados...');
    await initializeDatabase();
    
    // Testa a conexão
    console.log('🔍 Testando conexão com o banco de dados...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      throw new Error('Falha ao conectar ao banco de dados após a inicialização');
    }
    
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    console.log('✨ Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a inicialização do banco de dados:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executa a inicialização
main().catch(error => {
  console.error('❌ Erro não tratado:', error);
  process.exit(1);
});
