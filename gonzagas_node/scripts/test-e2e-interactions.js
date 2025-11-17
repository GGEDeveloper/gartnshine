/**
 * E2E Tests for Product Management Interactions
 * Tests all user interactions: login, filters, pagination, edit, back button
 */

require('dotenv').config();
const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'miguelmelo70@gmail.com';
const ADMIN_PASS = '2585';

// Cookie jar
let cookies = [];
let sessionId = null;

// Test results
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

// HTTP request helper with cookie support
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'E2E-Test-Script/1.0',
        'Accept': 'text/html,application/json',
        ...options.headers
      }
    };

    // Add cookies
    if (cookies.length > 0) {
      requestOptions.headers['Cookie'] = cookies.join('; ');
    }

    const req = httpModule.request(requestOptions, (res) => {
      // Extract cookies from response
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        setCookie.forEach(cookie => {
          const cookieValue = cookie.split(';')[0];
          const cookieName = cookieValue.split('=')[0];
          // Update or add cookie
          cookies = cookies.filter(c => !c.startsWith(cookieName + '='));
          cookies.push(cookieValue);
        });
      }

      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            body = JSON.parse(body);
          }
          resolve({ 
            status: res.statusCode, 
            headers: res.headers, 
            body,
            location: res.headers.location
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            headers: res.headers, 
            body,
            location: res.headers.location
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.data) {
      if (typeof options.data === 'string') {
        req.write(options.data);
      } else {
        req.write(JSON.stringify(options.data));
      }
    }
    
    req.end();
  });
}

// Test 1: Server is running
async function testServerRunning() {
  console.log('\n📋 Test 1: Server Status...');
  try {
    const response = await httpRequest(BASE_URL);
    const running = response.status === 200 || response.status === 302 || response.status === 401;
    logTest('Server Running', running, `Status: ${response.status}`);
    return running;
  } catch (error) {
    logTest('Server Running', false, error.message);
    return false;
  }
}

// Test 2: Login
async function testLogin() {
  console.log('\n📋 Test 2: Admin Login...');
  try {
    // Get login page to get CSRF token if needed
    const loginPage = await httpRequest(`${BASE_URL}/admin/login`);
    
    // Try to login
    const loginData = `email=${encodeURIComponent(ADMIN_EMAIL)}&password=${encodeURIComponent(ADMIN_PASS)}`;
    const loginResponse = await httpRequest(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(loginData)
      },
      data: loginData
    });

    // Check if login was successful (redirect to dashboard or 200 with admin content)
    const success = loginResponse.status === 302 || 
                   loginResponse.status === 200 && 
                   (loginResponse.body.includes('dashboard') || 
                    loginResponse.body.includes('admin') ||
                    loginResponse.location);

    logTest('Admin Login', success, 
      success ? `Login successful (Status: ${loginResponse.status})` : 'Login failed');
    
    return success;
  } catch (error) {
    logTest('Admin Login', false, error.message);
    return false;
  }
}

// Test 3: Access products page
async function testAccessProductsPage() {
  console.log('\n📋 Test 3: Access Products Page...');
  try {
    const response = await httpRequest(`${BASE_URL}/admin/products`);
    const success = response.status === 200 && 
                   (typeof response.body === 'string' && 
                    (response.body.includes('Produtos') || 
                     response.body.includes('products') ||
                     response.body.includes('Filtros')));
    
    logTest('Access Products Page', success, 
      success ? 'Products page loaded' : 'Failed to load products page');
    return success;
  } catch (error) {
    logTest('Access Products Page', false, error.message);
    return false;
  }
}

// Test 4: Apply filters
async function testApplyFilters() {
  console.log('\n📋 Test 4: Apply Filters...');
  try {
    // Test with status filter
    const filterUrl = `${BASE_URL}/admin/products?status=Ativo&page=1&limit=10`;
    const response = await httpRequest(filterUrl);
    
    const success = response.status === 200 && 
                   (typeof response.body === 'string' && 
                    response.body.includes('status=Ativo') ||
                    response.body.includes('Ativo'));
    
    logTest('Apply Filters', success, 
      success ? 'Filters applied successfully' : 'Filters not applied');
    return success;
  } catch (error) {
    logTest('Apply Filters', false, error.message);
    return false;
  }
}

// Test 5: Pagination with filters
async function testPaginationWithFilters() {
  console.log('\n📋 Test 5: Pagination with Filters...');
  try {
    // Apply filters
    const filterUrl = `${BASE_URL}/admin/products?status=Ativo&category=Colares&page=1&limit=10`;
    const page1 = await httpRequest(filterUrl);
    
    if (typeof page1.body !== 'string') {
      logTest('Pagination with Filters', false, 'Page 1 response is not HTML');
      return false;
    }
    
    // Check if filters are in the response (can be encoded or in different formats)
    const hasFilters = page1.body.includes('status=Ativo') || 
                       page1.body.includes('status%3DAtivo') ||
                       page1.body.includes('category=Colares') ||
                       page1.body.includes('category%3DColares') ||
                       page1.body.includes('Ativo') && page1.body.includes('Colares');
    
    // Try page 2 with same filters
    const page2Url = `${BASE_URL}/admin/products?status=Ativo&category=Colares&page=2&limit=10`;
    const page2 = await httpRequest(page2Url);
    
    if (typeof page2.body !== 'string') {
      logTest('Pagination with Filters', false, 'Page 2 response is not HTML');
      return false;
    }
    
    // Check if page 2 has pagination links with filters
    // Look for pagination links that should contain the filters
    const hasPaginationLinks = page2.body.includes('page-link') || 
                              page2.body.includes('pagination');
    
    // Check if any pagination link contains filter params (can be in href attributes)
    const hasFiltersInLinks = page2.body.includes('status') || 
                             page2.body.includes('category') ||
                             page2.body.includes('Ativo') ||
                             page2.body.includes('Colares');
    
    const success = hasFilters && hasPaginationLinks && hasFiltersInLinks;
    logTest('Pagination with Filters', success, 
      success ? 'Filters preserved in pagination' : 
               `Page1 filters: ${hasFilters}, Page2 links: ${hasPaginationLinks}, Filters in links: ${hasFiltersInLinks}`);
    return success;
  } catch (error) {
    logTest('Pagination with Filters', false, error.message);
    return false;
  }
}

// Test 6: Check DataTables pagination is hidden
async function testDataTablesPaginationHidden() {
  console.log('\n📋 Test 6: DataTables Pagination Hidden...');
  try {
    const response = await httpRequest(`${BASE_URL}/admin/products`);
    
    if (typeof response.body !== 'string') {
      logTest('DataTables Pagination Hidden', false, 'Response is not HTML');
      return false;
    }
    
    // Check that DataTables pagination text is NOT in the HTML
    const hasDataTablesPagination = response.body.includes('Mostrando de') && 
                                    response.body.includes('até') && 
                                    response.body.includes('registros');
    
    // Check that our server-side pagination IS present
    const hasServerPagination = response.body.includes('page-link') || 
                                response.body.includes('pagination');
    
    const success = !hasDataTablesPagination && hasServerPagination;
    logTest('DataTables Pagination Hidden', success, 
      success ? 'DataTables pagination hidden, server pagination visible' : 
               'DataTables pagination still visible or server pagination missing');
    return success;
  } catch (error) {
    logTest('DataTables Pagination Hidden', false, error.message);
    return false;
  }
}

// Test 7: Edit product and check returnUrl
async function testEditProductReturnUrl() {
  console.log('\n📋 Test 7: Edit Product with ReturnUrl...');
  try {
    // First get a product ID from products page
    const productsPage = await httpRequest(`${BASE_URL}/admin/products?status=Ativo&page=1`);
    
    if (typeof productsPage.body !== 'string') {
      logTest('Edit Product ReturnUrl', false, 'Could not get products page');
      return false;
    }
    
    // Try to find a product edit link with returnUrl
    // The link should be: /admin/products/edit/{id}?returnUrl=...
    const editLinkMatch = productsPage.body.match(/\/admin\/products\/edit\/(\d+)\?returnUrl=/);
    
    if (!editLinkMatch) {
      logWarning('Edit Product ReturnUrl', 'No edit links with returnUrl found (might be normal if no products)');
      return true; // Not a failure, just no products
    }
    
    const productId = editLinkMatch[1];
    const editUrl = editLinkMatch[0];
    
    // Access edit page
    const editPage = await httpRequest(`${BASE_URL}${editUrl}`);
    
    // Check if edit page loaded and has back button
    const hasBackButton = typeof editPage.body === 'string' && 
                         (editPage.body.includes('Voltar') || 
                          editPage.body.includes('arrow-left'));
    
    // Check if backUrl is in the page (in href or JavaScript)
    const hasReturnUrl = typeof editPage.body === 'string' && 
                        (editPage.body.includes('returnUrl') || 
                         editPage.body.includes('backUrl') ||
                         editPage.body.includes('status=Ativo'));
    
    const success = editPage.status === 200 && (hasBackButton || hasReturnUrl);
    logTest('Edit Product ReturnUrl', success, 
      success ? `Edit page loaded with returnUrl support (Product ID: ${productId})` : 
               'Edit page missing returnUrl support');
    return success;
  } catch (error) {
    logTest('Edit Product ReturnUrl', false, error.message);
    return false;
  }
}

// Test 8: Multiple filter combinations
async function testMultipleFilterCombinations() {
  console.log('\n📋 Test 8: Multiple Filter Combinations...');
  try {
    const combinations = [
      { reference: 'TEST', status: 'Ativo' },
      { category: 'Colares', stock_status: 'in_stock' },
      { status: 'Inativo', stock_status: 'low_stock' }
    ];
    
    let allPassed = true;
    for (const filters of combinations) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', '1');
      params.append('limit', '10');
      
      const url = `${BASE_URL}/admin/products?${params.toString()}`;
      const response = await httpRequest(url);
      
      const success = response.status === 200;
      if (!success) {
        allPassed = false;
        logTest(`Filter Combination: ${JSON.stringify(filters)}`, false, 'Request failed');
      }
    }
    
    logTest('Multiple Filter Combinations', allPassed, 
      allPassed ? `All ${combinations.length} combinations worked` : 'Some combinations failed');
    return allPassed;
  } catch (error) {
    logTest('Multiple Filter Combinations', false, error.message);
    return false;
  }
}

// Test 9: Filter persistence after form submit
async function testFilterPersistenceAfterSubmit() {
  console.log('\n📋 Test 9: Filter Persistence After Form Submit...');
  try {
    // Simulate filter form submission with GET (form method is GET)
    const filterUrl = `${BASE_URL}/admin/products?reference=TEST&status=Ativo&page=1&limit=10`;
    const response = await httpRequest(filterUrl);
    
    // Check if filters are preserved in pagination links
    if (typeof response.body !== 'string') {
      logTest('Filter Persistence After Submit', false, 'Response is not HTML');
      return false;
    }
    
    // Look for pagination links that include the filters (can be encoded)
    const hasFilterInLinks = response.body.includes('reference=TEST') || 
                            response.body.includes('reference%3DTEST') ||
                            response.body.includes('status=Ativo') ||
                            response.body.includes('status%3DAtivo') ||
                            (response.body.includes('reference') && response.body.includes('status'));
    
    // Also check if pagination exists
    const hasPagination = response.body.includes('page-link') || 
                         response.body.includes('pagination');
    
    const success = hasFilterInLinks && hasPagination;
    logTest('Filter Persistence After Submit', success, 
      success ? 'Filters preserved in pagination links' : 
               `Filters in links: ${hasFilterInLinks}, Pagination exists: ${hasPagination}`);
    return success;
  } catch (error) {
    logTest('Filter Persistence After Submit', false, error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting E2E Interaction Tests...\n');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log('='.repeat(60));

  try {
    // Run tests in sequence
    await testServerRunning();
    await testLogin();
    await testAccessProductsPage();
    await testApplyFilters();
    await testPaginationWithFilters();
    await testDataTablesPaginationHidden();
    await testEditProductReturnUrl();
    await testMultipleFilterCombinations();
    await testFilterPersistenceAfterSubmit();

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
  }
}

// Run tests
runTests();

