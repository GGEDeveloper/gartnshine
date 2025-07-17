const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function createProductionDump() {
    console.log('🗄️  Creating production database dump...');
    
    const dumpFile = path.join(__dirname, '..', 'gonzagas_production_dump.sql');
    let sqlContent = '';
    
    try {
        // Header with database creation
        sqlContent += `-- Gonzaga's Art & Shine - Production Database Dump\n`;
        sqlContent += `-- Generated on: ${new Date().toISOString()}\n`;
        sqlContent += `-- Source: gonzagas_local\n\n`;
        
        sqlContent += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
        sqlContent += `SET AUTOCOMMIT = 0;\n`;
        sqlContent += `START TRANSACTION;\n`;
        sqlContent += `SET time_zone = "+00:00";\n\n`;
        
        sqlContent += `/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;\n`;
        sqlContent += `/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;\n`;
        sqlContent += `/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;\n`;
        sqlContent += `/*!40101 SET NAMES utf8mb4 */;\n\n`;
        
        // Get all tables
        const [tables] = await pool.execute('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);
        
        console.log(`📊 Found ${tableNames.length} tables to export`);
        
        for (const tableName of tableNames) {
            console.log(`  ➜ Exporting table: ${tableName}`);
            
            // Add table drop statement
            sqlContent += `--\n-- Table structure for table \`${tableName}\`\n--\n\n`;
            sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            
            // Get table structure
            const [createTable] = await pool.execute(`SHOW CREATE TABLE \`${tableName}\``);
            sqlContent += createTable[0]['Create Table'] + ';\n\n';
            
            // Get table data
            const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\``);
            
            if (rows.length > 0) {
                sqlContent += `--\n-- Dumping data for table \`${tableName}\`\n--\n\n`;
                
                // Get column names
                const [columns] = await pool.execute(`SHOW COLUMNS FROM \`${tableName}\``);
                const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
                
                sqlContent += `INSERT INTO \`${tableName}\` (${columnNames}) VALUES\n`;
                
                const values = rows.map(row => {
                    const rowValues = Object.values(row).map(value => {
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') {
                            // Escape single quotes and backslashes
                            return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
                        }
                        if (value instanceof Date) {
                            return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        }
                        return value;
                    });
                    return `(${rowValues.join(', ')})`;
                });
                
                sqlContent += values.join(',\n') + ';\n\n';
            } else {
                sqlContent += `-- No data for table \`${tableName}\`\n\n`;
            }
        }
        
        // Footer
        sqlContent += `COMMIT;\n\n`;
        sqlContent += `/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\n`;
        sqlContent += `/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;\n`;
        sqlContent += `/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;\n`;
        
        // Write to file
        fs.writeFileSync(dumpFile, sqlContent, 'utf8');
        
        console.log(`✅ Production dump created successfully!`);
        console.log(`📁 File: ${dumpFile}`);
        console.log(`📊 Size: ${(fs.statSync(dumpFile).size / 1024 / 1024).toFixed(2)} MB`);
        
        return dumpFile;
        
    } catch (error) {
        console.error('❌ Error creating production dump:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    createProductionDump()
        .then(() => {
            console.log('🎉 Database dump completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Failed to create database dump:', error);
            process.exit(1);
        });
}

module.exports = { createProductionDump }; 