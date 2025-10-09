const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'create_ecommerce_tables.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Remove comments first, then split
const noComments = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

const statements = noComments
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt && !stmt.startsWith('SELECT') && stmt.length > 10);

console.log('Number of statements:', statements.length);
console.log('\n=== STATEMENTS ===\n');

statements.forEach((stmt, i) => {
    const preview = stmt.substring(0, 100).replace(/\s+/g, ' ');
    console.log(`${i + 1}. ${preview}...`);
    console.log('---');
});

