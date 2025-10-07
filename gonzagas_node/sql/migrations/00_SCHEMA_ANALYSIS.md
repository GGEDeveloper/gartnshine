# 📊 DATABASE SCHEMA ANALYSIS
**Gonzaga's Art & Shine - Media Management Enhancement**

**Data:** 2025-10-07  
**Task:** 15.1 - Analyze Current Schema and Define Target Changes  
**Status:** ✅ COMPLETO

---

## 🔍 CURRENT SCHEMA ANALYSIS

### Existing Tables (6 tables)
```
1. product_families    - Categorias de produtos ✅
2. products           - Produtos principais ✅
3. product_images     - Imagens de produtos ✅ (SERÁ EXPANDIDO)
4. inventory_transactions - Movimentos de stock ✅
5. checkpoints        - Backups do sistema ✅
6. users              - Utilizadores admin ✅
```

### Existing Indexes
```sql
-- Unique constraints
product_families.code (UNIQUE)
products.reference (UNIQUE)
users.username (UNIQUE)
users.email (UNIQUE)

-- Foreign key indexes
products.family_id → product_families.id
product_images.product_id → products.id
inventory_transactions.product_id → products.id

-- Additional indexes
inventory_transactions.transaction_type
```

### Current Relationships
```
product_families (1) ───< (N) products
                                │
                                ├───< (N) product_images
                                │
                                └───< (N) inventory_transactions
```

---

## 🎯 REQUIRED CHANGES (FROM PRD)

### NEW TABLES NEEDED (2 tables)

#### 1. `media_files` - Central Media Management
**Purpose:** Track ALL media files uploaded to the system (products, gallery, etc)

**Required Fields:**
```sql
id                  INT PRIMARY KEY AUTO_INCREMENT
filename            VARCHAR(255) UNIQUE NOT NULL
original_filename   VARCHAR(255)
file_size           INT                           -- in bytes
mime_type           VARCHAR(100)                  -- image/jpeg, image/png, etc
width               INT
height              INT
has_thumbnail       BOOLEAN DEFAULT 0
has_medium          BOOLEAN DEFAULT 0
has_large           BOOLEAN DEFAULT 0
has_webp            BOOLEAN DEFAULT 0
uploaded_by         INT                           -- FK to users
created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**Indexes Needed:**
- PRIMARY KEY (id)
- UNIQUE KEY (filename)
- INDEX (uploaded_by)
- FOREIGN KEY uploaded_by → users.id

#### 2. `media_usage` - Track Where Media is Used
**Purpose:** Know which media files are used where (products, galleries, etc)

**Required Fields:**
```sql
id              INT PRIMARY KEY AUTO_INCREMENT
media_id        INT NOT NULL                 -- FK to media_files
used_in_table   VARCHAR(100) NOT NULL        -- 'products', 'galleries', etc
used_in_id      INT NOT NULL                 -- ID of the record using this media
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Indexes Needed:**
- PRIMARY KEY (id)
- FOREIGN KEY media_id → media_files.id ON DELETE CASCADE
- INDEX (media_id)
- INDEX (used_in_table, used_in_id) - composite for lookup

---

## 🔄 MODIFICATIONS TO EXISTING TABLES

### Option A: EXTEND `product_images` table (RECOMMENDED)
**Approach:** Add media_id FK to link with new media_files table

```sql
ALTER TABLE product_images 
ADD COLUMN media_id INT DEFAULT NULL AFTER id,
ADD FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE SET NULL;
```

**Pros:**
- ✅ Backward compatible (media_id is nullable)
- ✅ Existing image_filename still works
- ✅ Gradual migration possible
- ✅ No data loss

**Cons:**
- ⚠️ Temporary redundancy (image_filename + media_id)
- ⚠️ Need migration script to populate media_id

### Option B: REPLACE image_filename with media_id (NOT RECOMMENDED)
**Approach:** Drop image_filename, use only media_id

```sql
-- NOT RECOMMENDED for production
ALTER TABLE product_images 
DROP COLUMN image_filename,
ADD COLUMN media_id INT NOT NULL,
ADD FOREIGN KEY (media_id) REFERENCES media_files(id) ON DELETE CASCADE;
```

**Pros:**
- ✅ Cleaner schema
- ✅ Single source of truth

**Cons:**
- ❌ NOT backward compatible
- ❌ Requires complex migration
- ❌ Risk of data loss
- ❌ Breaks existing code

---

## 📋 TARGET SCHEMA (FINAL STATE)

### New Table Relationships
```
users (1) ───< (N) media_files
                     │
                     ├───< (N) media_usage
                     │         │
                     │         └──→ products, galleries, etc
                     │
                     └───> (1) product_images.media_id
```

### Complete ERD (After Changes)
```
product_families (1) ───< (N) products
                                │
                                ├───< (N) product_images
                                │          │
                                │          └──→ media_files
                                │
                                └───< (N) inventory_transactions

users (1) ───< (N) media_files
                     │
                     └───< (N) media_usage
```

---

## 🛡️ BACKWARD COMPATIBILITY STRATEGY

### Phase 1: Add New Tables (NON-BREAKING)
```sql
-- Create media_files table
-- Create media_usage table
-- No changes to existing tables
```
**Impact:** ZERO - Existing system continues working

### Phase 2: Extend product_images (NON-BREAKING)
```sql
-- Add media_id column (NULLABLE)
-- Keep image_filename
```
**Impact:** ZERO - Both columns exist, existing code works

### Phase 3: Data Migration (BACKGROUND)
```sql
-- Populate media_files from existing product_images
-- Populate media_usage
-- Update product_images.media_id
```
**Impact:** LOW - Can run during low traffic

### Phase 4: Code Migration (GRADUAL)
```javascript
// Update code to use media_id when available
// Fallback to image_filename if media_id is null
```
**Impact:** LOW - Gradual rollout

### Phase 5: Cleanup (OPTIONAL, FUTURE)
```sql
-- After 100% migration, can drop image_filename
-- But recommend keeping for safety
```
**Impact:** NONE (optional)

---

## 🔧 IMPLEMENTATION DETAILS

### Storage Locations
```
Current:
/public/uploads/products/[filename]

New (will add):
/public/uploads/products/[filename]           # Original
/public/uploads/products/[filename]_thumb.jpg   # 200x200
/public/uploads/products/[filename]_medium.jpg  # 800px
/public/uploads/products/[filename]_large.jpg   # 1600px
/public/uploads/products/[filename].webp        # WebP version
/public/uploads/products/[filename]_thumb.webp  # WebP thumb
/public/uploads/products/[filename]_medium.webp # WebP medium
/public/uploads/products/[filename]_large.webp  # WebP large
```

### Naming Convention
```javascript
// Filenames stored in database
original:      "product_123.jpg"
thumbnail:     "product_123_thumb.jpg"
medium:        "product_123_medium.jpg"
large:         "product_123_large.jpg"
webp_original: "product_123.webp"
webp_thumb:    "product_123_thumb.webp"
webp_medium:   "product_123_medium.webp"
webp_large:    "product_123_large.webp"
```

---

## 🎯 REQUIRED INDEXES (SUMMARY)

### New Indexes on New Tables
```sql
-- media_files
PRIMARY KEY (id)
UNIQUE KEY (filename)
INDEX idx_uploaded_by (uploaded_by)
FOREIGN KEY fk_media_uploaded_by (uploaded_by) 
    REFERENCES users(id) ON DELETE SET NULL

-- media_usage
PRIMARY KEY (id)
INDEX idx_media_id (media_id)
INDEX idx_usage (used_in_table, used_in_id)
FOREIGN KEY fk_usage_media (media_id) 
    REFERENCES media_files(id) ON DELETE CASCADE
```

### New Index on Existing Table
```sql
-- product_images
INDEX idx_media_id (media_id)
FOREIGN KEY fk_product_image_media (media_id) 
    REFERENCES media_files(id) ON DELETE SET NULL
```

---

## 📊 DATA TYPES & CONSTRAINTS

### Storage Considerations (Shared Hosting)
```sql
-- File sizes
file_size INT  -- Max 2GB (enough for images)

-- Timestamps
created_at, updated_at TIMESTAMP 
-- Auto-managed by MariaDB

-- Foreign Keys
ON DELETE SET NULL   -- For optional relations (product_images.media_id)
ON DELETE CASCADE    -- For dependent data (media_usage.media_id)

-- Charset
utf8mb4 COLLATE utf8mb4_unicode_ci  -- Full Unicode support
```

### NULL vs NOT NULL
```sql
-- NOT NULL (required fields)
media_files.filename
media_files.uploaded_by (initially, can be NULL for legacy data)
media_usage.media_id
media_usage.used_in_table
media_usage.used_in_id

-- NULL allowed (optional fields)
product_images.media_id (for backward compatibility)
media_files.original_filename (if renamed)
media_files.file_size (if unknown)
```

---

## ✅ VALIDATION RULES

### Filename Validation
```javascript
// In application code
const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const maxFileSize = 10 * 1024 * 1024; // 10MB before compression
const allowedMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp'
];
```

### Database Constraints
```sql
-- Ensure positive values
CHECK (file_size >= 0)
CHECK (width >= 0)
CHECK (height >= 0)

-- Ensure valid mime types
CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp'))

-- Ensure valid table names
CHECK (used_in_table IN ('products', 'galleries', 'collections'))
```

---

## 🚨 MIGRATION RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | HIGH | LOW | Full backup before start + test in staging |
| Downtime during deployment | MEDIUM | LOW | NON-BREAKING changes allow zero-downtime |
| Duplicate filenames conflict | MEDIUM | MEDIUM | Add timestamp suffix to new uploads |
| Foreign key constraint violation | HIGH | LOW | Validate all relations before applying constraints |
| Storage space doubled (variants) | MEDIUM | HIGH | Implement cleanup of old files + compression |
| Performance degradation | LOW | LOW | Add proper indexes + test queries |

---

## 📝 COMPATIBILITY MATRIX

### Existing Code Impact
```
┌─────────────────────────┬──────────┬────────────────────┐
│ Component               │ Impact   │ Action Required    │
├─────────────────────────┼──────────┼────────────────────┤
│ Product upload          │ LOW      │ Keep working       │
│ Product images display  │ NONE     │ No change          │
│ Admin product forms     │ NONE     │ No change          │
│ Catalog display         │ NONE     │ No change          │
│ Image queries           │ NONE     │ Keep using same    │
└─────────────────────────┴──────────┴────────────────────┘
```

### New Code Additions
```
┌─────────────────────────┬──────────────────────────────┐
│ Feature                 │ Uses New Tables              │
├─────────────────────────┼──────────────────────────────┤
│ Camera capture          │ YES - media_files            │
│ Media gallery           │ YES - media_files            │
│ Drag & drop upload      │ YES - media_files            │
│ Image variants          │ YES - media_files metadata   │
│ WebP conversion         │ YES - media_files metadata   │
│ Media library modal     │ YES - media_files            │
│ Usage tracking          │ YES - media_usage            │
│ Bulk operations         │ YES - media_usage (check)    │
└─────────────────────────┴──────────────────────────────┘
```

---

## ✅ FINAL RECOMMENDATIONS

### RECOMMENDED APPROACH: **Option A - EXTEND (Non-Breaking)**

**Reasons:**
1. ✅ **Zero downtime** - Existing system keeps working
2. ✅ **Safe migration** - Can rollback easily
3. ✅ **Gradual adoption** - New code uses new tables, old code keeps working
4. ✅ **Production-safe** - No data loss risk
5. ✅ **Future-proof** - Can cleanup later when fully migrated

### Implementation Order:
```
1. Create media_files table          (15.3)
2. Create media_usage table          (15.3)
3. Add indexes                       (15.3)
4. Extend product_images             (15.3)
5. Test schema in staging            (15.5)
6. Apply to production               (15.6)
7. Data migration script (optional)  (15.4)
```

---

## 📂 DELIVERABLES FROM THIS ANALYSIS

- ✅ **Schema comparison** (current vs target)
- ✅ **New tables specification** (media_files, media_usage)
- ✅ **Modification strategy** (extend product_images)
- ✅ **Backward compatibility plan** (5-phase approach)
- ✅ **Indexes and constraints** (complete specification)
- ✅ **Risk analysis** (6 risks identified + mitigations)
- ✅ **Implementation recommendations** (Option A - Extend)

---

## 🎯 NEXT STEPS

**Subtask 15.2:** Design Migration Plan and Data Backup Strategy
- Define backup procedures
- Create rollback plan
- Document step-by-step migration

**Subtask 15.3:** Write Migration SQL Scripts
- Create media_files table script
- Create media_usage table script
- Create indexes script
- Extend product_images script

---

**✅ ANÁLISE COMPLETA**  
**Status:** READY for Migration Plan (15.2)  
**Confidence Level:** HIGH (100%)  
**Breaking Changes:** ZERO  
**Data Loss Risk:** VERY LOW

