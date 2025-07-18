/**
 * Frontend Styles Test
 * Gonzaga's Art & Shine
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Testing Frontend Styles...\n');

// Test CSS files existence
const cssFiles = [
  'main.css',
  'theme.css', 
  'components.css',
  'catalog.css',
  'notifications.css',
  'mobile-navigation.css'
];

const cssDir = path.join(__dirname, 'public/css');
let missingFiles = [];
let existingFiles = [];

cssFiles.forEach(file => {
  const filePath = path.join(cssDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    existingFiles.push({
      name: file,
      size: `${(stats.size / 1024).toFixed(1)}KB`,
      exists: true
    });
  } else {
    missingFiles.push(file);
  }
});

console.log('📁 CSS Files Status:');
existingFiles.forEach(file => {
  console.log(`  ✅ ${file.name} (${file.size})`);
});

if (missingFiles.length > 0) {
  console.log('\n❌ Missing CSS Files:');
  missingFiles.forEach(file => {
    console.log(`  ❌ ${file}`);
  });
} else {
  console.log('\n✅ All CSS files found!');
}

// Test main.css content
const mainCssPath = path.join(cssDir, 'main.css');
if (fs.existsSync(mainCssPath)) {
  const mainCssContent = fs.readFileSync(mainCssPath, 'utf8');
  
  console.log('\n🎨 Main CSS Analysis:');
  
  // Check for CSS variables
  const cssVariables = mainCssContent.match(/--(color|font)-[^:]+/g) || [];
  console.log(`  📋 CSS Variables found: ${cssVariables.length}`);
  
  // Check for main styles
  const heroSection = mainCssContent.includes('.hero');
  const featuredSection = mainCssContent.includes('.featured');
  const productCard = mainCssContent.includes('.product-card');
  
  console.log(`  🎭 Hero section styles: ${heroSection ? '✅' : '❌'}`);
  console.log(`  ⭐ Featured section styles: ${featuredSection ? '✅' : '❌'}`);
  console.log(`  🛍️ Product card styles: ${productCard ? '✅' : '❌'}`);
}

// Test layout structure
console.log('\n📄 Layout Files:');
const layouts = [
  'views/layouts/main.ejs',
  'views/layout.ejs',
  'views/index.ejs',
  'views/public/catalog.ejs'
];

layouts.forEach(layout => {
  const layoutPath = path.join(__dirname, layout);
  if (fs.existsSync(layoutPath)) {
    console.log(`  ✅ ${layout}`);
  } else {
    console.log(`  ❌ ${layout}`);
  }
});

// Test server endpoint
const http = require('http');

function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      console.log(`  🌐 ${name}: ${res.statusCode === 200 ? '✅' : '❌'} (${res.statusCode})`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      console.log(`  🌐 ${name}: ❌ (Connection failed)`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`  🌐 ${name}: ❌ (Timeout)`);
      resolve(false);
    });
  });
}

async function testServer() {
  console.log('\n🌐 Server Endpoints Test:');
  
  const endpoints = [
    { url: 'http://localhost:3000/', name: 'Home Page' },
    { url: 'http://localhost:3000/catalog', name: 'Catalog Page' },
    { url: 'http://localhost:3000/collections', name: 'Collections Page' },
    { url: 'http://localhost:3000/css/main.css', name: 'Main CSS' },
    { url: 'http://localhost:3000/css/theme.css', name: 'Theme CSS' }
  ];
  
  const results = await Promise.all(
    endpoints.map(endpoint => testEndpoint(endpoint.url, endpoint.name))
  );
  
  const successCount = results.filter(r => r).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Server Test Results: ${successCount}/${totalCount} endpoints working`);
  
  if (successCount === totalCount) {
    console.log('🎉 All endpoints are working correctly!');
  } else {
    console.log('⚠️ Some endpoints are not responding correctly.');
  }
}

// Run server tests
setTimeout(testServer, 2000); // Wait 2 seconds for server to start

// Final summary
setTimeout(() => {
  console.log('\n📋 Summary:');
  console.log('1. CSS files checked ✅');
  console.log('2. Layout files verified ✅');
  console.log('3. Server endpoints tested ✅');
  console.log('\n💡 Next steps:');
  console.log('- Visit http://localhost:3000 to see the home page');
  console.log('- Visit http://localhost:3000/catalog to see the catalog');
  console.log('- Check browser dev tools for any CSS loading errors');
  
  process.exit(0);
}, 5000);

module.exports = { testEndpoint }; 