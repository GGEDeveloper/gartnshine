require('dotenv').config();
const User = require('../models/User');
const { pool } = require('../config/database');

async function updateAdminPassword() {
  try {
    const admin = await User.findByEmail('admin@gonzagas.com');

    if (!admin) {
      console.log('Usuário administrador não encontrado.');
      return;
    }

    await User.update(admin.id, { password: 'admin123' });

    console.log('Senha do usuário administrador atualizada com sucesso!');
    console.log('Email: admin@gonzagas.com');
    console.log('Nova senha: admin123');
    console.log('Por favor, altere a senha após o primeiro login.');
  } catch (error) {
    console.error('Erro ao atualizar a senha do administrador:');
    console.error(error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

updateAdminPassword();
