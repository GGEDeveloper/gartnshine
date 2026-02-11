# 🗄️ DATABASE MIGRATIONS
**Gonzaga's Art & Shine - Media Management Enhancement**

---

## 📋 MIGRATION FILES

### Documentation
- **00_SCHEMA_ANALYSIS.md** - Complete schema analysis (current vs target)
- **01_MIGRATION_PLAN.md** - Detailed migration plan with backup strategy

### Migration Scripts (Execute in order)
- **002_create_media_tables.sql** - Creates media_files and media_usage tables
- **003_extend_product_images.sql** - Adds media_id to product_images
- **004_migrate_existing_data.sql** - OPTIONAL: Migrates existing data
- **005_extend_products_inventory.sql** - Adiciona color, tax_rate, attributes a products; cria stock_movements, product_colors
- **999_rollback.sql** - Complete rollback procedure

---

## 🚀 QUICK START

### Option A: Automatic Execution (Recommended)
```bash
cd /home/ggedeveloper/gartnshine/gonzagas_node/sql/migrations

# Execute all migrations at once
bash run_migrations.sh
```

### Option B: Manual Step-by-Step
```bash
# 1. Backup first!
mysqldump -u [user] -p gonzagas_db > backup_$(date +%Y%m%d).sql

# 2. Execute migrations one by one
mysql -u [user] -p gonzagas_db < 002_create_media_tables.sql
mysql -u [user] -p gonzagas_db < 003_extend_product_images.sql

# 3. OPTIONAL: Migrate existing data
mysql -u [user] -p gonzagas_db < 004_migrate_existing_data.sql
```

---

## ⚠️ PRE-MIGRATION CHECKLIST

- [ ] **Full backup completed**
- [ ] **Backup verified** (can restore)
- [ ] **Disk space checked** (>2GB free)
- [ ] **Database credentials ready**
- [ ] **Read migration plan** (01_MIGRATION_PLAN.md)
- [ ] **Team notified** (if applicable)

---

## 📊 WHAT GETS CHANGED

### New Tables (2)
```
✅ media_files       - Central media repository
✅ media_usage       - Usage tracking
```

### Modified Tables (1)
```
⚠️  product_images   - Adds media_id column (NULLABLE)
```

### Breaking Changes
```
❌ NONE - 100% backward compatible
```

---

## 🔄 ROLLBACK

### If Something Goes Wrong
```bash
# OPTION 1: Use rollback script
mysql -u [user] -p gonzagas_db < 999_rollback.sql
# Note: Edit file and set @CONFIRM_ROLLBACK = 'YES'

# OPTION 2: Restore from backup
mysql -u [user] -p gonzagas_db < backup_[timestamp].sql
```

---

## ✅ POST-MIGRATION VERIFICATION

### Quick Checks
```sql
-- Check tables exist
SHOW TABLES LIKE 'media_%';

-- Check structure
DESCRIBE media_files;
DESCRIBE media_usage;
DESCRIBE product_images;

-- Check data
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM product_images;
```

### Application Tests
- [ ] Homepage loads correctly
- [ ] Product images display in catalog
- [ ] Admin panel accessible
- [ ] Product forms work
- [ ] Image uploads function

---

## 📞 TROUBLESHOOTING

### Error: "Table already exists"
**Solution:** Scripts are idempotent, safe to re-run

### Error: "Cannot add foreign key"
**Solution:** Ensure media_files table exists first
```sql
SHOW TABLES LIKE 'media_files';
```

### Error: "Access denied"
**Solution:** Check database credentials
```bash
mysql -u [user] -p gonzagas_db -e "SELECT 1"
```

---

## 📝 MIGRATION TIMELINE

```
✅ Subtask 15.1 - Schema Analysis      (DONE)
✅ Subtask 15.2 - Migration Plan       (DONE)  
✅ Subtask 15.3 - SQL Scripts          (DONE)
⏳ Subtask 15.4 - Data Migration       (READY)
⏳ Subtask 15.5 - Test in Staging      (NEXT)
⏳ Subtask 15.6 - Deploy to Production (NEXT)
```

---

## 🎯 EXPECTED RESULTS

### After Migration 002+003
```
- 2 new tables created (media_files, media_usage)
- 1 column added to product_images (media_id)
- 0 breaking changes
- 100% backward compatible
- Application continues working normally
```

### After Optional Migration 004
```
- Existing images tracked in media_files
- Usage recorded in media_usage
- product_images.media_id populated
- Can now use advanced media features
```

---

## 📚 ADDITIONAL RESOURCES

- **Full PRD:** `/.taskmaster/docs/prd.txt`
- **Migration Plan:** `01_MIGRATION_PLAN.md`
- **Schema Analysis:** `00_SCHEMA_ANALYSIS.md`
- **Task Details:** `/.taskmaster/tasks/TASK-015.md`

---

**✅ SCRIPTS READY FOR EXECUTION**  
**Risk Level:** LOW (non-breaking changes)  
**Estimated Time:** ~15 minutes  
**Rollback Available:** YES

