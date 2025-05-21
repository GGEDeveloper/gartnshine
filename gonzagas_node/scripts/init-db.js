const { pool, initializeTables } = require('../config/database');

async function initDatabase() {
  try {
    console.log('Initializing database tables...');
    await initializeTables();
    console.log('Database tables initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
