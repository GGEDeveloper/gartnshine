#!/usr/bin/env node
/**
 * Check product images in database
 */

require('dotenv').config();
const { pool } = require('./config/database');

async function checkProductImages() {
    console.log('\n🔍 Checking product images in database...\n');
    
    try {
        // First check table structure
        const [columns] = await pool.execute(`DESCRIBE products`);
        
        console.log('📋 ALL Products table columns:');
        console.table(columns.map(c => ({ Field: c.Field, Type: c.Type })));
        
        // Get sample products
        const [products] = await pool.execute(`
            SELECT id, name, reference
            FROM products 
            WHERE id IN (1, 4, 190, 191, 192, 193, 194, 195, 196, 197)
            ORDER BY id
        `);
        
        console.log('\n📊 Product Sample:');
        console.table(products);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkProductImages();

