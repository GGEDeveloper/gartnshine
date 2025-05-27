#!/usr/bin/env node

// --- Início do código para adicionar NODE_PATH ---
const fs = require('fs');
const path = require('path');

// Caminho absoluto para a pasta node_modules dentro do seu nodevenv
const actualModulesPath = '/home/artnshin/nodevenv/artnshine.pt/gonzagas_node/18/lib/node_modules';

// Adiciona ao module.paths se o caminho existir
if (fs.existsSync(actualModulesPath)) {
  if (module.paths.indexOf(actualModulesPath) === -1) {
    module.paths.push(actualModulesPath);
    console.log('[GONZAGAS_DEBUG] Adicionado programaticamente ao module.paths:', actualModulesPath);
  } else {
    console.log('[GONZAGAS_DEBUG] module.paths já contém:', actualModulesPath);
  }
} else {
  console.error('[GONZAGAS_DEBUG] ERRO CRÍTICO: Caminho para node_modules do venv não encontrado:', actualModulesPath);
}
// --- Fim do código para adicionar NODE_PATH ---

/**
 * Módulo de inicialização do servidor.
 * 
 * Este arquivo inicia o servidor HTTP para a aplicação.
 */

const app = require('./app');
const http = require('http');

/**
 * Obtenha a porta do ambiente e armazene no Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Crie o servidor HTTP.
 */
const server = http.createServer(app);

/**
 * Escute na porta fornecida, em todas as interfaces de rede.
 */
server.listen(port, '0.0.0.0');
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize uma porta em um número, string ou false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener para o evento "error" do servidor HTTP.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener para o evento "listening" do servidor HTTP.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Server listening on ' + bind);
  console.log('Environment: ' + process.env.NODE_ENV || 'development');
}
