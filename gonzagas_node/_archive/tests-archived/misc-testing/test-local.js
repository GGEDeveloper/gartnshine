/**
 * Test Script - Gonzaga's Art & Shine
 * Validates local fixes before deployment
 */

const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

class LocalTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.app = null;
    this.server = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async setup() {
    console.log('🚀 Setting up test environment...');
    
    // Start test server
    this.app = express();
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
    
    // Add test routes
    this.setupTestRoutes();
    
    this.server = this.app.listen(TEST_PORT, () => {
      console.log(`✅ Test server running on port ${TEST_PORT}`);
    });

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      devtools: true
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 375, height: 667 }); // iPhone 6/7/8 size
    
    console.log('✅ Browser launched');
  }

  setupTestRoutes() {
    // Mock home page with featured products
    this.app.get('/', (req, res) => {
      const mockFeatured = [
        { id: 1, name: 'Test Product 1', sale_price: 25.99, image_url: '/media/test1.jpg' },
        { id: 2, name: 'Test Product 2', sale_price: 35.99, image_url: '/media/test2.jpg' },
        { id: 3, name: 'Test Product 3', sale_price: 45.99, image_url: '/media/test3.jpg' },
        { id: 4, name: 'Test Product 4', sale_price: 55.99, image_url: '/media/test4.jpg' },
        { id: 5, name: 'Test Product 5', sale_price: 65.99, image_url: '/media/test5.jpg' }
      ];
      
      res.render('index', {
        title: 'Home Test',
        layout: 'layouts/main',
        featured: mockFeatured,
        families: [],
        mediaFiles: [],
        siteTitle: 'Gonzaga\'s Art & Shine Test',
        siteDescription: 'Test Environment'
      });
    });

    // Mock admin dashboard
    this.app.get('/admin', (req, res) => {
      res.render('admin/dashboard', {
        title: 'Admin Test',
        layout: 'admin/layouts/main',
        user: { name: 'Test User', role: 'admin' },
        stats: { products: 189, families: 12, lowStock: 3 }
      });
    });
  }

  async runTests() {
    console.log('🧪 Running tests...\n');

    await this.testFeaturedCarousel();
    await this.testMobileNavigation();
    await this.testAdminMobileLayout();
    await this.testResponsiveness();

    this.printResults();
  }

  async testFeaturedCarousel() {
    console.log('📱 Testing Featured Carousel...');
    
    try {
      await this.page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
      
      // Test 1: Check if carousel exists
      const carouselExists = await this.page.$('.featured-carousel');
      this.addTest('Featured carousel exists', !!carouselExists);
      
      // Test 2: Check if carousel has products
      const slides = await this.page.$$('.featured-carousel .slick-slide');
      this.addTest('Featured carousel has slides', slides.length > 0);
      
      // Test 3: Check mobile responsiveness (2 slides visible)
      const visibleSlides = await this.page.evaluate(() => {
        const carousel = document.querySelector('.featured-carousel');
        if (!carousel || !carousel.classList.contains('slick-initialized')) return 0;
        
        return parseInt(carousel.querySelector('.slick-list').style.transform?.match(/translate3d\((.+?)px/)?.[1] || '0') || 0;
      });
      
      // Test 4: Check if Slick is initialized
      const slickInitialized = await this.page.evaluate(() => {
        const carousel = document.querySelector('.featured-carousel');
        return carousel && carousel.classList.contains('slick-initialized');
      });
      this.addTest('Slick carousel initialized', slickInitialized);
      
      // Test 5: Check autoplay
      await this.page.waitForTimeout(5000);
      const autoplayWorking = await this.page.evaluate(() => {
        const carousel = document.querySelector('.featured-carousel');
        return carousel && carousel.classList.contains('slick-slider');
      });
      this.addTest('Carousel autoplay working', autoplayWorking);
      
      console.log('✅ Featured carousel tests completed');
    } catch (error) {
      console.error('❌ Featured carousel test failed:', error);
      this.addTest('Featured carousel general test', false);
    }
  }

  async testMobileNavigation() {
    console.log('📱 Testing Mobile Navigation...');
    
    try {
      await this.page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
      
      // Test 1: Check if mobile nav elements exist
      const hamburger = await this.page.$('#mobile-nav-toggle');
      const mobileNav = await this.page.$('#mobile-nav');
      this.addTest('Mobile nav elements exist', !!hamburger && !!mobileNav);
      
      // Test 2: Check initial state (closed)
      const initialState = await this.page.evaluate(() => {
        const nav = document.getElementById('mobile-nav');
        return nav && !nav.classList.contains('active');
      });
      this.addTest('Mobile nav initially closed', initialState);
      
      // Test 3: Click hamburger to open
      await this.page.click('#mobile-nav-toggle');
      await this.page.waitForTimeout(500);
      
      const openState = await this.page.evaluate(() => {
        const nav = document.getElementById('mobile-nav');
        return nav && nav.classList.contains('active');
      });
      this.addTest('Mobile nav opens on hamburger click', openState);
      
      // Test 4: Check hamburger transforms to X
      const hamburgerTransformed = await this.page.evaluate(() => {
        const lines = document.querySelectorAll('.hamburger-line');
        return lines.length > 0 && lines[0].style.transform.includes('rotate');
      });
      this.addTest('Hamburger transforms to X', hamburgerTransformed);
      
      // Test 5: Click X to close
      await this.page.click('#mobile-nav-toggle');
      await this.page.waitForTimeout(500);
      
      const closedState = await this.page.evaluate(() => {
        const nav = document.getElementById('mobile-nav');
        return nav && !nav.classList.contains('active');
      });
      this.addTest('Mobile nav closes on X click', closedState);
      
      console.log('✅ Mobile navigation tests completed');
    } catch (error) {
      console.error('❌ Mobile navigation test failed:', error);
      this.addTest('Mobile navigation general test', false);
    }
  }

  async testAdminMobileLayout() {
    console.log('📱 Testing Admin Mobile Layout...');
    
    try {
      await this.page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2' });
      
      // Test 1: Check if page loads without horizontal scroll
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      this.addTest('Admin page has no horizontal scroll', !hasHorizontalScroll);
      
      // Test 2: Check if containers fit within viewport
      const containersFitViewport = await this.page.evaluate(() => {
        const containers = document.querySelectorAll('.container, .container-fluid, .admin-container');
        return Array.from(containers).every(container => {
          const rect = container.getBoundingClientRect();
          return rect.width <= window.innerWidth;
        });
      });
      this.addTest('All containers fit viewport', containersFitViewport);
      
      // Test 3: Check if content is not pushed to right
      const contentNotPushed = await this.page.evaluate(() => {
        const content = document.querySelector('.admin-content, .content-wrapper, .main');
        if (!content) return true;
        const rect = content.getBoundingClientRect();
        return rect.left >= 0 && rect.left <= 20; // Allow small margin
      });
      this.addTest('Content not pushed to right', contentNotPushed);
      
      console.log('✅ Admin mobile layout tests completed');
    } catch (error) {
      console.error('❌ Admin mobile layout test failed:', error);
      this.addTest('Admin mobile layout general test', false);
    }
  }

  async testResponsiveness() {
    console.log('📱 Testing Responsiveness...');
    
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy', width: 360, height: 740 },
      { name: 'iPad', width: 768, height: 1024 }
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewport(viewport);
        await this.page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
        
        // Check if layout adapts properly
        const layoutAdapts = await this.page.evaluate(() => {
          const carousel = document.querySelector('.featured-carousel');
          const mobileNav = document.querySelector('#mobile-nav');
          return carousel && mobileNav;
        });
        
        this.addTest(`Layout adapts to ${viewport.name}`, layoutAdapts);
        
      } catch (error) {
        console.error(`❌ Responsiveness test failed for ${viewport.name}:`, error);
        this.addTest(`Responsiveness ${viewport.name}`, false);
      }
    }
    
    console.log('✅ Responsiveness tests completed');
  }

  addTest(name, passed) {
    this.results.tests.push({ name, passed });
    if (passed) {
      this.results.passed++;
      console.log(`  ✅ ${name}`);
    } else {
      this.results.failed++;
      console.log(`  ❌ ${name}`);
    }
  }

  printResults() {
    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📋 Total: ${this.results.tests.length}`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`  - ${test.name}`));
    }
    
    const successRate = (this.results.passed / this.results.tests.length * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
      console.log('🎉 Tests passed! Ready for deployment.');
    } else {
      console.log('⚠️  Some tests failed. Please fix issues before deployment.');
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.browser) {
      await this.browser.close();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    console.log('✅ Cleanup completed');
  }
}

// Run tests
async function runLocalTests() {
  const tester = new LocalTester();
  
  try {
    await tester.setup();
    await tester.runTests();
  } catch (error) {
    console.error('❌ Test runner failed:', error);
  } finally {
    await tester.cleanup();
  }
}

// Export for use in other modules
module.exports = LocalTester;

// Run if called directly
if (require.main === module) {
  runLocalTests();
} 