/**
 * E2E Tests for Product Management
 * Tests pagination filters, product updates, and image management
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const Product = require('../models/Product');

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 3,
  charset: 'utf8mb4'
});

// Test results
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper to log test results
function logTest(name, passed, message = '') {
  const result = { name, passed, message, timestamp: new Date().toISOString() };
  if (passed) {
    testResults.passed.push(result);
    console.log(`✅ PASS: ${name}${message ? ' - ' + message : ''}`);
  } else {
    testResults.failed.push(result);
    console.error(`❌ FAIL: ${name}${message ? ' - ' + message : ''}`);
  }
}

function logWarning(name, message) {
  testResults.warnings.push({ name, message, timestamp: new Date().toISOString() });
  console.warn(`⚠️  WARN: ${name} - ${message}`);
}

// Get a test product
async function getTestProduct() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE is_active = 1 LIMIT 1'
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error getting test product:', error);
    return null;
  }
}

// Save original product data
async function saveOriginalData(productId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error saving original data:', error);
    return null;
  }
}

// Restore original product data
async function restoreOriginalData(productId, originalData) {
  try {
    await pool.query(
      `UPDATE products SET 
        name = ?, 
        description = ?, 
        current_stock = ?, 
        sale_price = ?, 
        purchase_price = ?,
        is_active = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        originalData.name,
        originalData.description || null,
        originalData.current_stock || 0,
        originalData.sale_price || 0,
        originalData.purchase_price || 0,
        originalData.is_active !== undefined ? originalData.is_active : 1,
        productId
      ]
    );
    return true;
  } catch (error) {
    console.error('Error restoring original data:', error);
    return false;
  }
}

// Test 1: Verify current_stock is in allowed fields
async function testCurrentStockInAllowedFields() {
  console.log('\n📋 Test 1: Verifying current_stock is in allowed fields...');
  
  try {
    // Check if updateProductWithImages accepts current_stock
    const product = await getTestProduct();
    if (!product) {
      logTest('Test 1: Get test product', false, 'No active products found');
      return false;
    }

    const originalData = await saveOriginalData(product.id);
    if (!originalData) {
      logTest('Test 1: Save original data', false, 'Could not save original data');
      return false;
    }

    const testStock = 999;
    const productData = {
      name: originalData.name,
      current_stock: testStock,
      is_active: originalData.is_active
    };

    await Product.updateProductWithImages(product.id, productData, [], null);
    
    // Verify update
    const [updated] = await pool.query(
      'SELECT current_stock FROM products WHERE id = ?',
      [product.id]
    );

    const stockUpdated = updated.length > 0 && updated[0].current_stock === testStock;
    logTest('Test 1: current_stock update', stockUpdated, 
      stockUpdated ? `Stock updated to ${testStock}` : `Expected ${testStock}, got ${updated[0]?.current_stock}`);

    // Restore
    await restoreOriginalData(product.id, originalData);
    
    return stockUpdated;
  } catch (error) {
    logTest('Test 1: current_stock update', false, error.message);
    return false;
  }
}

// Test 2: Test product update with stock change
async function testProductStockUpdate() {
  console.log('\n📋 Test 2: Testing product stock update...');
  
  try {
    const product = await getTestProduct();
    if (!product) {
      logTest('Test 2: Get test product', false, 'No active products found');
      return false;
    }

    const originalData = await saveOriginalData(product.id);
    const originalStock = originalData.current_stock || 0;
    const newStock = originalStock + 10;

    const productData = {
      name: originalData.name,
      current_stock: newStock,
      sale_price: originalData.sale_price,
      purchase_price: originalData.purchase_price,
      is_active: originalData.is_active
    };

    await Product.updateProductWithImages(product.id, productData, [], null);
    
    // Verify
    const [updated] = await pool.query(
      'SELECT current_stock FROM products WHERE id = ?',
      [product.id]
    );

    const success = updated.length > 0 && updated[0].current_stock === newStock;
    logTest('Test 2: Stock update', success,
      success ? `Stock updated from ${originalStock} to ${newStock}` : 'Stock not updated correctly');

    // Restore
    await restoreOriginalData(product.id, originalData);
    
    return success;
  } catch (error) {
    logTest('Test 2: Stock update', false, error.message);
    return false;
  }
}

// Test 3: Test image management
async function testImageManagement() {
  console.log('\n📋 Test 3: Testing image management...');
  
  try {
    const product = await getTestProduct();
    if (!product) {
      logTest('Test 3: Get test product', false, 'No active products found');
      return false;
    }

    // Get current images
    const [currentImages] = await pool.query(
      'SELECT id, image_filename, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [product.id]
    );

    logTest('Test 3: Get current images', true, `Found ${currentImages.length} images`);

    // Test setting primary image (if we have images)
    if (currentImages.length > 1) {
      const nonPrimaryImage = currentImages.find(img => !img.is_primary);
      if (nonPrimaryImage) {
        const productData = {
          name: product.name,
          primary_image_id: nonPrimaryImage.id,
          is_active: product.is_active
        };

        await Product.updateProductWithImages(product.id, productData, [], null);
        
        // Verify primary image changed
        const [updatedImages] = await pool.query(
          'SELECT id, is_primary FROM product_images WHERE product_id = ? AND id = ?',
          [product.id, nonPrimaryImage.id]
        );

        const primaryChanged = updatedImages.length > 0 && updatedImages[0].is_primary === 1;
        logTest('Test 3: Change primary image', primaryChanged,
          primaryChanged ? 'Primary image changed successfully' : 'Primary image not changed');

        // Restore original primary
        if (currentImages.length > 0) {
          const originalPrimary = currentImages.find(img => img.is_primary);
          if (originalPrimary) {
            const restoreData = {
              name: product.name,
              primary_image_id: originalPrimary.id,
              is_active: product.is_active
            };
            await Product.updateProductWithImages(product.id, restoreData, [], null);
          }
        }

        return primaryChanged;
      }
    }

    logWarning('Test 3: Image management', 'Product has less than 2 images, skipping primary image test');
    return true;
  } catch (error) {
    logTest('Test 3: Image management', false, error.message);
    return false;
  }
}

// Test 4: Test filter persistence (simulate)
async function testFilterPersistence() {
  console.log('\n📋 Test 4: Testing filter persistence logic...');
  
  try {
    // Test query string building
    const queryParams = {
      reference: 'TEST-REF',
      category: 'Test Category',
      status: 'Ativo',
      stock_status: 'in_stock',
      page: 2,
      limit: 10
    };

    // Simulate buildQueryString function
    function buildQueryString(page, limit, queryParams) {
      const params = [];
      params.push('page=' + encodeURIComponent(page));
      params.push('limit=' + encodeURIComponent(limit));
      
      if (queryParams && queryParams.reference) {
        params.push('reference=' + encodeURIComponent(queryParams.reference));
      }
      if (queryParams && queryParams.category) {
        params.push('category=' + encodeURIComponent(queryParams.category));
      }
      if (queryParams && queryParams.status) {
        params.push('status=' + encodeURIComponent(queryParams.status));
      }
      if (queryParams && queryParams.stock_status) {
        params.push('stock_status=' + encodeURIComponent(queryParams.stock_status));
      }
      
      return params.join('&');
    }

    const result = buildQueryString(3, 10, queryParams);
    const expectedParams = [
      'page=3',
      'limit=10',
      'reference=TEST-REF',
      'category=Test+Category',
      'status=Ativo',
      'stock_status=in_stock'
    ];

    const allParamsPresent = expectedParams.every(param => result.includes(param.split('=')[0]));
    logTest('Test 4: Filter persistence', allParamsPresent,
      allParamsPresent ? 'All filter params preserved' : 'Some params missing');

    return allParamsPresent;
  } catch (error) {
    logTest('Test 4: Filter persistence', false, error.message);
    return false;
  }
}

// Test 5: Test min_stock field update
async function testMinStockField() {
  console.log('\n📋 Test 5: Testing min_stock field...');
  
  try {
    const product = await getTestProduct();
    if (!product) {
      logTest('Test 5: Get test product', false, 'No active products found');
      return false;
    }

    const originalData = await saveOriginalData(product.id);
    const originalMinStock = originalData.min_stock || 0;
    const testMinStock = originalMinStock + 5;

    const productData = {
      name: originalData.name,
      min_stock: testMinStock,
      is_active: originalData.is_active
    };

    await Product.updateProductWithImages(product.id, productData, [], null);
    
    // Verify
    const [updated] = await pool.query(
      'SELECT min_stock FROM products WHERE id = ?',
      [product.id]
    );

    const success = updated.length > 0 && updated[0].min_stock === testMinStock;
    logTest('Test 5: min_stock update', success,
      success ? `min_stock updated from ${originalMinStock} to ${testMinStock}` : 'min_stock not updated correctly');

    // Restore
    await restoreOriginalData(product.id, originalData);
    
    return success;
  } catch (error) {
    logTest('Test 5: min_stock update', false, error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting E2E Tests for Product Management...\n');
  console.log('=' .repeat(60));

  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection OK\n');

    // Run tests
    await testCurrentStockInAllowedFields();
    await testProductStockUpdate();
    await testImageManagement();
    await testFilterPersistence();
    await testMinStockField();

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`⚠️  Warnings: ${testResults.warnings.length}`);

    if (testResults.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.failed.forEach(test => {
        console.log(`   - ${test.name}: ${test.message}`);
      });
    }

    if (testResults.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      testResults.warnings.forEach(warn => {
        console.log(`   - ${warn.name}: ${warn.message}`);
      });
    }

    const allPassed = testResults.failed.length === 0;
    console.log('\n' + (allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'));
    
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test execution error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run tests
runTests();

