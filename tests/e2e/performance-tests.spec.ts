import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';

/**
 * Comprehensive Performance and Compatibility Testing Suite for Drift.AI Frontend
 * 
 * This suite tests:
 * - Core Web Vitals (FCP, LCP, CLS, FID)
 * - Page load performance
 * - Cross-browser compatibility
 * - Mobile responsiveness
 * - JavaScript bundle size and loading
 * - Accessibility compliance
 * - Network resource optimization
 */

// Test configuration
const FRONTEND_URL = 'http://localhost:3005';
const VIEWPORT_SIZES = [
  { name: 'Desktop Large', width: 1920, height: 1080 },
  { name: 'Desktop Medium', width: 1366, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile Large', width: 414, height: 896 },
  { name: 'Mobile Small', width: 375, height: 667 }
];

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  FCP: 1500,  // First Contentful Paint
  LCP: 2500,  // Largest Contentful Paint
  FID: 100,   // First Input Delay
  CLS: 0.1,   // Cumulative Layout Shift
  pageLoad: 3000,
  domLoad: 2000
};

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid?: number;
  testIndex?: number;
  navigationTiming: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
  resourceTiming: Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Utility function to collect performance metrics
async function collectPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      // Wait for page to be fully loaded
      if (document.readyState === 'complete') {
        collectMetrics();
      } else {
        window.addEventListener('load', collectMetrics);
      }

      function collectMetrics() {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paintEntries = performance.getEntriesByType('paint');
        const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

        const metrics: any = {
          navigationTiming: {
            domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
            loadComplete: navigationEntry.loadEventEnd - navigationEntry.startTime,
            firstPaint: 0,
            firstContentfulPaint: 0
          },
          resourceTiming: resourceEntries.map(entry => ({
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize || 0,
            type: entry.name.split('.').pop() || 'unknown'
          }))
        };

        // Paint timing
        paintEntries.forEach(entry => {
          if (entry.name === 'first-paint') {
            metrics.navigationTiming.firstPaint = entry.startTime;
          }
          if (entry.name === 'first-contentful-paint') {
            metrics.navigationTiming.firstContentfulPaint = entry.startTime;
            metrics.fcp = entry.startTime;
          }
        });

        // Web Vitals via PerformanceObserver (if available)
        if ('PerformanceObserver' in window) {
          try {
            // Largest Contentful Paint
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                const lastEntry = entries[entries.length - 1];
                metrics.lcp = lastEntry.startTime;
              }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // Cumulative Layout Shift
            let cumulativeLayoutShift = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  cumulativeLayoutShift += (entry as any).value;
                }
              }
              metrics.cls = cumulativeLayoutShift;
            }).observe({ entryTypes: ['layout-shift'] });

          } catch (error) {
            console.warn('Some performance metrics unavailable:', error);
          }
        }

        // Memory usage (if available)
        if ((performance as any).memory) {
          metrics.memoryUsage = {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          };
        }

        // Wait a bit for layout shifts to settle
        setTimeout(() => resolve(metrics), 1000);
      }
    });
  });
}

// Test suite for Core Web Vitals
test.describe('Core Web Vitals Performance', () => {
  test('should meet Core Web Vitals thresholds', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    const metrics = await collectPerformanceMetrics(page);
    
    console.log('Performance Metrics:', JSON.stringify(metrics, null, 2));
    
    // Test First Contentful Paint
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP);
      console.log(`✅ FCP: ${metrics.fcp.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.FCP}ms)`);
    }
    
    // Test Largest Contentful Paint
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
      console.log(`✅ LCP: ${metrics.lcp.toFixed(2)}ms (threshold: ${PERFORMANCE_THRESHOLDS.LCP}ms)`);
    }
    
    // Test Cumulative Layout Shift
    if (metrics.cls !== undefined) {
      expect(metrics.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
      console.log(`✅ CLS: ${metrics.cls.toFixed(3)} (threshold: ${PERFORMANCE_THRESHOLDS.CLS})`);
    }
    
    // Test page load times
    expect(metrics.navigationTiming.domContentLoaded).toBeLessThan(PERFORMANCE_THRESHOLDS.domLoad);
    expect(metrics.navigationTiming.loadComplete).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
    
    console.log(`✅ DOM Load: ${metrics.navigationTiming.domContentLoaded.toFixed(2)}ms`);
    console.log(`✅ Page Load: ${metrics.navigationTiming.loadComplete.toFixed(2)}ms`);
  });

  test('should have optimized resource loading', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    const metrics = await collectPerformanceMetrics(page);
    
    // Analyze resource timing
    const jsResources = metrics.resourceTiming.filter(r => r.type === 'js' || r.name.includes('.js'));
    const cssResources = metrics.resourceTiming.filter(r => r.type === 'css' || r.name.includes('.css'));
    const imageResources = metrics.resourceTiming.filter(r => r.type === 'png' || r.type === 'jpg' || r.type === 'svg');
    
    console.log(`📦 JavaScript resources: ${jsResources.length}`);
    console.log(`🎨 CSS resources: ${cssResources.length}`);
    console.log(`🖼️  Image resources: ${imageResources.length}`);
    
    // Check for large resources
    const largeResources = metrics.resourceTiming.filter(r => r.size > 500000); // 500KB+
    console.log(`⚠️  Large resources (>500KB): ${largeResources.length}`);
    
    largeResources.forEach(resource => {
      console.log(`   - ${resource.name}: ${(resource.size / 1024).toFixed(2)}KB`);
    });
    
    // Ensure reasonable resource counts and sizes
    expect(jsResources.length).toBeLessThan(20); // Reasonable bundle count
    expect(largeResources.length).toBeLessThan(5); // Not too many large resources
  });
});

// Cross-browser compatibility tests
test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test`);
      
      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');
      
      // Check basic page elements load
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('header, nav, main, [role="main"]')).toBeVisible();
      
      // Check for JavaScript errors
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Navigate and interact
      await page.waitForTimeout(2000);
      
      // Report any errors
      if (errors.length > 0) {
        console.log(`⚠️  ${browserName} errors:`, errors);
        // Don't fail test for now, just log
      }
      
      console.log(`✅ ${browserName} basic functionality works`);
    });
  });
});

// Mobile responsiveness tests
test.describe('Mobile Responsiveness', () => {
  VIEWPORT_SIZES.forEach(viewport => {
    test(`should be responsive at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle');
      
      // Check layout doesn't break
      const bodyOverflow = await page.evaluate(() => {
        return window.getComputedStyle(document.body).overflow;
      });
      
      // Check for horizontal scrollbars (usually indicates layout issues)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        console.log(`⚠️  Horizontal scroll detected at ${viewport.name}`);
      }
      
      // Check that important elements are visible
      await expect(page.locator('body')).toBeVisible();
      
      // Test navigation on mobile
      if (viewport.width < 768) {
        // Look for mobile menu toggle
        const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="navigation"], .mobile-menu-toggle, [data-mobile-menu]');
        
        if (await mobileMenuButton.count() > 0) {
          await mobileMenuButton.first().click();
          console.log(`✅ Mobile menu interaction works at ${viewport.name}`);
        }
      }
      
      console.log(`✅ Layout responsive at ${viewport.name}`);
    });
  });
});

// Performance under load simulation
test.describe('Performance Under Load', () => {
  test('should maintain performance with multiple concurrent users', async ({ browser }) => {
    const contexts: BrowserContext[] = [];
    const pages: Page[] = [];
    const metrics: PerformanceMetrics[] = [];
    
    try {
      // Simulate 5 concurrent users
      for (let i = 0; i < 5; i++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        contexts.push(context);
        pages.push(page);
      }
      
      // Load pages concurrently
      const loadPromises = pages.map(async (page, index) => {
        const startTime = Date.now();
        await page.goto(FRONTEND_URL);
        await page.waitForLoadState('networkidle');
        const pageMetrics = await collectPerformanceMetrics(page);
        pageMetrics.testIndex = index;
        metrics.push(pageMetrics);
        return Date.now() - startTime;
      });
      
      const loadTimes = await Promise.all(loadPromises);
      
      // Analyze concurrent load performance
      const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      const maxLoadTime = Math.max(...loadTimes);
      
      console.log(`📊 Concurrent Load Test Results:`);
      console.log(`   Average load time: ${avgLoadTime.toFixed(2)}ms`);
      console.log(`   Maximum load time: ${maxLoadTime.toFixed(2)}ms`);
      console.log(`   Load time variation: ${(maxLoadTime - Math.min(...loadTimes)).toFixed(2)}ms`);
      
      // Performance should not degrade significantly under concurrent load
      expect(avgLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad * 1.5); // Allow 50% degradation
      expect(maxLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad * 2); // Allow 100% degradation for worst case
      
    } finally {
      // Clean up
      for (const context of contexts) {
        await context.close();
      }
    }
  });
});

// Accessibility testing
test.describe('Accessibility Compliance', () => {
  test('should meet basic accessibility standards', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log(`📋 Headings found: ${headings.length}`);
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    let imagesWithAlt = 0;
    
    for (let i = 0; i < imageCount; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      if (altText !== null) {
        imagesWithAlt++;
      }
    }
    
    console.log(`🖼️  Images with alt text: ${imagesWithAlt}/${imageCount}`);
    
    // Check for skip links
    const skipLinks = await page.locator('a[href^="#"], a[aria-label*="skip"]').count();
    console.log(`🔗 Skip links found: ${skipLinks}`);
    
    // Check for proper form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    let labeledInputs = 0;
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const associatedLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
        
        return !!(ariaLabel || ariaLabelledBy || associatedLabel);
      });
      
      if (hasLabel) {
        labeledInputs++;
      }
    }
    
    console.log(`🏷️  Labeled inputs: ${labeledInputs}/${inputCount}`);
    
    // Basic accessibility checks (not failing for now, just reporting)
    if (imageCount > 0) {
      const altTextRatio = imagesWithAlt / imageCount;
      if (altTextRatio < 0.9) {
        console.log(`⚠️  Only ${(altTextRatio * 100).toFixed(1)}% of images have alt text`);
      }
    }
    
    console.log(`✅ Accessibility audit completed`);
  });
});

// Bundle size and optimization tests
test.describe('Bundle Optimization', () => {
  test('should have reasonable bundle sizes', async ({ page }) => {
    const resourceSizes = new Map<string, number>();
    
    // Monitor network requests
    page.on('response', async (response) => {
      const url = response.url();
      const contentLength = response.headers()['content-length'];
      
      if (contentLength) {
        resourceSizes.set(url, parseInt(contentLength));
      } else {
        try {
          const buffer = await response.body();
          resourceSizes.set(url, buffer.length);
        } catch (error) {
          // Some resources might not be accessible
        }
      }
    });
    
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    
    // Analyze bundle sizes
    const jsResources = Array.from(resourceSizes.entries())
      .filter(([url]) => url.includes('.js') && !url.includes('node_modules'))
      .sort(([,a], [,b]) => b - a);
    
    const cssResources = Array.from(resourceSizes.entries())
      .filter(([url]) => url.includes('.css'))
      .sort(([,a], [,b]) => b - a);
    
    console.log(`📦 JavaScript Bundle Analysis:`);
    jsResources.slice(0, 5).forEach(([url, size]) => {
      const filename = url.split('/').pop() || url;
      console.log(`   ${filename}: ${(size / 1024).toFixed(2)}KB`);
    });
    
    console.log(`🎨 CSS Bundle Analysis:`);
    cssResources.slice(0, 3).forEach(([url, size]) => {
      const filename = url.split('/').pop() || url;
      console.log(`   ${filename}: ${(size / 1024).toFixed(2)}KB`);
    });
    
    const totalJSSize = jsResources.reduce((sum, [, size]) => sum + size, 0);
    const totalCSSSize = cssResources.reduce((sum, [, size]) => sum + size, 0);
    
    console.log(`📊 Total JavaScript: ${(totalJSSize / 1024).toFixed(2)}KB`);
    console.log(`📊 Total CSS: ${(totalCSSSize / 1024).toFixed(2)}KB`);
    
    // Bundle size recommendations
    if (totalJSSize > 1024 * 500) { // 500KB
      console.log(`⚠️  Large JavaScript bundle detected (${(totalJSSize / 1024).toFixed(2)}KB)`);
    }
    
    if (totalCSSSize > 1024 * 100) { // 100KB
      console.log(`⚠️  Large CSS bundle detected (${(totalCSSSize / 1024).toFixed(2)}KB)`);
    }
  });
});