#!/usr/bin/env node
/**
 * Adiciona ou atualiza um utilizador admin.
 * Uso: node scripts/add-admin-user.js <email> <password>
 * Exemplo: node scripts/add-admin-user.js miguelmelo70@gmail.com 2585
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function addAdminUser(email, password, name = 'Admin') {
  if (!email || !password) {
    console.error('Uso: node scripts/add-admin-user.js <email> <password>');
    process.exit(1);
  }

  try {
    const [existing] = await pool.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      [email]
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing.length > 0) {
      await pool.query(
        'UPDATE users SET password = ?, role = ?, name = ? WHERE email = ?',
        [hashedPassword, 'admin', name || existing[0].name, email]
      );
      console.log(`✅ Utilizador ${email} atualizado como admin.`);
    } else {
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'admin']
      );
      console.log(`✅ Utilizador admin criado: ${email}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  }
}

const [,, email, password, name] = process.argv;
addAdminUser(email, password, name);
