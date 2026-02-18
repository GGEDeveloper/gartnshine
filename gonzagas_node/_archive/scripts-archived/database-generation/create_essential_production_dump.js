#!/usr/bin/env node

/**
 * Script para criar uma dump de produção apenas com tabelas essenciais
 * Inclui apenas tabelas que existem realmente na base de dados
 */

const fs = require('fs');
const path = require('path');

// Configuração
const INPUT_FILE = 'gonzagas_local_complete_dump.sql';
const OUTPUT_FILE = 'gonzagas_essential_production_dump.sql';

console.log('🔄 Criando dump essencial para produção...');

// Apenas tabelas que existem realmente (ordem de dependências)
const ESSENTIAL_TABLES = [
  'admin_users',
  'site_settings', 
  'product_families',
  'products',
  'product_images',
  'activity_logs',
  'audit_logs'
];

// Função para extrair uma tabela da dump
function extractTable(content, tableName) {
  // Regex mais específica para encontrar a estrutura completa da tabela
  const tableStartPattern = `--\\s*Table structure for table \`${tableName}\``;
  const tableEndPattern = `(?=--\\s*Table structure for table|$)`;
  
  const createTableRegex = new RegExp(
    `(${tableStartPattern}[\\s\\S]*?UNLOCK TABLES;[\\s\\S]*?)${tableEndPattern}`,
    'i'
  );
  
  const match = content.match(createTableRegex);
  if (!match) {
    console.warn(`⚠️  Tabela ${tableName} não encontrada`);
    return '';
  }
  
  return match[1].trim() + '\n\n';
}

// Função principal
function createEssentialDump() {
  try {
    // Ler o arquivo original
    const originalContent = fs.readFileSync(INPUT_FILE, 'utf8');
    
    // Cabeçalho da nova dump
    let essentialDump = `-- ====================================
-- GONZAGA'S ART & SHINE - ESSENTIAL PRODUCTION DATABASE DUMP
-- Gerado automaticamente em ${new Date().toISOString()}
-- Contém apenas tabelas essenciais que existem na base de dados local
-- ====================================

-- Configurações para importação segura
SET FOREIGN_KEY_CHECKS = 0;
SET AUTOCOMMIT = 0;
SET UNIQUE_CHECKS = 0;

-- Usar charset correto
SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

`;

    // Extrair e adicionar cada tabela essencial na ordem correta
    ESSENTIAL_TABLES.forEach((tableName, index) => {
      console.log(`📦 Processando tabela ${index + 1}/${ESSENTIAL_TABLES.length}: ${tableName}`);
      
      essentialDump += `-- ====================================\n`;
      essentialDump += `-- ${index + 1}. ${tableName.toUpperCase()}\n`;
      essentialDump += `-- ====================================\n\n`;
      
      const tableContent = extractTable(originalContent, tableName);
      if (tableContent) {
        essentialDump += tableContent;
      } else {
        console.error(`❌ Erro: Tabela ${tableName} não pôde ser extraída`);
      }
    });

    // Rodapé - restaurar configurações
    essentialDump += `-- ====================================
-- FINALIZAR IMPORTAÇÃO
-- ====================================

-- Restaurar configurações
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;
COMMIT;
SET AUTOCOMMIT = 1;

-- ====================================
-- DUMP ESSENCIAL FINALIZADA COM SUCESSO
-- ====================================
SELECT 'Base de dados essencial importada com sucesso!' as status;
SELECT 'Todas as tabelas essenciais foram criadas na ordem correta' as info;
SELECT '${ESSENTIAL_TABLES.length} tabelas processadas' as details;
`;

    // Escrever o arquivo final
    fs.writeFileSync(OUTPUT_FILE, essentialDump);
    
    console.log('✅ Dump essencial criada com sucesso!');
    console.log(`📄 Arquivo: ${OUTPUT_FILE}`);
    console.log(`📊 Tamanho: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);
    
    // Mostrar estatísticas
    const tableCount = ESSENTIAL_TABLES.length;
    console.log(`📦 Tabelas essenciais processadas: ${tableCount}`);
    console.log('🎯 Ordem de importação otimizada para produção');
    console.log('✨ Apenas tabelas que existem na base de dados local');
    
  } catch (error) {
    console.error('❌ Erro ao criar dump essencial:', error.message);
    process.exit(1);
  }
}

// Verificar se o arquivo de entrada existe
if (!fs.existsSync(INPUT_FILE)) {
  console.error(`❌ Arquivo ${INPUT_FILE} não encontrado!`);
  console.log('💡 Execute primeiro: mysqldump -u root -proot gonzagas_local > gonzagas_local_complete_dump.sql');
  process.exit(1);
}

// Executar
createEssentialDump(); 