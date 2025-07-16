#!/usr/bin/env node

/**
 * Script para criar a tabela de consentimentos de cookies (RGPD)
 * Gonzaga's Art & Shine
 */

require('dotenv').config();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createCookieTable() {
  console.log('🍪 Criando tabela de consentimentos de cookies...');
  
  try {
    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, '../sql/create_cookie_consents_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Executar o SQL
    await pool.query(sql);
    
    console.log('✅ Tabela cookie_consents criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'cookie_consents'
    `);
    
    if (rows[0].count > 0) {
      console.log('✅ Tabela verificada e está funcionando!');
      
      // Mostrar estrutura da tabela
      const [structure] = await pool.query('DESCRIBE cookie_consents');
      console.log('\n📋 Estrutura da tabela:');
      console.table(structure);
      
    } else {
      console.error('❌ Erro: Tabela não foi criada corretamente');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela de cookies:', error.message);
    
    // Se a tabela já existir, não é um erro crítico
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('⚠️  Tabela já existe, continuando...');
    } else {
      process.exit(1);
    }
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando criação da tabela de cookies RGPD...');
    
    // Testar conexão com o banco
    await pool.query('SELECT 1');
    console.log('✅ Conexão com banco de dados estabelecida!');
    
    // Criar tabela
    await createCookieTable();
    
    console.log('\n🎉 Processo concluído com sucesso!');
    console.log('📝 A tabela cookie_consents está pronta para armazenar consentimentos RGPD');
    
    // Fechar conexão
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro no processo:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { createCookieTable }; 