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

// Função para atualizar a senha do administrador
async function updateAdminPassword() {
  try {
    // Busca o usuário administrador
    const admin = await User.findOne({ where: { email: 'admin@gonzagas.com' } });
    
    if (!admin) {
      console.log('Usuário administrador não encontrado.');
      process.exit(1);
    }
    
    // Cria o hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Atualiza a senha do administrador
    await admin.update({
      password: hashedPassword,
      updated_at: new Date()
    });
    
    console.log('Senha do usuário administrador atualizada com sucesso!');
    console.log('Email: admin@gonzagas.com');
    console.log('Nova senha: admin123');
    console.log('Por favor, altere a senha após o primeiro login.');
    
  } catch (error) {
    console.error('Erro ao atualizar a senha do administrador:');
    console.error(error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Executa a função
updateAdminPassword();
