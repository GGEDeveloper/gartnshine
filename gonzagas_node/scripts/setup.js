const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const mediaSourceDir = path.join(__dirname, '../../media');
const mediaDestDir = path.join(__dirname, '../public/media');
const processedMediaDir = path.join(__dirname, '../media_processed');
const checkpointsDir = path.join(__dirname, '../checkpoints');

async function setup() {
  console.log('Setting up Gonzaga\'s Art & Shine catalog...');
  
  try {
    // Create necessary directories
    console.log('Creating directories...');
    await fs.mkdir(mediaDestDir, { recursive: true });
    await fs.mkdir(processedMediaDir, { recursive: true });
    await fs.mkdir(checkpointsDir, { recursive: true });
    
    // Copy media files
    console.log('Copying media files...');
    const mediaFiles = await fs.readdir(mediaSourceDir);
    
    for (const file of mediaFiles) {
      const sourcePath = path.join(mediaSourceDir, file);
      const destPath = path.join(mediaDestDir, file);
      
      // Only copy if it doesn't exist or is newer
      try {
        const destStat = await fs.stat(destPath);
        const sourceStat = await fs.stat(sourcePath);
        
        if (sourceStat.mtime > destStat.mtime) {
          await fs.copyFile(sourcePath, destPath);
          console.log(`  Updated: ${file}`);
        }
      } catch (error) {
        // If destination file doesn't exist, copy it
        if (error.code === 'ENOENT') {
          await fs.copyFile(sourcePath, destPath);
          console.log(`  Copied: ${file}`);
        } else {
          throw error;
        }
      }
    }
    
    // Create .env file if it doesn't exist
    const envPath = path.join(__dirname, '../.env');
    try {
      await fs.access(envPath);
      console.log('.env file already exists, skipping creation');
    } catch (error) {
      console.log('Creating .env file...');
      const envContent = `
# Database configuration
DB_HOST=localhost
DB_USER=geko_admin
DB_PASS=gekopass
DB_NAME=gonzagas_catalog

# Server configuration
PORT=3000
NODE_ENV=development

# Session
SESSION_SECRET=gonzaga-art-and-shine-secret
      `.trim();
      
      await fs.writeFile(envPath, envContent);
    }
    
    console.log('Setup completed successfully!');
    console.log('');
    console.log('To start the development server:');
    console.log('npm run dev');
    
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setup(); 