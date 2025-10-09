#!/usr/bin/env node
/**
 * E-commerce Tables Migration Runner
 * Creates orders and order_items tables with proper indexes
 */

require('dotenv').config();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    console.log('\n🚀 Starting E-commerce Tables Migration...\n');
    
    try {
        // Read SQL file
        const sqlPath = path.join(__dirname, 'create_ecommerce_tables.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Remove comments first, then split statements
        const noComments = sqlContent
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');
        
        const statements = noComments
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt && !stmt.startsWith('SELECT') && stmt.length > 10);
        
        console.log(`📋 Found ${statements.length} SQL statements to execute\n`);
        
        // Get a connection for transaction
        const connection = await pool.getConnection();
        
        try {
            // Execute each statement
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                if (statement) {
                    const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
                    console.log(`⚡ Executing statement ${i + 1}/${statements.length}: ${preview}...`);
                    await connection.query(statement);
                    console.log(`✅ Statement ${i + 1} completed\n`);
                }
            }
        } finally {
            connection.release();
        }
        
        console.log('✨ Migration completed successfully!\n');
        
        // Verify tables were created
        const [tables] = await pool.execute(`
            SHOW TABLES LIKE 'orders'
        `);
        const [orderItemsTables] = await pool.execute(`
            SHOW TABLES LIKE 'order_items'
        `);
        
        if (tables.length > 0 && orderItemsTables.length > 0) {
            console.log('✅ Verified: orders table exists');
            console.log('✅ Verified: order_items table exists\n');
            
            // Show table structures
            const [ordersDesc] = await pool.execute('DESCRIBE orders');
            const [orderItemsDesc] = await pool.execute('DESCRIBE order_items');
            
            console.log('📊 Orders Table Structure:');
            console.table(ordersDesc);
            
            console.log('\n📊 Order Items Table Structure:');
            console.table(orderItemsDesc);
            
            // Show indexes
            const [ordersIndexes] = await pool.execute('SHOW INDEX FROM orders');
            const [orderItemsIndexes] = await pool.execute('SHOW INDEX FROM order_items');
            
            console.log('\n🔍 Orders Indexes:');
            console.table(ordersIndexes.map(idx => ({
                Column: idx.Column_name,
                Index: idx.Key_name,
                Unique: idx.Non_unique === 0 ? 'Yes' : 'No'
            })));
            
            console.log('\n🔍 Order Items Indexes:');
            console.table(orderItemsIndexes.map(idx => ({
                Column: idx.Column_name,
                Index: idx.Key_name,
                Unique: idx.Non_unique === 0 ? 'Yes' : 'No'
            })));
        } else {
            console.log('⚠️  Warning: Could not verify table creation');
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Migration failed:');
        console.error(error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

// Run migration
runMigration();

