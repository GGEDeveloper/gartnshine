require('dotenv').config();
const User = require('../models/User');
const { pool } = require('../config/database');

async function createUser() {
  try {
    const userExists = await User.findByEmail('miguelmelo70@gmail.com');
    if (userExists) {
      console.log('Usuário já existe.');
      console.log('Email: miguelmelo70@gmail.com');
      return;
    }

    await User.create({
      name: 'mike',
      email: 'miguelmelo70@gmail.com',
      password: '2585',
      role: 'admin'
    });

    console.log('Usuário criado com sucesso!');
    console.log('Email: miguelmelo70@gmail.com');
    console.log('Senha: 2585');
  } catch (error) {
    console.error('Erro ao criar usuário:');
    console.error(error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createUser();
