// test_port.js
const http = require('http');
const PORT = 3000; // Ou qualquer outra porta que queira testar

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Minimal server is running!\n');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Minimal server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is indeed in use according to this minimal server.`);
  }
  process.exit(1);
});
