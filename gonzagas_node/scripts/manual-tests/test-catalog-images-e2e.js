/**
 * E2E Tests for Catalog Images
 * Tests that product images are loading and displaying correctly
 */

const puppeteer = require('puppeteer');

class CatalogImagesTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3000';
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testImageLoading() {
    console.log('\n🧪 Testing: Product images load correctly');
    
    try {
      await this.page.goto(`${this.baseUrl}/catalog`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Wait for products grid
      await this.page.waitForSelector('#products-grid', { timeout: 10000 });
      
      // Wait for images to start loading
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get all product images
      const images = await this.page.evaluate(() => {
        const imgElements = Array.from(document.querySelectorAll('.product-image'));
        return imgElements.map(img => ({
          src: img.src,
          dataSrc: img.dataset.src,
          alt: img.alt,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          opacity: window.getComputedStyle(img).opacity,
          visibility: window.getComputedStyle(img).visibility,
          display: window.getComputedStyle(img).display
        }));
      });

      console.log(`📊 Found ${images.length} product images`);

      if (images.length === 0) {
        throw new Error('No product images found on page');
      }

      // Check image visibility
      const visibleImages = images.filter(img => 
        img.opacity !== '0' && 
        img.visibility !== 'hidden' && 
        img.display !== 'none'
      );

      console.log(`✅ ${visibleImages.length}/${images.length} images are visible`);

      // Check if images have src
      const imagesWithSrc = images.filter(img => img.src && img.src !== '');
      console.log(`✅ ${imagesWithSrc.length}/${images.length} images have src set`);

      // Check if images are loaded
      const loadedImages = images.filter(img => img.complete && img.naturalWidth > 0);
      console.log(`✅ ${loadedImages.length}/${images.length} images are loaded`);

      // Wait a bit more for lazy loading
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check again after wait
      const imagesAfterWait = await this.page.evaluate(() => {
        const imgElements = Array.from(document.querySelectorAll('.product-image'));
        return imgElements.map(img => ({
          src: img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          opacity: window.getComputedStyle(img).opacity,
          visibility: window.getComputedStyle(img).visibility
        }));
      });

      const loadedAfterWait = imagesAfterWait.filter(img => 
        img.complete && img.naturalWidth > 0 && 
        img.opacity !== '0' && img.visibility !== 'hidden'
      );

      console.log(`✅ After wait: ${loadedAfterWait.length}/${imagesAfterWait.length} images loaded and visible`);

      // Test image URLs
      const imageUrls = images.filter(img => img.src).map(img => img.src);
      const validUrls = imageUrls.filter(url => 
        url.includes('/media/products/') || url.includes('/images/imagem-nao-disponivel') || url.includes('placeholder')
      );

      console.log(`✅ ${validUrls.length}/${imageUrls.length} images have valid URLs`);

      // Check for broken images
      const brokenImages = await this.page.evaluate(() => {
        const imgElements = Array.from(document.querySelectorAll('.product-image'));
        return imgElements.filter(img => {
          return img.complete && img.naturalWidth === 0 && img.naturalHeight === 0;
        }).length;
      });

      if (brokenImages > 0) {
        console.warn(`⚠️  ${brokenImages} images appear to be broken`);
      } else {
        console.log('✅ No broken images detected');
      }

      // Success criteria
      const success = 
        images.length > 0 &&
        visibleImages.length > 0 &&
        imagesWithSrc.length > 0 &&
        loadedAfterWait.length > 0 &&
        validUrls.length > 0;

      if (success) {
        console.log('✅ PASS: Images are loading and visible');
        return true;
      } else {
        console.error('❌ FAIL: Images are not loading correctly');
        return false;
      }

    } catch (error) {
      console.error('❌ Error testing images:', error.message);
      return false;
    }
  }

  async testImagePaths() {
    console.log('\n🧪 Testing: Image paths are correct');
    
    try {
      await this.page.goto(`${this.baseUrl}/catalog`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      await this.page.waitForSelector('#products-grid', { timeout: 10000 });

      const imagePaths = await this.page.evaluate(() => {
        const imgElements = Array.from(document.querySelectorAll('.product-image'));
        return imgElements.map(img => ({
          src: img.src,
          dataSrc: img.dataset.src,
          expectedPath: img.src ? new URL(img.src).pathname : null
        }));
      });

      const validPaths = imagePaths.filter(path => 
        path.expectedPath && (
          path.expectedPath.startsWith('/media/products/') ||
          path.expectedPath.includes('/images/imagem-nao-disponivel') ||
          path.expectedPath.includes('placeholder')
        )
      );

      console.log(`✅ ${validPaths.length}/${imagePaths.length} images have valid paths`);

      // Test if images are accessible
      const accessibleImages = [];
      for (const path of imagePaths.slice(0, 5)) { // Test first 5
        if (path.expectedPath && path.expectedPath.startsWith('/media/products/')) {
          const response = await this.page.goto(`${this.baseUrl}${path.expectedPath}`, {
            waitUntil: 'networkidle0',
            timeout: 5000
          }).catch(() => null);
          
          if (response && response.status() === 200) {
            accessibleImages.push(path.expectedPath);
          }
        }
      }

      console.log(`✅ ${accessibleImages.length}/5 tested images are accessible`);

      return validPaths.length > 0;

    } catch (error) {
      console.error('❌ Error testing image paths:', error.message);
      return false;
    }
  }

  async testLazyLoading() {
    console.log('\n🧪 Testing: Lazy loading functionality');
    
    try {
      await this.page.goto(`${this.baseUrl}/catalog`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      await this.page.waitForSelector('#products-grid', { timeout: 10000 });

      // Check initial state
      const initialImages = await this.page.evaluate(() => {
        return Array.from(document.querySelectorAll('.product-image.lazy-load')).length;
      });

      console.log(`📊 Found ${initialImages} lazy-load images`);

      // Scroll to trigger lazy loading
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check loaded state
      const loadedImages = await this.page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('.product-image'));
        return imgs.filter(img => 
          img.classList.contains('lazy-loaded') || 
          (img.complete && img.naturalWidth > 0)
        ).length;
      });

      console.log(`✅ ${loadedImages} images loaded after scroll`);

      return loadedImages > 0;

    } catch (error) {
      console.error('❌ Error testing lazy loading:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Catalog Images E2E Tests\n');
    console.log('='.repeat(60));

    try {
      await this.init();

      const results = {
        imageLoading: await this.testImageLoading(),
        imagePaths: await this.testImagePaths(),
        lazyLoading: await this.testLazyLoading()
      };

      console.log('\n' + '='.repeat(60));
      console.log('📊 TEST SUMMARY');
      console.log('='.repeat(60));
      
      const passed = Object.values(results).filter(r => r).length;
      const total = Object.keys(results).length;

      console.log(`✅ Passed: ${passed}`);
      console.log(`❌ Failed: ${total - passed}`);
      console.log(`📈 Total: ${total}`);
      console.log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

      console.log('\n📋 Detailed Results:');
      Object.entries(results).forEach(([test, result]) => {
        console.log(`  ${result ? '✅' : '❌'} ${test}`);
      });

      return passed === total;

    } catch (error) {
      console.error('❌ Test suite error:', error);
      return false;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CatalogImagesTester();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = CatalogImagesTester;

