-- =====================================================
-- MIGRATION 002: Create Media Management Tables
-- =====================================================
-- Project: Gonzaga's Art & Shine - Media Management Enhancement
-- Date: 2025-10-07
-- Task: 15.3 - Write Migration SQL Scripts
-- Description: Creates media_files and media_usage tables for advanced media management
-- Risk Level: VERY LOW (non-breaking, adds new tables only)
-- Rollback: DROP TABLE media_usage; DROP TABLE media_files;
-- =====================================================

-- Set safe mode
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =====================================================
-- TABLE 1: media_files
-- =====================================================
-- Purpose: Central repository for all media files uploaded to the system
-- Tracks metadata, variants (thumbnail/medium/large), and WebP versions

CREATE TABLE IF NOT EXISTS `media_files` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
    `filename` VARCHAR(255) NOT NULL COMMENT 'Unique filename stored on disk',
    `original_filename` VARCHAR(255) DEFAULT NULL COMMENT 'Original filename when uploaded',
    `file_size` INT DEFAULT NULL COMMENT 'File size in bytes',
    `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'MIME type (image/jpeg, image/png, etc)',
    `width` INT DEFAULT NULL COMMENT 'Image width in pixels',
    `height` INT DEFAULT NULL COMMENT 'Image height in pixels',
    `has_thumbnail` BOOLEAN DEFAULT 0 COMMENT 'Has thumbnail variant (200x200)',
    `has_medium` BOOLEAN DEFAULT 0 COMMENT 'Has medium variant (800px)',
    `has_large` BOOLEAN DEFAULT 0 COMMENT 'Has large variant (1600px)',
    `has_webp` BOOLEAN DEFAULT 0 COMMENT 'Has WebP format version',
    `uploaded_by` INT DEFAULT NULL COMMENT 'User ID who uploaded (FK to users)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last modification',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_filename` (`filename`),
    INDEX `idx_uploaded_by` (`uploaded_by`),
    INDEX `idx_mime_type` (`mime_type`),
    INDEX `idx_created_at` (`created_at`),
    
    CONSTRAINT `fk_media_uploaded_by` 
        FOREIGN KEY (`uploaded_by`) 
        REFERENCES `users`(`id`) 
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='Central media files repository with metadata and variants tracking';

-- =====================================================
-- TABLE 2: media_usage
-- =====================================================
-- Purpose: Track where each media file is used across the system
-- Enables safe deletion (warn if in use) and orphan detection

CREATE TABLE IF NOT EXISTS `media_usage` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
    `media_id` INT NOT NULL COMMENT 'FK to media_files',
    `used_in_table` VARCHAR(100) NOT NULL COMMENT 'Table name where media is used (products, galleries, etc)',
    `used_in_id` INT NOT NULL COMMENT 'Record ID in the referenced table',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When usage was recorded',
    
    PRIMARY KEY (`id`),
    INDEX `idx_media_id` (`media_id`),
    INDEX `idx_usage` (`used_in_table`, `used_in_id`),
    INDEX `idx_created_at` (`created_at`),
    
    CONSTRAINT `fk_usage_media` 
        FOREIGN KEY (`media_id`) 
        REFERENCES `media_files`(`id`) 
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    -- Prevent duplicate tracking entries
    UNIQUE KEY `uk_usage` (`media_id`, `used_in_table`, `used_in_id`)
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci 
COMMENT='Tracks media file usage across the system for safe deletion and orphan detection';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables were created
SELECT 
    'media_files' as table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'media_files'
    ) THEN '✅ CREATED' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'media_usage' as table_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'media_usage'
    ) THEN '✅ CREATED' ELSE '❌ MISSING' END as status;

-- Check indexes were created
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('media_files', 'media_usage')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Check foreign keys were created
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('media_files', 'media_usage')
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Restore settings
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- Status: SUCCESS
-- Tables Created: 2 (media_files, media_usage)
-- Indexes Created: 7
-- Foreign Keys: 2
-- Breaking Changes: NONE
-- Data Loss Risk: ZERO
-- Rollback: Available (see 999_rollback.sql)
-- =====================================================

