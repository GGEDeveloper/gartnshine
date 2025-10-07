const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

class BackupSystem {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.maxBackups = 7; // Manter 7 backups
        this.compressionLevel = 6;

        this.ensureBackupDir();
    }

    async ensureBackupDir() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
            console.log('Backup directory ready:', this.backupDir);
        } catch (error) {
            console.error('Failed to create backup directory:', error);
        }
    }

    // BACKUP PRINCIPAL
    async createFullBackup() {
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, 19);

        const backupName = `backup_${timestamp}`;

        try {
            console.log('Starting full backup:', backupName);

            // 1. Database backup
            const dbBackupPath = await this.backupDatabase(backupName);

            // 2. Files backup (uploads, media)
            const filesBackupPath = await this.backupFiles(backupName);

            // 3. Create manifest
            await this.createBackupManifest(backupName, {
                database: dbBackupPath,
                files: filesBackupPath,
                timestamp: new Date().toISOString()
            });

            // 4. Cleanup old backups
            await this.cleanupOldBackups();

            console.log('Full backup completed:', backupName);
            return backupName;

        } catch (error) {
            console.error('Backup failed:', error);
            throw error;
        }
    }

    // DATABASE BACKUP
    async backupDatabase(backupName) {
        require('dotenv').config();
        
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };

        const sqlFilePath = path.join(this.backupDir, `${backupName}_database.sql`);

        // COMANDO mysqldump otimizado para shared hosting
        const mysqldumpCmd = [
            'mysqldump',
            `--host=${dbConfig.host}`,
            `--port=${dbConfig.port}`,
            `--user=${dbConfig.user}`,
            `--password=${dbConfig.password}`,
            '--single-transaction', // Para InnoDB
            '--routines', // Include stored procedures
            '--triggers', // Include triggers
            '--add-drop-table',
            '--complete-insert',
            '--extended-insert=false', // Melhor para debug
            '--default-character-set=utf8mb4',
            '--set-gtid-purged=OFF', // Compatibilidade
            dbConfig.database
        ].join(' ');

        try {
            console.log('Creating database backup...');

            // Execute mysqldump
            const { stdout, stderr } = await execAsync(`${mysqldumpCmd} > "${sqlFilePath}"`);

            if (stderr) {
                console.warn('mysqldump warnings:', stderr);
            }

            // Verify backup file exists and has content
            const stats = await fs.stat(sqlFilePath);
            if (stats.size === 0) {
                throw new Error('Database backup file is empty');
            }

            console.log(`Database backup created: ${stats.size} bytes`);
            return sqlFilePath;

        } catch (error) {
            console.error('Database backup failed:', error);
            throw error;
        }
    }

    // FILES BACKUP
    async backupFiles(backupName) {
        const sourceDirectories = [
            'public/uploads',
            'public/media',
            'public/images'
        ];

        const tarFilePath = path.join(this.backupDir, `${backupName}_files.tar.gz`);

        try {
            console.log('Creating files backup...');

            // Create tar with existing directories only
            const existingDirs = [];
            for (const dir of sourceDirectories) {
                try {
                    const fullPath = path.join(__dirname, '..', dir);
                    await fs.access(fullPath);
                    existingDirs.push(fullPath);
                } catch {
                    console.log(`Directory not found, skipping: ${dir}`);
                }
            }

            if (existingDirs.length === 0) {
                console.log('No media directories found, skipping files backup');
                return null;
            }

            const tarCmd = `tar -czf "${tarFilePath}" -C "${path.join(__dirname, '..')}" ${existingDirs.map(d => path.relative(path.join(__dirname, '..'), d)).join(' ')}`;
            await execAsync(tarCmd);

            const stats = await fs.stat(tarFilePath);
            console.log(`Files backup created: ${stats.size} bytes`);

            return tarFilePath;

        } catch (error) {
            console.error('Files backup failed:', error);
            // Files backup é opcional - não falhar o backup inteiro
            return null;
        }
    }

    // BACKUP MANIFEST
    async createBackupManifest(backupName, details) {
        const manifestPath = path.join(this.backupDir, `${backupName}_manifest.json`);

        const manifest = {
            name: backupName,
            created: details.timestamp,
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: {
                file: details.database ? path.basename(details.database) : null,
                size: details.database ? (await fs.stat(details.database)).size : 0
            },
            files: {
                file: details.files ? path.basename(details.files) : null,
                size: details.files ? (await fs.stat(details.files)).size : 0
            },
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };

        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        console.log('Backup manifest created');
    }

    // CLEANUP OLD BACKUPS
    async cleanupOldBackups() {
        try {
            const files = await fs.readdir(this.backupDir);

            // Group by backup name
            const backups = {};
            files.forEach(file => {
                const match = file.match(/^backup_(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
                if (match) {
                    const backupName = match[1];
                    if (!backups[backupName]) {
                        backups[backupName] = [];
                    }
                    backups[backupName].push(file);
                }
            });

            const backupNames = Object.keys(backups).sort().reverse();

            // Keep only the most recent backups
            if (backupNames.length > this.maxBackups) {
                const toDelete = backupNames.slice(this.maxBackups);

                for (const backupName of toDelete) {
                    for (const file of backups[backupName]) {
                        const filePath = path.join(this.backupDir, file);
                        await fs.unlink(filePath);
                        console.log(`Deleted old backup file: ${file}`);
                    }
                }
            }

        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    // RESTORE BACKUP
    async restoreBackup(backupName) {
        try {
            console.log('Starting restore:', backupName);

            // Read manifest
            const manifestPath = path.join(this.backupDir, `${backupName}_manifest.json`);
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

            // Restore database
            if (manifest.database.file) {
                await this.restoreDatabase(backupName, manifest.database.file);
            }

            // Restore files
            if (manifest.files.file) {
                await this.restoreFiles(backupName, manifest.files.file);
            }

            console.log('Restore completed');
            return true;

        } catch (error) {
            console.error('Restore failed:', error);
            throw error;
        }
    }

    // RESTORE DATABASE
    async restoreDatabase(backupName, sqlFile) {
        require('dotenv').config();
        
        const sqlFilePath = path.join(this.backupDir, sqlFile);
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        };

        const restoreCmd = [
            'mysql',
            `--host=${dbConfig.host}`,
            `--port=${dbConfig.port}`,
            `--user=${dbConfig.user}`,
            `--password=${dbConfig.password}`,
            dbConfig.database,
            `< "${sqlFilePath}"`
        ].join(' ');

        await execAsync(restoreCmd);
        console.log('Database restored');
    }

    // RESTORE FILES
    async restoreFiles(backupName, tarFile) {
        const tarFilePath = path.join(this.backupDir, tarFile);
        const restoreCmd = `tar -xzf "${tarFilePath}" -C "${path.join(__dirname, '..')}"`;
        
        await execAsync(restoreCmd);
        console.log('Files restored');
    }

    // LIST AVAILABLE BACKUPS
    async listBackups() {
        try {
            const files = await fs.readdir(this.backupDir);
            const manifests = files.filter(f => f.endsWith('_manifest.json'));

            const backups = [];
            for (const manifestFile of manifests) {
                const manifestPath = path.join(this.backupDir, manifestFile);
                const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
                backups.push(manifest);
            }

            return backups.sort((a, b) => new Date(b.created) - new Date(a.created));

        } catch (error) {
            console.error('Failed to list backups:', error);
            return [];
        }
    }
}

// CLI INTERFACE
if (require.main === module) {
    const action = process.argv[2] || 'backup';
    const backupSystem = new BackupSystem();

    switch (action) {
        case 'backup':
            backupSystem.createFullBackup()
                .then(name => {
                    console.log('Backup completed:', name);
                    process.exit(0);
                })
                .catch(error => {
                    console.error('Backup failed:', error);
                    process.exit(1);
                });
            break;

        case 'list':
            backupSystem.listBackups()
                .then(backups => {
                    console.log('Available backups:');
                    backups.forEach(b => {
                        console.log(`- ${b.name} (${b.created})`);
                        console.log(`  DB: ${(b.database.size / 1024).toFixed(2)} KB`);
                        if (b.files.size > 0) {
                            console.log(`  Files: ${(b.files.size / 1024 / 1024).toFixed(2)} MB`);
                        }
                    });
                    process.exit(0);
                });
            break;

        case 'restore':
            const backupName = process.argv[3];
            if (!backupName) {
                console.error('Usage: node backup-system.js restore BACKUP_NAME');
                process.exit(1);
            }

            backupSystem.restoreBackup(backupName)
                .then(() => {
                    console.log('Restore completed');
                    process.exit(0);
                })
                .catch(error => {
                    console.error('Restore failed:', error);
                    process.exit(1);
                });
            break;

        default:
            console.error('Usage: node backup-system.js [backup|list|restore]');
            process.exit(1);
    }
}

module.exports = BackupSystem;

