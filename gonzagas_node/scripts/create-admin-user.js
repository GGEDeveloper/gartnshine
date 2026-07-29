require('dotenv').config();
const User = require('../models/User');
const { pool } = require('../config/database');

async function createAdminUser() {
  try {
    const adminExists = await User.findByEmail('g.art.shine@gmail.com');

    if (adminExists) {
      console.log('Usuário administrador já existe.');
      console.log('Email: g.art.shine@gmail.com');
      return;
    }

    await User.create({
      name: 'Gonzaga',
      email: 'g.art.shine@gmail.com',
      password: 'covil',
      role: 'admin'
    });

    console.log('Usuário administrador criado com sucesso!');
    console.log('Email: g.art.shine@gmail.com');
    console.log('Senha: covil');
    console.log('Por favor, altere a senha após o primeiro login.');
  } catch (error) {
    console.error('Erro ao criar usuário administrador:');
    console.error(error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAdminUser();
