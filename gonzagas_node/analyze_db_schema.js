#!/usr/bin/env node

/**
 * GONZAGA'S ART & SHINE - DATABASE SCHEMA ANALYZER
 * Analisa estrutura completa da DB para validar o que existe
 * antes de fazer alterações para a PDP
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Cores para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

// Configuração do DB (vai tentar carregar do .env)
let dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gonzagas_db'
};

// Colunas necessárias para PDP
const REQUIRED_PDP_COLUMNS = {
    products: [
        { name: 'slug', type: 'VARCHAR(255)', nullable: true, comment: 'URL-friendly identifier' },
        { name: 'stone_type', type: 'VARCHAR(50)', nullable: true, comment: 'Type of stone (onix, olho-de-tigre, etc)' },
        { name: 'stone_name', type: 'VARCHAR(100)', nullable: true, comment: 'Display name of stone' },
        { name: 'stone_origin', type: 'VARCHAR(255)', nullable: true, comment: 'Geographic origin of stone' },
        { name: 'stone_properties', type: 'TEXT', nullable: true, comment: 'Metaphysical properties' },
        { name: 'metal_name', type: 'VARCHAR(100)', nullable: true, default: 'Prata 925', comment: 'Display name of metal' },
        { name: 'metal_finish', type: 'VARCHAR(50)', nullable: true, default: 'prata_925', comment: 'Metal finish code' },
        { name: 'metal_purity', type: 'VARCHAR(20)', nullable: true, default: '925', comment: 'Metal purity level' },
        { name: 'artisan_name', type: 'VARCHAR(255)', nullable: true, comment: 'Artisan creator name' },
        { name: 'artisan_workshop', type: 'VARCHAR(255)', nullable: true, comment: 'Workshop name' },
        { name: 'artisan_specialty', type: 'TEXT', nullable: true, comment: 'Artisan specialty description' },
        { name: 'crafting_technique', type: 'TEXT', nullable: true, comment: 'Crafting technique used' },
        { name: 'weight', type: 'VARCHAR(50)', nullable: true, comment: 'Product weight' },
        { name: 'dimensions', type: 'VARCHAR(100)', nullable: true, comment: 'Product dimensions' },
        { name: 'meta_title', type: 'VARCHAR(255)', nullable: true, comment: 'SEO meta title' },
        { name: 'meta_description', type: 'TEXT', nullable: true, comment: 'SEO meta description' },
        { name: 'views', type: 'INT', nullable: true, default: 0, comment: 'Page view counter' }
    ]
};

async function loadEnvConfig() {
    try {
        const envPath = path.join(__dirname, '.env');
        const envContent = await fs.readFile(envPath, 'utf8');
        
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^#=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                
                if (key === 'DB_HOST') dbConfig.host = value;
                if (key === 'DB_USER') dbConfig.user = value;
                if (key === 'DB_PASSWORD') dbConfig.password = value;
                if (key === 'DB_NAME') dbConfig.database = value;
            }
        });
        
        console.log(`${colors.green}✓ Config loaded from .env${colors.reset}`);
    } catch (error) {
        console.log(`${colors.yellow}⚠ .env not found, using defaults${colors.reset}`);
    }
}

async function analyzeDatabase() {
    let connection;
    
    try {
        console.log(`\n${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.bright}  GONZAGA'S ART & SHINE - DATABASE SCHEMA ANALYZER${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);
        
        // Carregar config
        await loadEnvConfig();
        
        console.log(`${colors.cyan}Connecting to database...${colors.reset}`);
        console.log(`  Host: ${dbConfig.host}`);
        console.log(`  Database: ${dbConfig.database}`);
        console.log(`  User: ${dbConfig.user}`);
        console.log('');
        
        // Conectar
        connection = await mysql.createConnection(dbConfig);
        console.log(`${colors.green}✓ Connected successfully!${colors.reset}\n`);
        
        // Análise completa
        const analysis = {
            timestamp: new Date().toISOString(),
            database: dbConfig.database,
            tables: {},
            pdp_analysis: {
                missing_columns: [],
                existing_columns: [],
                needs_creation: []
            }
        };
        
        // 1. Listar todas as tabelas
        console.log(`${colors.bright}1. Analyzing Tables...${colors.reset}`);
        const [tables] = await connection.query(
            `SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME 
             FROM information_schema.TABLES 
             WHERE TABLE_SCHEMA = ?`,
            [dbConfig.database]
        );
        
        console.log(`   Found ${colors.green}${tables.length}${colors.reset} tables\n`);
        
        // 2. Para cada tabela, obter estrutura
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            console.log(`${colors.cyan}   → ${tableName}${colors.reset} (${table.TABLE_ROWS} rows)`);
            
            // Colunas
            const [columns] = await connection.query(
                `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA, COLUMN_COMMENT
                 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                 ORDER BY ORDINAL_POSITION`,
                [dbConfig.database, tableName]
            );
            
            // Índices
            const [indexes] = await connection.query(
                `SHOW INDEXES FROM ${tableName}`
            );
            
            // Foreign Keys
            const [foreignKeys] = await connection.query(
                `SELECT 
                    CONSTRAINT_NAME,
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                 FROM information_schema.KEY_COLUMN_USAGE
                 WHERE TABLE_SCHEMA = ? 
                   AND TABLE_NAME = ?
                   AND REFERENCED_TABLE_NAME IS NOT NULL`,
                [dbConfig.database, tableName]
            );
            
            analysis.tables[tableName] = {
                row_count: table.TABLE_ROWS,
                created_at: table.CREATE_TIME,
                columns: columns.map(col => ({
                    name: col.COLUMN_NAME,
                    type: col.DATA_TYPE,
                    full_type: col.COLUMN_TYPE,
                    nullable: col.IS_NULLABLE === 'YES',
                    default: col.COLUMN_DEFAULT,
                    key: col.COLUMN_KEY,
                    extra: col.EXTRA,
                    comment: col.COLUMN_COMMENT
                })),
                indexes: indexes.map(idx => ({
                    name: idx.Key_name,
                    column: idx.Column_name,
                    unique: idx.Non_unique === 0
                })),
                foreign_keys: foreignKeys.map(fk => ({
                    constraint: fk.CONSTRAINT_NAME,
                    column: fk.COLUMN_NAME,
                    references: `${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`
                }))
            };
            
            console.log(`     ${colors.blue}${columns.length} columns${colors.reset}, ${colors.blue}${indexes.length} indexes${colors.reset}, ${colors.blue}${foreignKeys.length} foreign keys${colors.reset}`);
        }
        
        console.log('');
        
        // 3. Análise específica para PDP (tabela products)
        console.log(`${colors.bright}2. PDP Requirements Analysis...${colors.reset}\n`);
        
        if (analysis.tables.products) {
            const existingColumns = analysis.tables.products.columns.map(c => c.name);
            
            REQUIRED_PDP_COLUMNS.products.forEach(requiredCol => {
                if (existingColumns.includes(requiredCol.name)) {
                    analysis.pdp_analysis.existing_columns.push(requiredCol.name);
                    console.log(`   ${colors.green}✓${colors.reset} ${requiredCol.name} ${colors.green}(exists)${colors.reset}`);
                } else {
                    analysis.pdp_analysis.missing_columns.push(requiredCol);
                    console.log(`   ${colors.red}✗${colors.reset} ${requiredCol.name} ${colors.red}(MISSING)${colors.reset} - ${requiredCol.comment}`);
                }
            });
            
            console.log('');
            console.log(`   Summary: ${colors.green}${analysis.pdp_analysis.existing_columns.length} exist${colors.reset}, ${colors.red}${analysis.pdp_analysis.missing_columns.length} missing${colors.reset}`);
        } else {
            console.log(`   ${colors.red}✗ Table 'products' not found!${colors.reset}`);
        }
        
        console.log('');
        
        // 4. Verificar tabela product_images
        console.log(`${colors.bright}3. Related Tables Check...${colors.reset}\n`);
        
        if (analysis.tables.product_images) {
            console.log(`   ${colors.green}✓${colors.reset} product_images ${colors.green}(exists)${colors.reset}`);
            console.log(`     Columns: ${analysis.tables.product_images.columns.map(c => c.name).join(', ')}`);
        } else {
            console.log(`   ${colors.red}✗${colors.reset} product_images ${colors.red}(MISSING)${colors.reset}`);
            analysis.pdp_analysis.needs_creation.push('product_images');
        }
        
        if (analysis.tables.product_families) {
            console.log(`   ${colors.green}✓${colors.reset} product_families ${colors.green}(exists)${colors.reset}`);
        } else {
            console.log(`   ${colors.yellow}⚠${colors.reset} product_families ${colors.yellow}(NOT FOUND)${colors.reset}`);
        }
        
        console.log('');
        
        // 5. Salvar análise em arquivo JSON
        const outputPath = path.join(__dirname, 'db_schema_analysis.json');
        await fs.writeFile(outputPath, JSON.stringify(analysis, null, 2));
        
        console.log(`${colors.green}✓ Full analysis saved to: db_schema_analysis.json${colors.reset}`);
        
        // 6. Gerar SQL de migração se necessário
        if (analysis.pdp_analysis.missing_columns.length > 0) {
            console.log('');
            console.log(`${colors.bright}4. Generating Migration SQL...${colors.reset}\n`);
            
            let migrationSQL = `-- =============================================\n`;
            migrationSQL += `-- PDP MIGRATION - Generated ${new Date().toISOString()}\n`;
            migrationSQL += `-- Missing columns: ${analysis.pdp_analysis.missing_columns.length}\n`;
            migrationSQL += `-- =============================================\n\n`;
            
            migrationSQL += `USE ${dbConfig.database};\n\n`;
            
            analysis.pdp_analysis.missing_columns.forEach(col => {
                migrationSQL += `-- Add ${col.name} (${col.comment})\n`;
                migrationSQL += `ALTER TABLE products ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
                
                if (col.nullable) {
                    migrationSQL += ` NULL`;
                } else {
                    migrationSQL += ` NOT NULL`;
                }
                
                if (col.default !== undefined) {
                    if (typeof col.default === 'string') {
                        migrationSQL += ` DEFAULT '${col.default}'`;
                    } else {
                        migrationSQL += ` DEFAULT ${col.default}`;
                    }
                }
                
                if (col.comment) {
                    migrationSQL += ` COMMENT '${col.comment}'`;
                }
                
                migrationSQL += `;\n\n`;
            });
            
            // Adicionar índices
            migrationSQL += `-- Add indexes for performance\n`;
            migrationSQL += `ALTER TABLE products ADD INDEX IF NOT EXISTS idx_slug (slug);\n`;
            migrationSQL += `ALTER TABLE products ADD INDEX IF NOT EXISTS idx_stone_type (stone_type);\n`;
            migrationSQL += `ALTER TABLE products ADD INDEX IF NOT EXISTS idx_metal_finish (metal_finish);\n`;
            migrationSQL += `ALTER TABLE products ADD INDEX IF NOT EXISTS idx_featured_active (featured, is_active);\n\n`;
            
            // Gerar slugs para produtos existentes
            migrationSQL += `-- Generate slugs for existing products\n`;
            migrationSQL += `UPDATE products SET slug = LOWER(\n`;
            migrationSQL += `    REPLACE(\n`;
            migrationSQL += `        REPLACE(\n`;
            migrationSQL += `            REPLACE(\n`;
            migrationSQL += `                REPLACE(\n`;
            migrationSQL += `                    REPLACE(name, 'ã', 'a'),\n`;
            migrationSQL += `                    'õ', 'o'\n`;
            migrationSQL += `                ),\n`;
            migrationSQL += `                'é', 'e'\n`;
            migrationSQL += `            ),\n`;
            migrationSQL += `            ' ', '-'\n`;
            migrationSQL += `        ),\n`;
            migrationSQL += `        'ç', 'c'\n`;
            migrationSQL += `    )\n`;
            migrationSQL += `)\n`;
            migrationSQL += `WHERE slug IS NULL OR slug = '';\n\n`;
            
            migrationSQL += `-- Verification\n`;
            migrationSQL += `SELECT 'Migration complete!' as status;\n`;
            migrationSQL += `SELECT COUNT(*) as products_with_slug FROM products WHERE slug IS NOT NULL;\n`;
            
            const migrationPath = path.join(__dirname, 'pdp_migration_GENERATED.sql');
            await fs.writeFile(migrationPath, migrationSQL);
            
            console.log(`   ${colors.green}✓ Migration SQL generated: pdp_migration_GENERATED.sql${colors.reset}`);
        }
        
        // 7. Resumo final
        console.log('');
        console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.bright}  ANALYSIS SUMMARY${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);
        
        console.log(`${colors.bright}Database:${colors.reset} ${dbConfig.database}`);
        console.log(`${colors.bright}Total Tables:${colors.reset} ${Object.keys(analysis.tables).length}`);
        console.log('');
        
        console.log(`${colors.bright}PDP Status:${colors.reset}`);
        console.log(`  ${colors.green}✓ Existing columns:${colors.reset} ${analysis.pdp_analysis.existing_columns.length}`);
        console.log(`  ${colors.red}✗ Missing columns:${colors.reset} ${analysis.pdp_analysis.missing_columns.length}`);
        
        if (analysis.pdp_analysis.missing_columns.length > 0) {
            console.log('');
            console.log(`${colors.yellow}⚠  ACTION REQUIRED:${colors.reset}`);
            console.log(`   Review pdp_migration_GENERATED.sql and execute if correct`);
        } else {
            console.log('');
            console.log(`${colors.green}✓ All PDP columns exist! Ready to use.${colors.reset}`);
        }
        
        console.log('');
        console.log(`${colors.bright}Files Generated:${colors.reset}`);
        console.log(`  → db_schema_analysis.json (full schema)`);
        if (analysis.pdp_analysis.missing_columns.length > 0) {
            console.log(`  → pdp_migration_GENERATED.sql (migration script)`);
        }
        
        console.log('');
        console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}\n`);
        
    } catch (error) {
        console.error(`\n${colors.red}✗ Error:${colors.reset}`, error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log(`${colors.cyan}Connection closed.${colors.reset}\n`);
        }
    }
}

// Executar análise
analyzeDatabase();

