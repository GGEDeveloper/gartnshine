-- =====================================================
-- MIGRATION 004: Migrate Existing Data (OPTIONAL)
-- =====================================================
-- Project: Gonzaga's Art & Shine - Media Management Enhancement  
-- Date: 2025-10-07
-- Task: 15.4 - Develop Data Migration Scripts
-- Description: Populates media_files from existing product_images for baseline tracking
-- Risk Level: MEDIUM (modifies data but non-destructive)
-- Rollback: TRUNCATE media_usage; TRUNCATE media_files; UPDATE product_images SET media_id=NULL;
-- =====================================================

-- ⚠️ WARNING: This script is OPTIONAL
-- Run only if you want to track existing images in the new media_files system
-- System will work fine without this migration (new uploads will use new system)

-- Set safe mode
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =====================================================
-- STEP 1: Populate media_files from product_images
-- =====================================================
-- Inserts distinct image filenames as media records

INSERT INTO media_files (
    filename, 
    original_filename, 
    mime_type,
    uploaded_by, 
    created_at,
    updated_at
)
SELECT DISTINCT
    pi.image_filename as filename,
    pi.image_filename as original_filename,
    -- Guess MIME type from extension
    CASE 
        WHEN LOWER(pi.image_filename) LIKE '%.jpg' THEN 'image/jpeg'
        WHEN LOWER(pi.image_filename) LIKE '%.jpeg' THEN 'image/jpeg'
        WHEN LOWER(pi.image_filename) LIKE '%.png' THEN 'image/png'
        WHEN LOWER(pi.image_filename) LIKE '%.gif' THEN 'image/gif'
        WHEN LOWER(pi.image_filename) LIKE '%.webp' THEN 'image/webp'
        ELSE 'image/jpeg'
    END as mime_type,
    1 as uploaded_by,  -- Assume admin user ID 1 (adjust if needed)
    MIN(pi.created_at) as created_at,
    MIN(pi.updated_at) as updated_at
FROM product_images pi
WHERE pi.image_filename IS NOT NULL
  AND TRIM(pi.image_filename) != ''
  AND NOT EXISTS (
      SELECT 1 FROM media_files mf 
      WHERE mf.filename = pi.image_filename
  )
GROUP BY pi.image_filename
ORDER BY MIN(pi.created_at);

-- Log results
SELECT 
    '✅ STEP 1 COMPLETED' as status,
    COUNT(*) as media_files_created
FROM media_files;

-- =====================================================
-- STEP 2: Update product_images with media_id
-- =====================================================
-- Links existing product images to their media_files records

UPDATE product_images pi
INNER JOIN media_files mf ON pi.image_filename = mf.filename
SET pi.media_id = mf.id
WHERE pi.media_id IS NULL
  AND pi.image_filename IS NOT NULL
  AND TRIM(pi.image_filename) != '';

-- Log results
SELECT 
    '✅ STEP 2 COMPLETED' as status,
    COUNT(*) as product_images_linked
FROM product_images
WHERE media_id IS NOT NULL;

-- =====================================================
-- STEP 3: Populate media_usage tracking
-- =====================================================
-- Records where each media file is used

INSERT INTO media_usage (
    media_id, 
    used_in_table, 
    used_in_id,
    created_at
)
SELECT 
    pi.media_id,
    'product_images' as used_in_table,
    pi.id as used_in_id,
    NOW() as created_at
FROM product_images pi
WHERE pi.media_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM media_usage mu
      WHERE mu.media_id = pi.media_id
        AND mu.used_in_table = 'product_images'
        AND mu.used_in_id = pi.id
  );

-- Log results
SELECT 
    '✅ STEP 3 COMPLETED' as status,
    COUNT(*) as usage_entries_created
FROM media_usage;

-- =====================================================
-- VERIFICATION & REPORTING
-- =====================================================

-- Summary Report
SELECT '========================================' as '';
SELECT '📊 MIGRATION SUMMARY REPORT' as '';
SELECT '========================================' as '';

SELECT 
    (SELECT COUNT(*) FROM media_files) as total_media_files,
    (SELECT COUNT(*) FROM media_usage) as total_usage_entries,
    (SELECT COUNT(*) FROM product_images WHERE media_id IS NOT NULL) as images_migrated,
    (SELECT COUNT(*) FROM product_images WHERE media_id IS NULL) as images_not_migrated;

-- Detailed Breakdown
SELECT '========================================' as '';
SELECT '📋 DETAILED BREAKDOWN' as '';
SELECT '========================================' as '';

-- Media files by MIME type
SELECT 
    mime_type,
    COUNT(*) as count,
    CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM media_files), 1), '%') as percentage
FROM media_files
GROUP BY mime_type
ORDER BY count DESC;

-- Images without media_id (if any)
SELECT '========================================' as '';
SELECT '⚠️  IMAGES WITHOUT MEDIA_ID' as '';

SELECT 
    pi.id,
    pi.image_filename,
    pi.product_id,
    p.name as product_name
FROM product_images pi
LEFT JOIN products p ON pi.product_id = p.id
WHERE pi.media_id IS NULL
  AND pi.image_filename IS NOT NULL
LIMIT 10;

-- Data Integrity Checks
SELECT '========================================' as '';
SELECT '✅ DATA INTEGRITY CHECKS' as '';
SELECT '========================================' as '';

-- Check 1: Orphaned media_id references
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS: No orphaned media_id references'
        ELSE CONCAT('❌ FAIL: ', COUNT(*), ' orphaned references found')
    END as integrity_check_1
FROM product_images pi
LEFT JOIN media_files mf ON pi.media_id = mf.id
WHERE pi.media_id IS NOT NULL 
  AND mf.id IS NULL;

-- Check 2: Orphaned usage entries
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS: No orphaned usage entries'
        ELSE CONCAT('❌ FAIL: ', COUNT(*), ' orphaned entries found')
    END as integrity_check_2
FROM media_usage mu
LEFT JOIN media_files mf ON mu.media_id = mf.id
WHERE mf.id IS NULL;

-- Check 3: Duplicate media files
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS: No duplicate filenames'
        ELSE CONCAT('⚠️  WARNING: ', COUNT(*), ' duplicate filenames found')
    END as integrity_check_3
FROM (
    SELECT filename, COUNT(*) as cnt
    FROM media_files
    GROUP BY filename
    HAVING cnt > 1
) duplicates;

-- Check 4: Usage tracking completeness
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM product_images WHERE media_id IS NOT NULL) = 
             (SELECT COUNT(DISTINCT used_in_id) FROM media_usage WHERE used_in_table = 'product_images')
        THEN '✅ PASS: All images tracked in media_usage'
        ELSE '⚠️  WARNING: Some images not tracked'
    END as integrity_check_4;

-- Restore settings
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- Status: SUCCESS
-- Media Files Created: [See report above]
-- Product Images Linked: [See report above]
-- Usage Entries Created: [See report above]
-- Data Integrity: [See checks above]
-- Rollback: TRUNCATE tables or restore from backup
-- =====================================================

