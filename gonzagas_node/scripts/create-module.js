#!/usr/bin/env node

/**
 * Script para criar um novo módulo na estrutura do projeto.
 * Uso: node scripts/create-module.js <nome-do-modulo>
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readline = require('readline');

const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configurações
const MODULES_DIR = path.join(__dirname, '../modules');
const TEMPLATE_DIR = path.join(MODULES_DIR, 'MODULE_TEMPLATE');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Função para criar diretórios
async function createDirectories(modulePath) {
  const dirs = [
    'controllers',
    'models',
    'routes',
    'services',
    'validators',
    'tests/unit',
    'tests/integration'
  ];

  for (const dir of dirs) {
    const dirPath = path.join(modulePath, dir);
    await mkdir(dirPath, { recursive: true });
    console.log(`${colors.green}✓${colors.reset} Criado diretório: ${dirPath}`);
  }
}

// Função para criar arquivos básicos
async function createBaseFiles(modulePath, moduleName) {
  // Criar arquivo index.js
  const indexContent = `/**
 * Módulo ${moduleName}
 * 
 * Descrição do módulo ${moduleName}.
 */

const controllers = require('./controllers');
const models = require('./models');
const routes = require('./routes');
const services = require('./services');
const validators = require('./validators');

module.exports = {
  // Inicialização do módulo
  async initialize(app) {
    console.log('Inicializando módulo ${moduleName}...');
    // Inicialize aqui os serviços do módulo
  },
  
  // Exportações
  controllers,
  models,
  routes,
  services,
  validators
};
`;

  await writeFile(path.join(modulePath, 'index.js'), indexContent);
  console.log(`${colors.green}✓${colors.reset} Criado arquivo: index.js`);

  // Criar README.md
  const readmeContent = `# ${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}

Módulo responsável por [descrever a funcionalidade principal do módulo].

## Estrutura

- \`controllers/\`: Controladores da API
- \`models/\`: Modelos de dados
- \`routes/\`: Definição das rotas da API
- \`services/\`: Lógica de negócios
- \`validators/\`: Validação de dados de entrada
- \`tests/\`: Testes unitários e de integração

## Como Usar

\`\`\`javascript
const ${moduleName}Module = require('../modules/${moduleName}');

// Usando um controlador
${moduleName}Module.controllers.${moduleName}Controller.method();

// Usando um serviço
${moduleName}Module.services.${moduleName}Service.method();
\`\`\`
`;

  await writeFile(path.join(modulePath, 'README.md'), readmeContent);
  console.log(`${colors.green}✓${colors.reset} Criado arquivo: README.md`);
}

// Função principal
async function main() {
  // Verificar argumentos
  const moduleName = process.argv[2];
  
  if (!moduleName) {
    console.error(`${colors.red}Erro:${colors.reset} Nome do módulo não fornecido.`);
    console.log(`\nUso: node scripts/create-module.js <nome-do-modulo>`);
    process.exit(1);
  }

  // Validar nome do módulo
  if (!/^[a-z][a-z0-9-]*$/.test(moduleName)) {
    console.error(`${colors.red}Erro:${colors.reset} Nome do módulo inválido. Use apenas letras minúsculas, números e hífens.`);
    process.exit(1);
  }

  const modulePath = path.join(MODULES_DIR, moduleName);
  
  // Verificar se o módulo já existe
  if (fs.existsSync(modulePath)) {
    console.error(`${colors.red}Erro:${colors.reset} O módulo '${moduleName}' já existe.`);
    process.exit(1);
  }

  try {
    console.log(`\n${colors.bright}Criando novo módulo: ${moduleName}${colors.reset}\n`);
    
    // Criar diretórios
    await createDirectories(modulePath);
    
    // Criar arquivos base
    await createBaseFiles(modulePath, moduleName);
    
    console.log(`\n${colors.green}✓ Módulo '${moduleName}' criado com sucesso!${colors.reset}\n`);
    console.log(`${colors.cyan}Próximos passos:${colors.reset}`);
    console.log(`1. Adicione o nome do módulo em ${colors.cyan}config/modules.js${colors.reset}`);
    console.log(`2. Implemente os controladores em ${colors.cyan}modules/${moduleName}/controllers/${colors.reset}`);
    console.log(`3. Defina os modelos em ${colors.cyan}modules/${moduleName}/models/${colors.reset}`);
    console.log(`4. Configure as rotas em ${colors.cyan}modules/${moduleName}/routes/${colors.reset}\n`);
    
  } catch (error) {
    console.error(`${colors.red}Erro ao criar o módulo:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Executar
main().catch(console.error);
