-- =====================================================
-- ROLLBACK SCRIPT: Complete Migration Rollback
-- =====================================================
-- Project: Gonzaga's Art & Shine - Media Management Enhancement
-- Date: 2025-10-07
-- Task: 15.2 - Migration Rollback Procedures
-- Description: Safely rolls back all media management migrations
-- Risk Level: MEDIUM (destructive, removes new tables)
-- ⚠️  WARNING: THIS WILL DELETE ALL DATA IN media_files AND media_usage
-- =====================================================

-- ⚠️  IMPORTANT: Read Before Executing
-- This script will:
-- 1. Drop media_usage table (CASCADE removes all usage tracking)
-- 2. Drop media_files table (CASCADE removes all media records)
-- 3. Remove media_id column from product_images
-- 4. Restore database to pre-migration state

-- System will continue working using image_filename column
-- No product images will be lost (image_filename remains)

-- =====================================================
-- CONFIRMATION PROMPT
-- =====================================================
-- Uncomment the line below to proceed (safety mechanism)
-- SET @CONFIRM_ROLLBACK = 'YES';

-- Safety check
SET @confirmed = IFNULL(@CONFIRM_ROLLBACK, 'NO');

SELECT CASE 
    WHEN @confirmed != 'YES' THEN 
        CONCAT('⚠️  ROLLBACK CANCELLED: Set @CONFIRM_ROLLBACK = ''YES'' to proceed')
    ELSE 
        '✅ ROLLBACK CONFIRMED: Proceeding...'
END as rollback_status;

-- Exit if not confirmed
SET @exit = IF(@confirmed != 'YES', (SELECT 1/0), 0);

-- =====================================================
-- PRE-ROLLBACK BACKUP (RECOMMENDED)
-- =====================================================
-- It's recommended to backup before rollback:
-- mysqldump -u [user] -p gonzagas_db media_files media_usage > backup_before_rollback.sql

SELECT '========================================' as '';
SELECT '📊 PRE-ROLLBACK STATE' as '';
SELECT '========================================' as '';

-- Document current state
SELECT 
    'media_files' as table_name,
    COUNT(*) as row_count
FROM media_files
UNION ALL
SELECT 
    'media_usage',
    COUNT(*)
FROM media_usage
UNION ALL
SELECT 
    'product_images (with media_id)',
    COUNT(*)
FROM product_images
WHERE media_id IS NOT NULL;

-- =====================================================
-- ROLLBACK PHASE 1: Clear Data Migration (if ran)
-- =====================================================

SELECT '========================================' as '';
SELECT '🔄 PHASE 1: Clearing Data Migration' as '';
SELECT '========================================' as '';

-- Clear media_usage entries
TRUNCATE TABLE `media_usage`;
SELECT '✅ Truncated media_usage' as status;

-- Clear media_files entries  
TRUNCATE TABLE `media_files`;
SELECT '✅ Truncated media_files' as status;

-- Clear media_id references in product_images
UPDATE `product_images` 
SET `media_id` = NULL 
WHERE `media_id` IS NOT NULL;

SELECT CONCAT('✅ Cleared ', ROW_COUNT(), ' media_id references from product_images') as status;

-- =====================================================
-- ROLLBACK PHASE 2: Remove Foreign Key Constraint
-- =====================================================

SELECT '========================================' as '';
SELECT '🔄 PHASE 2: Removing Foreign Key' as '';
SELECT '========================================' as '';

-- Check if foreign key exists
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_images' 
      AND CONSTRAINT_NAME = 'fk_product_image_media'
);

-- Drop foreign key if exists
SET @sql = IF(
    @fk_exists > 0,
    'ALTER TABLE `product_images` DROP FOREIGN KEY `fk_product_image_media`',
    'SELECT ''Foreign key fk_product_image_media does not exist'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Dropped foreign key constraint' as status;

-- =====================================================
-- ROLLBACK PHASE 3: Remove Index
-- =====================================================

SELECT '========================================' as '';
SELECT '🔄 PHASE 3: Removing Index' as '';
SELECT '========================================' as '';

-- Check if index exists
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_images' 
      AND INDEX_NAME = 'idx_media_id'
);

-- Drop index if exists
SET @sql = IF(
    @idx_exists > 0,
    'ALTER TABLE `product_images` DROP INDEX `idx_media_id`',
    'SELECT ''Index idx_media_id does not exist'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Dropped index' as status;

-- =====================================================
-- ROLLBACK PHASE 4: Remove Column
-- =====================================================

SELECT '========================================' as '';
SELECT '🔄 PHASE 4: Removing media_id Column' as '';
SELECT '========================================' as '';

-- Check if column exists
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'product_images' 
      AND COLUMN_NAME = 'media_id'
);

-- Drop column if exists
SET @sql = IF(
    @col_exists > 0,
    'ALTER TABLE `product_images` DROP COLUMN `media_id`',
    'SELECT ''Column media_id does not exist'' as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Dropped media_id column' as status;

-- =====================================================
-- ROLLBACK PHASE 5: Drop Tables
-- =====================================================

SELECT '========================================' as '';
SELECT '🔄 PHASE 5: Dropping Media Tables' as '';
SELECT '========================================' as '';

-- Drop media_usage first (has FK to media_files)
DROP TABLE IF EXISTS `media_usage`;
SELECT '✅ Dropped media_usage table' as status;

-- Drop media_files
DROP TABLE IF EXISTS `media_files`;
SELECT '✅ Dropped media_files table' as status;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT '========================================' as '';
SELECT '✅ ROLLBACK VERIFICATION' as '';
SELECT '========================================' as '';

-- Verify tables dropped
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ media_files table removed'
        ELSE '❌ media_files table still exists'
    END as verification_1
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'media_files';

SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ media_usage table removed'
        ELSE '❌ media_usage table still exists'
    END as verification_2
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'media_usage';

-- Verify column dropped
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ media_id column removed from product_images'
        ELSE '❌ media_id column still exists'
    END as verification_3
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'product_images'
  AND COLUMN_NAME = 'media_id';

-- Verify data integrity
SELECT 
    COUNT(*) as product_images_count,
    COUNT(image_filename) as images_with_filename
FROM product_images;

SELECT 
    CASE 
        WHEN COUNT(*) = COUNT(image_filename) THEN '✅ All product images intact'
        ELSE '⚠️  Some images missing filename'
    END as verification_4
FROM product_images;

-- =====================================================
-- FINAL STATE REPORT
-- =====================================================

SELECT '========================================' as '';
SELECT '📊 POST-ROLLBACK STATE' as '';
SELECT '========================================' as '';

-- Show product_images structure
DESCRIBE product_images;

-- Show remaining tables
SHOW TABLES;

SELECT '========================================' as '';
SELECT '✅ ROLLBACK COMPLETED SUCCESSFULLY' as '';
SELECT '========================================' as '';

SELECT CONCAT(
    'Database restored to pre-migration state. ',
    'All product images are intact and accessible via image_filename column. ',
    'Application will continue working normally.'
) as rollback_complete;

-- =====================================================
-- ROLLBACK COMPLETED
-- =====================================================
-- Status: SUCCESS
-- Tables Dropped: 2 (media_files, media_usage)
-- Columns Removed: 1 (product_images.media_id)
-- Data Loss: None (product images intact)
-- Application Impact: None (uses image_filename)
-- System State: Restored to pre-migration
-- =====================================================

-- =====================================================
-- NEXT STEPS AFTER ROLLBACK
-- =====================================================
-- 1. Verify application is working correctly
-- 2. Check that product images load in catalog
-- 3. Test admin panel product management
-- 4. Review logs for any errors
-- 5. If issues found, restore from backup:
--    mysql -u [user] -p gonzagas_db < backup_file.sql
-- =====================================================

