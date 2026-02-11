#!/usr/bin/env node
/**
 * Script para fazer dump de backup da base de dados.
 * Usa credenciais do .env em gonzagas_node/
 * 
 * Uso: node _dev-info/scripts/backup-db.js
 *      (executar a partir da raiz do projeto)
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Carregar .env manualmente (sem dependência de dotenv)
const possibleEnvPaths = [
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '../../gonzagas_node/.env'),
  path.join(__dirname, '../../.env'),
];
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
    console.log(`Env carregado: ${envPath}`);
    break;
  }
}

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'gonzagas';

const backupsDir = path.join(__dirname, '../db-backups');
const schemaDir = path.join(__dirname, '../schema');

// Garantir que as pastas existem
[backupsDir, schemaDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Criada pasta: ${dir}`);
  }
});

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFile = path.join(backupsDir, `gonzagas_backup_${timestamp.replace(/-/g, '')}.sql`);
const schemaFile = path.join(schemaDir, `schema_${timestamp.replace(/-/g, '').slice(0, 8)}.sql`);

console.log('=== Backup da Base de Dados ===');
console.log(`DB: ${DB_NAME} @ ${DB_HOST}:${DB_PORT}`);
console.log(`User: ${DB_USER}`);
console.log('');

try {
  // Dump completo (estrutura + dados)
  const dumpCmd = `mysqldump -u"${DB_USER}" -p"${DB_PASSWORD}" -h"${DB_HOST}" -P"${DB_PORT}" --single-transaction --routines --triggers --add-drop-table "${DB_NAME}" > "${backupFile}"`;
  execSync(dumpCmd, { stdio: 'inherit', shell: true });
  console.log(`\n✅ Backup completo guardado: ${backupFile}`);
  console.log(`   Tamanho: ${(fs.statSync(backupFile).size / 1024).toFixed(1)} KB`);

  // Dump só da estrutura (schema) para análise
  const schemaCmd = `mysqldump -u"${DB_USER}" -p"${DB_PASSWORD}" -h"${DB_HOST}" -P"${DB_PORT}" --no-data --skip-add-drop-table "${DB_NAME}" > "${schemaFile}"`;
  execSync(schemaCmd, { stdio: 'inherit', shell: true });
  console.log(`\n✅ Schema guardado: ${schemaFile}`);

} catch (error) {
  console.error('\n❌ Erro no backup:', error.message);
  console.log('\nVerifique:');
  console.log('  1. MySQL/MariaDB está a correr');
  console.log('  2. Credenciais em gonzagas_node/.env');
  console.log('  3. A base de dados existe');
  process.exit(1);
}
