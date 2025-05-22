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

// Função para criar o usuário administrador
async function createAdminUser() {
  try {
    // Sincroniza o modelo com o banco de dados (cria a tabela se não existir)
    await User.sync();
    
    // Verifica se já existe um usuário administrador
    const adminExists = await User.findOne({ where: { email: 'admin@gonzagas.com' } });
    
    if (adminExists) {
      console.log('Usuário administrador já existe.');
      console.log('Email: admin@gonzagas.com');
      console.log('Para redefinir a senha, use a opção "Esqueci minha senha" na página de login.');
      process.exit(0);
    }
    
    // Cria o hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Cria o usuário administrador
    await User.create({
      name: 'Administrador',
      email: 'admin@gonzagas.com',
      password: hashedPassword,
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('Usuário administrador criado com sucesso!');
    console.log('Email: admin@gonzagas.com');
    console.log('Senha: admin123');
    console.log('Por favor, altere a senha após o primeiro login.');
    
  } catch (error) {
    console.error('Erro ao criar usuário administrador:');
    console.error(error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Executa a função
createAdminUser();
