const { pool } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class Checkpoint {
  // Get all checkpoints
  static async getAll() {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM checkpoints
        ORDER BY created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error('Error getting checkpoints:', error);
      throw error;
    }
  }

  // Get checkpoint by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM checkpoints
        WHERE id = ?
      `, [id]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error getting checkpoint by ID:', error);
      throw error;
    }
  }

  // Create a new checkpoint
  static async create(checkpoint) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Generate backup filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `checkpoint_${timestamp}.sql`;
      const filepath = path.join(config.checkpoint.dir, filename);
      
      // Make sure checkpoint directory exists
      await fs.mkdir(config.checkpoint.dir, { recursive: true });
      
      // Create database backup
      await execPromise(`mysqldump -u${process.env.DB_USER || 'geko_admin'} -p${process.env.DB_PASS || 'gekopass'} --add-drop-table --no-data ${process.env.DB_NAME || 'gonzagas_catalog'} > ${filepath}`);
      
      // Then add data
      await execPromise(`mysqldump -u${process.env.DB_USER || 'geko_admin'} -p${process.env.DB_PASS || 'gekopass'} --no-create-info --complete-insert ${process.env.DB_NAME || 'gonzagas_catalog'} >> ${filepath}`);
      
      // Record the checkpoint in the database
      const [result] = await connection.query(`
        INSERT INTO checkpoints 
        (checkpoint_name, description, file_path, created_by)
        VALUES (?, ?, ?, ?)
      `, [
        checkpoint.checkpoint_name,
        checkpoint.description,
        filepath,
        checkpoint.created_by
      ]);
      
      // Check if we need to delete old checkpoints
      const [oldCheckpoints] = await connection.query(`
        SELECT id, file_path FROM checkpoints
        ORDER BY created_at DESC
        LIMIT ${config.checkpoint.maxCheckpoints}, 999999
      `);
      
      // Delete old checkpoints
      for (const oldCheckpoint of oldCheckpoints) {
        try {
          await fs.unlink(oldCheckpoint.file_path);
          await connection.query('DELETE FROM checkpoints WHERE id = ?', [oldCheckpoint.id]);
        } catch (error) {
          console.error(`Failed to delete old checkpoint ${oldCheckpoint.id}:`, error);
        }
      }
      
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      console.error('Error creating checkpoint:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Restore from a checkpoint
  static async restore(id) {
    try {
      // Get the checkpoint info
      const checkpoint = await this.getById(id);
      
      if (!checkpoint) {
        throw new Error(`Checkpoint with ID ${id} not found`);
      }
      
      // Ensure the file exists
      try {
        await fs.access(checkpoint.file_path);
      } catch (error) {
        throw new Error(`Checkpoint file not found: ${checkpoint.file_path}`);
      }
      
      // Restore the database from the backup
      await execPromise(`mysql -u${process.env.DB_USER || 'geko_admin'} -p${process.env.DB_PASS || 'gekopass'} ${process.env.DB_NAME || 'gonzagas_catalog'} < ${checkpoint.file_path}`);
      
      return true;
    } catch (error) {
      console.error('Error restoring checkpoint:', error);
      throw error;
    }
  }

  // Delete a checkpoint
  static async delete(id) {
    try {
      // Get the checkpoint info
      const checkpoint = await this.getById(id);
      
      if (!checkpoint) {
        throw new Error(`Checkpoint with ID ${id} not found`);
      }
      
      // Delete the file
      try {
        await fs.unlink(checkpoint.file_path);
      } catch (error) {
        console.error(`Failed to delete checkpoint file ${checkpoint.file_path}:`, error);
      }
      
      // Delete the database record
      const [result] = await pool.query('DELETE FROM checkpoints WHERE id = ?', [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting checkpoint:', error);
      throw error;
    }
  }
}

module.exports = Checkpoint; 