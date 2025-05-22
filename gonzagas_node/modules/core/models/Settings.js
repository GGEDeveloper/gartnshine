const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'settings',
  timestamps: true
});

// Método para obter uma configuração pelo nome da chave
Settings.getByKey = async function(key, defaultValue = null) {
  try {
    const setting = await this.findOne({ where: { key } });
    if (!setting) return defaultValue;
    
    // Converte o valor para o tipo correto
    switch (setting.type) {
      case 'number':
        return parseFloat(setting.value) || 0;
      case 'boolean':
        return setting.value === 'true' || setting.value === true;
      case 'json':
        try {
          return JSON.parse(setting.value);
        } catch (e) {
          return defaultValue;
        }
      default:
        return setting.value || defaultValue;
    }
  } catch (error) {
    console.error(`Erro ao buscar configuração ${key}:`, error);
    return defaultValue;
  }
};

// Método para definir uma configuração
Settings.setByKey = async function(key, value, type = 'string', description = null, category = null) {
  try {
    // Converte o valor para string se for um objeto ou array
    let stringValue = value;
    if (typeof value === 'object' || Array.isArray(value)) {
      stringValue = JSON.stringify(value);
      type = 'json';
    } else if (typeof value === 'boolean') {
      stringValue = value ? 'true' : 'false';
      type = 'boolean';
    } else if (typeof value === 'number') {
      stringValue = value.toString();
      type = 'number';
    }
    
    const [setting, created] = await this.findOrCreate({
      where: { key },
      defaults: {
        value: stringValue,
        type,
        description,
        category
      }
    });
    
    if (!created) {
      setting.value = stringValue;
      setting.type = type;
      if (description !== null) setting.description = description;
      if (category !== null) setting.category = category;
      await setting.save();
    }
    
    return setting;
  } catch (error) {
    console.error(`Erro ao definir configuração ${key}:`, error);
    throw error;
  }
};

module.exports = Settings;
