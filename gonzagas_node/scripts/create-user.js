require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');
const config = require('../config/config');

// Configuração do Sequelize
const sequelize = new Sequelize(
  config.database.database,
  config.database.username,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: false
  }
);

// Modelo de Usuário
const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING(100),
    allowNull: false
  },
  email: {
    type: Sequelize.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  role: {
    type: Sequelize.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  created_at: {
    type: Sequelize.DATE,
    allowNull: true
  },
  updated_at: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

// Função para criar o usuário
async function createUser() {
  try {
    await User.sync();
    const userExists = await User.findOne({ where: { email: 'miguelmelo70@gmail.com' } });
    if (userExists) {
      console.log('Usuário já existe.');
      console.log('Email: miguelmelo70@gmail.com');
      process.exit(0);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('2585', salt);
    await User.create({
      name: 'mike',
      email: 'miguelmelo70@gmail.com',
      password: hashedPassword,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log('Usuário criado com sucesso!');
    console.log('Email: miguelmelo70@gmail.com');
    console.log('Senha: 2585');
  } catch (error) {
    console.error('Erro ao criar usuário:');
    console.error(error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createUser();
