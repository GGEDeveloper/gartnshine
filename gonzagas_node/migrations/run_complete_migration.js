#!/usr/bin/env node
/**
 * Complete E-commerce Migration Runner
 * Executes the full database schema for Dark Nature E-commerce + Admin
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    let connection;
    
    try {
        console.log('\n🚀 Iniciando migrações database completas...\n');
        
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gonzagas_local',
            multipleStatements: true
        });
        
        console.log('✅ Conectado à database:', process.env.DB_NAME || 'gonzagas_local');
        
        // Read migration SQL file
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'create_complete_ecommerce.sql'), 
            'utf8'
        );
        
        console.log('📄 Executando migrações SQL...\n');
        
        // Execute all statements
        await connection.query(migrationSQL);
        
        console.log('✅ Migrações executadas com sucesso!\n');
        
        // Verify tables created
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`📊 Total de tabelas na database: ${tables.length}`);
        console.log('\n📋 Tabelas relevantes criadas/verificadas:');
        
        const relevantTables = [
            'orders',
            'order_items',
            'customers',
            'admin_users',
            'product_analytics',
            'activity_log',
            'cart_sessions',
            'site_settings'
        ];
        
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            if (relevantTables.includes(tableName)) {
                console.log(`   ✅ ${tableName}`);
            }
        });
        
        // Verify admin user exists
        const [adminRows] = await connection.execute(
            'SELECT username, email, role FROM admin_users WHERE username = ?',
            ['gonzaga']
        );
        
        console.log('\n👤 Admin User:');
        if (adminRows.length > 0) {
            console.log(`   ✅ Username: ${adminRows[0].username}`);
            console.log(`   ✅ Email: ${adminRows[0].email}`);
            console.log(`   ✅ Role: ${adminRows[0].role}`);
            console.log(`   ✅ Password: covil`);
        } else {
            console.log('   ⚠️ Admin user not created (may already exist with different password)');
        }
        
        // Verify triggers
        const [triggers] = await connection.query('SHOW TRIGGERS');
        console.log(`\n⚡ Triggers: ${triggers.length} ativos`);
        triggers.forEach(trigger => {
            console.log(`   - ${trigger.Trigger}`);
        });
        
        console.log('\n🎉 SETUP DATABASE COMPLETO!\n');
        console.log('📋 PRÓXIMOS PASSOS:');
        console.log('   1. Verificar .env configurado');
        console.log('   2. npm run dev');
        console.log('   3. Admin: http://localhost:3000/admin/login');
        console.log('   4. Login: gonzaga / covil\n');
        
    } catch (error) {
        console.error('\n❌ Erro nas migrações:', error.message);
        console.error('\nStack:', error.stack);
        process.exit(1);
        
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexão database encerrada.\n');
        }
    }
}

// Execute if called directly
if (require.main === module) {
    runMigrations();
}

module.exports = runMigrations;

