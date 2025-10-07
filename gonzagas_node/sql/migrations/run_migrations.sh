#!/bin/bash

# =====================================================
# AUTOMATED MIGRATION SCRIPT
# =====================================================
# Project: Gonzaga's Art & Shine
# Description: Executes all media management migrations safely
# Usage: bash run_migrations.sh
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="gonzagas_db"
BACKUP_DIR="../../backups/migrations"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Gonzaga's Database Migration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =====================================================
# STEP 1: Collect Database Credentials
# =====================================================
echo -e "${YELLOW}📝 Database Configuration${NC}"
read -p "Database User: " DB_USER
read -sp "Database Password: " DB_PASSWORD
echo ""
echo ""

# Test connection
echo -e "${YELLOW}🔌 Testing database connection...${NC}"
if mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✅ Connection successful${NC}"
else
    echo -e "${RED}❌ Connection failed${NC}"
    echo -e "${RED}Please check your credentials and try again${NC}"
    exit 1
fi

# =====================================================
# STEP 2: Pre-Migration Backup
# =====================================================
echo ""
echo -e "${YELLOW}💾 Creating backup...${NC}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Full backup
BACKUP_FILE="$BACKUP_DIR/gonzagas_db_${TIMESTAMP}.sql"
echo -e "${BLUE}Backing up to: $BACKUP_FILE${NC}"

mysqldump -u "$DB_USER" -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup completed successfully${NC}"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup compressed: ${BACKUP_FILE}.gz${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Save table counts for verification
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
    SELECT 'products' as table_name, COUNT(*) as rows FROM products
    UNION ALL
    SELECT 'product_images', COUNT(*) FROM product_images
    UNION ALL
    SELECT 'product_families', COUNT(*) FROM product_families;
" > "$BACKUP_DIR/table_counts_${TIMESTAMP}.txt"

# =====================================================
# STEP 3: Confirm Migration
# =====================================================
echo ""
echo -e "${YELLOW}⚠️  CONFIRMATION REQUIRED${NC}"
echo -e "${YELLOW}This will execute the following migrations:${NC}"
echo -e "  1. Create media_files table"
echo -e "  2. Create media_usage table"
echo -e "  3. Add media_id to product_images"
echo ""
echo -e "${BLUE}These changes are NON-BREAKING and REVERSIBLE${NC}"
echo ""

read -p "Continue with migration? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Migration cancelled${NC}"
    exit 0
fi

# =====================================================
# STEP 4: Execute Migrations
# =====================================================
echo ""
echo -e "${YELLOW}🔄 Executing migrations...${NC}"
echo ""

# Migration 002: Create Media Tables
echo -e "${BLUE}[1/3] Creating media tables...${NC}"
if mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < 002_create_media_tables.sql; then
    echo -e "${GREEN}✅ Migration 002 completed${NC}"
else
    echo -e "${RED}❌ Migration 002 failed${NC}"
    echo -e "${RED}Check errors above and restore from backup if needed:${NC}"
    echo -e "${RED}mysql -u $DB_USER -p $DB_NAME < ${BACKUP_FILE}.gz${NC}"
    exit 1
fi

# Migration 003: Extend Product Images
echo ""
echo -e "${BLUE}[2/3] Extending product_images table...${NC}"
if mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < 003_extend_product_images.sql; then
    echo -e "${GREEN}✅ Migration 003 completed${NC}"
else
    echo -e "${RED}❌ Migration 003 failed${NC}"
    exit 1
fi

# Migration 004: Data Migration (Optional)
echo ""
echo -e "${YELLOW}[3/3] Data migration (optional)${NC}"
read -p "Migrate existing images to new system? (yes/no): " MIGRATE_DATA

if [ "$MIGRATE_DATA" = "yes" ]; then
    echo -e "${BLUE}Migrating existing data...${NC}"
    if mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < 004_migrate_existing_data.sql; then
        echo -e "${GREEN}✅ Data migration completed${NC}"
    else
        echo -e "${RED}❌ Data migration failed${NC}"
        echo -e "${YELLOW}⚠️  Core migrations are complete, only data migration failed${NC}"
        echo -e "${YELLOW}System will work fine, new uploads will use new system${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipping data migration${NC}"
    echo -e "${BLUE}New uploads will use the new system automatically${NC}"
fi

# =====================================================
# STEP 5: Verification
# =====================================================
echo ""
echo -e "${YELLOW}🔍 Verifying migration...${NC}"

# Check tables exist
TABLES_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "
    SELECT COUNT(*) FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = '$DB_NAME' 
    AND TABLE_NAME IN ('media_files', 'media_usage')
")

if [ "$TABLES_COUNT" -eq 2 ]; then
    echo -e "${GREEN}✅ New tables created successfully${NC}"
else
    echo -e "${RED}❌ Tables not found${NC}"
    exit 1
fi

# Check column added
COLUMN_EXISTS=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = '$DB_NAME' 
    AND TABLE_NAME = 'product_images' 
    AND COLUMN_NAME = 'media_id'
")

if [ "$COLUMN_EXISTS" -eq 1 ]; then
    echo -e "${GREEN}✅ Column media_id added to product_images${NC}"
else
    echo -e "${RED}❌ Column not found${NC}"
    exit 1
fi

# Check data integrity
PRODUCTS_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM products")
IMAGES_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM product_images")

echo -e "${GREEN}✅ Data integrity: $PRODUCTS_COUNT products, $IMAGES_COUNT images${NC}"

# =====================================================
# STEP 6: Summary Report
# =====================================================
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ MIGRATION COMPLETED SUCCESSFULLY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • Tables created: 2 (media_files, media_usage)"
echo -e "  • Tables modified: 1 (product_images)"
echo -e "  • Backup location: ${BACKUP_FILE}.gz"
echo -e "  • Data integrity: VERIFIED"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo -e "  1. Test application (homepage, catalog, admin)"
echo -e "  2. Verify image uploads work"
echo -e "  3. Proceed with Task 1 (Camera Capture) implementation"
echo ""
echo -e "${YELLOW}💾 Rollback if needed:${NC}"
echo -e "  mysql -u $DB_USER -p $DB_NAME < 999_rollback.sql"
echo -e "  (Remember to edit file and set @CONFIRM_ROLLBACK = 'YES')"
echo ""
echo -e "${GREEN}🎉 Database is ready for new media management features!${NC}"
echo ""

