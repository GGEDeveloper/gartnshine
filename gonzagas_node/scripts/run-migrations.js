const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
const { promisify } = require('util');
const readline = require('readline');
require('dotenv').config();

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_ROOT_USER || 'root',
  password: process.env.DB_ROOT_PASSWORD || '',
  database: process.env.DB_NAME || 'gonzagas_db',
  multipleStatements: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'local'
};

// Diretório de migrações
const MIGRATIONS_BASE_DIR = path.join(__dirname, '..', 'database', 'migrations');
const MODULES = ['core', 'inventory', 'purchasing', 'sales', 'reporting'];

// Tabela para controle de migrações
const MIGRATION_TABLE = 'database_migrations';

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Configuração do logger
const logger = {
  info: (message) => console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`),
  success: (message) => console.log(`${colors.green}✅ [SUCESSO]${colors.reset} ${message}`),
  warn: (message) => console.log(`${colors.yellow}⚠️  [AVISO]${colors.reset} ${message}`),
  error: (message) => console.error(`${colors.red}❌ [ERRO]${colors.reset} ${message}`),
  debug: (message) => process.env.DEBUG && console.log(`${colors.blue}[DEBUG]${colors.reset} ${message}`)
};

// Interface para leitura de input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

// Configuração de argumentos de linha de comando
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force') || args.includes('-f'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  dryRun: args.includes('--dry-run') || args.includes('-d'),
  module: (args.find(arg => arg.startsWith('--module=')) || '').split('=')[1] || null
};

/**
 * Verifica se o módulo deve ser processado com base nas opções fornecidas
 * @param {string} moduleName - Nome do módulo
 * @returns {boolean} Verdadeiro se o módulo deve ser processado
 */
function shouldProcessModule(moduleName) {
  if (!options.module) return true;
  return moduleName === options.module;
}

/**
 * Obtém a lista de arquivos de migração de um módulo
 * @param {string} moduleDir - Diretório do módulo
 * @returns {Promise<Array<{file: string, path: string}>>} Lista de arquivos de migração
 */
async function getMigrationFiles(moduleDir) {
  try {
    const files = await fs.readdir(moduleDir);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort()
      .map(file => ({
        file,
        path: path.join(moduleDir, file),
        module: path.basename(moduleDir)
      }));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Executa uma migração individual
 * @param {Object} connection - Conexão com o banco de dados
 * @param {string} filePath - Caminho para o arquivo de migração
 * @param {string} fileName - Nome do arquivo de migração
 * @param {string} moduleName - Nome do módulo
 * @returns {Promise<boolean>} Verdadeiro se a migração foi bem-sucedida
 */
async function runMigration(connection, filePath, fileName, moduleName) {
  const migrationName = `[${moduleName}] ${fileName}`;
  
  try {
    const migrationSQL = await fs.readFile(filePath, 'utf8');
    
    if (options.dryRun) {
      logger.info(`[DRY RUN] Executaria migração: ${migrationName}`);
      return true;
    }
    
    logger.info(`Executando migração: ${migrationName}`);
    
    // Iniciar transação
    await connection.beginTransaction();
    
    try {
      // Executar migração
      await connection.query(migrationSQL);
      
      // Registrar migração
      await connection.query(
        `INSERT INTO ${MIGRATION_TABLE} (name, module) VALUES (?, ?)`,
        [fileName, moduleName]
      );
      
      // Commit da transação
      await connection.commit();
      logger.success(`Migração concluída: ${migrationName}`);
      return true;
    } catch (error) {
      // Rollback em caso de erro
      await connection.rollback();
      logger.error(`Erro na migração ${migrationName}: ${error.message}`);
      if (options.verbose) {
        console.error(error);
      }
      return false;
    }
  } catch (error) {
    logger.error(`Falha ao processar o arquivo ${migrationName}: ${error.message}`);
    if (options.verbose) {
      console.error(error);
    }
    return false;
  }
}

/**
 * Função principal para execução das migrações
 */
async function runMigrations() {
  let connection;
  let success = true;
  
  try {
    logger.info('Iniciando processo de migração...');
    
    // Exibir opções ativas
    if (options.dryRun) {
      logger.warn('MODO SIMULAÇÃO ATIVADO - Nenhuma alteração será feita no banco de dados');
    }
    if (options.force) {
      logger.warn('MODO FORÇADO ATIVADO - Ignorando erros e continuando');
    }
    if (options.module) {
      logger.info(`Apenas módulo: ${options.module}`);
    }
    
    // Conectar ao banco de dados
    logger.info('Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    
    // Criar tabela de controle de migrações se não existir
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        module VARCHAR(50) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_migration_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    // Obter migrações já executadas
    const [executedMigrations] = await connection.query(
      `SELECT name, module FROM ${MIGRATION_TABLE} ORDER BY module, name`
    );
    const executedMigrationMap = new Map(
      executedMigrations.map(m => [`${m.module}:${m.name}`, true])
    );
    
    logger.info(`Encontradas ${executedMigrations.length} migrações já executadas`);
    
    // Processar cada módulo
    for (const moduleName of MODULES) {
      if (!shouldProcessModule(moduleName)) continue;
      
      const moduleDir = path.join(MIGRATIONS_BASE_DIR, moduleName);
      logger.info(`\nProcessando módulo: ${moduleName}`);
      
      try {
        // Obter arquivos de migração do módulo
        const migrationFiles = await getMigrationFiles(moduleDir);
        
        if (migrationFiles.length === 0) {
          logger.warn(`Nenhuma migração encontrada para o módulo ${moduleName}`);
          continue;
        }
        
        logger.info(`Encontradas ${migrationFiles.length} migrações no módulo`);
        
        // Executar migrações pendentes
        for (const { file, path: filePath } of migrationFiles) {
          const migrationKey = `${moduleName}:${file}`;
          
          if (executedMigrationMap.has(migrationKey) && !options.force) {
            logger.info(`⏭️  Migração já executada: ${file}`);
            continue;
          }
          
          const migrationSuccess = await runMigration(connection, filePath, file, moduleName);
          
          if (!migrationSuccess && !options.force) {
            logger.error(`Falha na migração ${file}. Abortando...`);
            success = false;
            break;
          }
          
          // Pequena pausa entre migrações
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!success && !options.force) break;
      } catch (error) {
        logger.error(`Erro ao processar o módulo ${moduleName}: ${error.message}`);
        if (options.verbose) {
          console.error(error);
        }
        if (!options.force) {
          success = false;
          break;
        }
      }
    }
    
    if (success) {
      logger.success('\n✨ Todas as migrações foram processadas com sucesso!');
    } else {
      logger.error('\n❌ Ocorreram erros durante a migração');
      process.exit(1);
    }
  } catch (error) {
    logger.error(`Erro durante a execução das migrações: ${error.message}`);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (error) {
        logger.error(`Erro ao fechar a conexão: ${error.message}`);
      }
    }
    rl.close();
  }
}

// Documentação de uso
function showHelp() {
  console.log(`
Uso: node scripts/run-migrations.js [opções]

Opções:
  --module=<nome>    Executa apenas as migrações do módulo especificado
  --dry-run, -d      Executa em modo de simulação (não aplica alterações)
  --force, -f        Continua a execução mesmo em caso de erros
  --verbose, -v      Exibe informações detalhadas de depuração
  --help, -h         Exibe esta mensagem de ajuda

Exemplos:
  # Executar todas as migrações
  node scripts/run-migrations.js

  # Executar apenas as migrações do módulo de estoque
  node scripts/run-migrations.js --module=inventory

  # Executar em modo de simulação
  node scripts/run-migrations.js --dry-run

  # Executar com saída detalhada
  node scripts/run-migrations.js --verbose
  `);
  process.exit(0);
}

// Verificar se o usuário solicitou ajuda
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
}

// Executar migrações
runMigrations();
