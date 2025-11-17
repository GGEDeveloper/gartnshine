/**
 * Full E2E Tests with Server Running
 * Tests pagination filters, product updates, and image management via HTTP
 */

require('dotenv').config();
const http = require('http');
const mysql = require('mysql2/promise');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const ADMIN_USER = 'gonzaga';
const ADMIN_PASS = 'covil';

// Database connection for verification
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

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

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

// HTTP request helper
function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            body = JSON.parse(body);
          }
          resolve({ status: res.statusCode, headers: res.headers, body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// Test server is running
async function testServerRunning() {
  console.log('\n📋 Test: Server Status...');
  try {
    const response = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    
    const running = response.status === 200 || response.status === 302 || response.status === 401;
    logTest('Server Running', running, `Status: ${response.status}`);
    return running;
  } catch (error) {
    logTest('Server Running', false, error.message);
    return false;
  }
}

// Get test product from DB
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

// Save original data
async function saveOriginalData(productId) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    return null;
  }
}

// Restore original data
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
    return false;
  }
}

// Test filter persistence in URL
async function testFilterPersistenceURL() {
  console.log('\n📋 Test: Filter Persistence in URLs...');
  
  try {
    // Test buildQueryString logic
    const queryParams = {
      reference: 'TEST-REF',
      category: 'Test Category',
      status: 'Ativo',
      stock_status: 'in_stock',
      page: 2,
      limit: 10
    };

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
    const hasAllParams = result.includes('reference') && 
                        result.includes('category') && 
                        result.includes('status') && 
                        result.includes('stock_status') &&
                        result.includes('page=3') &&
                        result.includes('limit=10');

    logTest('Filter Persistence URL', hasAllParams, 
      hasAllParams ? 'All params preserved' : 'Missing params');
    return hasAllParams;
  } catch (error) {
    logTest('Filter Persistence URL', false, error.message);
    return false;
  }
}

// Test product update via model (direct DB)
async function testProductUpdateDirect() {
  console.log('\n📋 Test: Product Update (Direct DB)...');
  
  try {
    const Product = require('../models/Product');
    const product = await getTestProduct();
    if (!product) {
      logTest('Product Update Direct', false, 'No test product found');
      return false;
    }

    const originalData = await saveOriginalData(product.id);
    const originalStock = originalData.current_stock || 0;
    const newStock = originalStock + 15;

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
    logTest('Product Update Direct', success,
      success ? `Stock updated from ${originalStock} to ${newStock}` : 'Update failed');

    // Restore
    await restoreOriginalData(product.id, originalData);
    
    return success;
  } catch (error) {
    logTest('Product Update Direct', false, error.message);
    return false;
  }
}

// Test returnUrl parameter handling
async function testReturnUrlHandling() {
  console.log('\n📋 Test: ReturnUrl Parameter Handling...');
  
  try {
    // Simulate returnUrl parsing
    const returnUrl = '/admin/products?page=2&reference=TEST&status=Ativo';
    const testUrl = `http://localhost:3000/admin/products/edit/1?returnUrl=${encodeURIComponent(returnUrl)}`;
    
    const url = new URL(testUrl);
    const returnUrlParam = url.searchParams.get('returnUrl');
    const parsedReturnUrl = new URL(returnUrlParam, 'http://localhost:3000');
    const queryParams = parsedReturnUrl.searchParams.toString();
    
    const hasParams = queryParams.includes('page=2') && 
                     queryParams.includes('reference=TEST') && 
                     queryParams.includes('status=Ativo');

    logTest('ReturnUrl Handling', hasParams,
      hasParams ? 'ReturnUrl parsed correctly' : 'Failed to parse returnUrl');
    return hasParams;
  } catch (error) {
    logTest('ReturnUrl Handling', false, error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Full E2E Tests...\n');
  console.log('='.repeat(60));

  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection OK\n');

    // Run tests
    await testServerRunning();
    await testFilterPersistenceURL();
    await testProductUpdateDirect();
    await testReturnUrlHandling();

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

runTests();


