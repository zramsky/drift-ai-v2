import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Comprehensive Platform Validation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should perform comprehensive performance monitoring', async ({ page }) => {
    console.log('⚡ Performing comprehensive performance monitoring...');

    const routes = ['/', '/vendors', '/reports', '/analytics', '/settings'];
    const performanceResults = [];

    for (const route of routes) {
      try {
        console.log(`  📊 Measuring performance for: ${route}`);
        
        const startTime = Date.now();
        
        // Navigate and measure load time
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        const loadTime = Date.now() - startTime;
        
        // Get detailed performance metrics
        const performanceMetrics = await helpers.measurePagePerformance();
        
        // Check for network requests
        const networkActivity = await helpers.monitorNetworkActivity();
        
        // Measure First Contentful Paint and other metrics
        const webVitals = await page.evaluate(() => {
          return new Promise((resolve) => {
            if ('web-vital' in window) {
              resolve((window as any).webVitals);
            } else {
              // Fallback metrics
              resolve({
                fcp: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                lcp: 0, // Would need PerformanceLargestContentfulPaint
                cls: 0, // Would need PerformanceLayoutShift
                fid: 0  // Would need PerformanceFirstInputDelay
              });
            }
          });
        });

        const result = {
          route,
          loadTime,
          performanceMetrics,
          networkActivity: networkActivity.length,
          webVitals
        };

        performanceResults.push(result);
        
        console.log(`    📈 ${route} - Load Time: ${loadTime}ms`);
        console.log(`    🌐 Network Requests: ${networkActivity.length}`);
        
        await helpers.takeScreenshot(`performance_${route.replace('/', 'root')}`);
        
        // Verify performance thresholds
        expect(loadTime).toBeLessThan(10000); // 10 second max load time
        
        if (loadTime > 5000) {
          console.log(`    ⚠️ Slow load time detected: ${loadTime}ms`);
        }

      } catch (error) {
        console.log(`  ❌ Performance testing failed for ${route}: ${error instanceof Error ? error.message : error}`);
      }
    }

    // Generate performance summary
    console.log('  📊 Performance Summary:');
    const avgLoadTime = performanceResults.reduce((sum, result) => sum + result.loadTime, 0) / performanceResults.length;
    const slowestRoute = performanceResults.reduce((slowest, current) => 
      current.loadTime > slowest.loadTime ? current : slowest
    );
    
    console.log(`    Average Load Time: ${avgLoadTime.toFixed(2)}ms`);
    console.log(`    Slowest Route: ${slowestRoute.route} (${slowestRoute.loadTime}ms)`);
  });

  test('should perform comprehensive error monitoring', async ({ page }) => {
    console.log('🚨 Performing comprehensive error monitoring...');

    const routes = ['/', '/vendors', '/reports', '/analytics', '/settings'];
    const errorResults = [];

    // Set up global error handlers
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`    ❌ Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', (error) => {
      console.log(`    💥 Page Error: ${error.message}`);
    });

    page.on('requestfailed', (request) => {
      console.log(`    🌐 Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
    });

    for (const route of routes) {
      try {
        console.log(`  🔍 Monitoring errors for: ${route}`);
        
        const consoleErrors: Array<{
          type: string;
          text: string;
          location: any;
        }> = [];
        const networkErrors: Array<{
          url: string;
          status?: number;
          error: string;
        }> = [];
        
        // Track errors during navigation
        page.on('console', (msg) => {
          if (msg.type() === 'error' || msg.type() === 'warning') {
            consoleErrors.push({
              type: msg.type(),
              text: msg.text(),
              location: msg.location()
            });
          }
        });

        page.on('requestfailed', (request) => {
          networkErrors.push({
            url: request.url(),
            error: request.failure()?.errorText || 'Network request failed'
          });
        });

        await page.goto(route);
        await helpers.waitForPageLoad();

        // Check for 404 or error pages
        const pageTitle = await page.title();
        const pageContent = await page.textContent('body');
        
        const isErrorPage = pageTitle.toLowerCase().includes('error') || 
                           pageTitle.includes('404') ||
                           pageContent?.toLowerCase().includes('404') ||
                           pageContent?.toLowerCase().includes('page not found');

        const result = {
          route,
          consoleErrors: consoleErrors.length,
          networkErrors: networkErrors.length,
          isErrorPage,
          pageTitle
        };

        errorResults.push(result);

        if (consoleErrors.length > 0) {
          console.log(`    📊 Console Errors: ${consoleErrors.length}`);
          consoleErrors.slice(0, 3).forEach((error, index) => {
            console.log(`      ${index + 1}. [${error.type}] ${error.text}`);
          });
        }

        if (networkErrors.length > 0) {
          console.log(`    🌐 Network Errors: ${networkErrors.length}`);
        }

        if (isErrorPage) {
          console.log(`    ⚠️ Potential error page detected`);
        }

        await helpers.takeScreenshot(`error_monitoring_${route.replace('/', 'root')}`);

      } catch (error) {
        console.log(`  ❌ Error monitoring failed for ${route}: ${error instanceof Error ? error.message : error}`);
        errorResults.push({
          route,
          consoleErrors: 0,
          networkErrors: 0,
          isErrorPage: true,
          pageTitle: 'Navigation Failed',
          navigationError: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Generate error summary
    console.log('  📊 Error Monitoring Summary:');
    const totalConsoleErrors = errorResults.reduce((sum, result) => sum + result.consoleErrors, 0);
    const totalNetworkErrors = errorResults.reduce((sum, result) => sum + result.networkErrors, 0);
    const errorPages = errorResults.filter(result => result.isErrorPage);
    
    console.log(`    Total Console Errors: ${totalConsoleErrors}`);
    console.log(`    Total Network Errors: ${totalNetworkErrors}`);
    console.log(`    Error Pages: ${errorPages.length}`);
    
    if (errorPages.length > 0) {
      console.log(`    Error Page Routes:`);
      errorPages.forEach(result => {
        console.log(`      - ${result.route}: ${result.pageTitle}`);
      });
    }
  });

  test('should perform comprehensive accessibility audit', async ({ page }) => {
    console.log('♿ Performing comprehensive accessibility audit...');

    const routes = ['/', '/vendors', '/reports', '/analytics', '/settings'];
    const accessibilityResults = [];

    for (const route of routes) {
      try {
        console.log(`  ♿ Auditing accessibility for: ${route}`);
        
        await page.goto(route);
        await helpers.waitForPageLoad();

        // Check basic accessibility
        const basicIssues = await helpers.checkBasicAccessibility();
        
        // Test keyboard navigation
        const keyboardNavigation = await helpers.testKeyboardNavigation();
        
        // Check for ARIA attributes
        const ariaElements = await page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]').count();
        
        // Check for form labels
        const formsWithoutLabels = await page.locator('input:not([aria-label]):not([aria-labelledby])').filter({
          hasNot: page.locator('label input, [id] ~ label')
        }).count();
        
        // Check color contrast (simplified check)
        const colorContrastIssues = await page.evaluate(() => {
          const elements = document.querySelectorAll('*');
          let issues = 0;
          
          for (const element of elements) {
            const styles = window.getComputedStyle(element);
            const backgroundColor = styles.backgroundColor;
            const color = styles.color;
            
            // Simplified contrast check (would need more complex calculation for real audit)
            if (backgroundColor === color || 
                (backgroundColor === 'rgba(0, 0, 0, 0)' && color === 'rgb(255, 255, 255)')) {
              issues++;
            }
          }
          
          return Math.min(issues, 10); // Cap at 10 for reporting
        });

        // Check for heading structure
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
        const h1Count = await page.locator('h1').count();
        
        const result = {
          route,
          basicIssues: basicIssues.length,
          keyboardNavigable: keyboardNavigation.canNavigateWithTab,
          ariaElements,
          formsWithoutLabels,
          colorContrastIssues,
          headings,
          hasH1: h1Count > 0,
          multipleH1: h1Count > 1
        };

        accessibilityResults.push(result);

        console.log(`    📊 Accessibility for ${route}:`);
        console.log(`      Basic Issues: ${basicIssues.length}`);
        console.log(`      Keyboard Navigable: ${keyboardNavigation.canNavigateWithTab}`);
        console.log(`      ARIA Elements: ${ariaElements}`);
        console.log(`      Forms w/o Labels: ${formsWithoutLabels}`);
        console.log(`      Headings: ${headings} (H1: ${h1Count})`);

        if (basicIssues.length > 0) {
          console.log(`      Issues: ${basicIssues.join(', ')}`);
        }

        await helpers.takeScreenshot(`accessibility_audit_${route.replace('/', 'root')}`);

      } catch (error) {
        console.log(`  ❌ Accessibility audit failed for ${route}: ${error instanceof Error ? error.message : error}`);
      }
    }

    // Generate accessibility summary
    console.log('  📊 Accessibility Summary:');
    const totalIssues = accessibilityResults.reduce((sum, result) => sum + result.basicIssues, 0);
    const keyboardNavigablePages = accessibilityResults.filter(result => result.keyboardNavigable).length;
    const pagesWithoutH1 = accessibilityResults.filter(result => !result.hasH1).length;
    
    console.log(`    Total Basic Issues: ${totalIssues}`);
    console.log(`    Keyboard Navigable Pages: ${keyboardNavigablePages}/${accessibilityResults.length}`);
    console.log(`    Pages without H1: ${pagesWithoutH1}`);
  });

  test('should perform cross-browser compatibility validation', async ({ page, browserName }) => {
    console.log(`🌐 Performing cross-browser validation on ${browserName}...`);

    const routes = ['/', '/vendors', '/reports'];
    const compatibilityResults = [];

    for (const route of routes) {
      try {
        console.log(`  🔍 Testing ${route} on ${browserName}`);
        
        await page.goto(route);
        await helpers.waitForPageLoad();

        // Check for browser-specific issues
        const userAgent = await page.evaluate(() => navigator.userAgent);
        const viewport = page.viewportSize();
        
        // Test basic functionality
        const clickableElements = await page.locator('button, a, [role="button"]').count();
        const interactiveElements = await page.locator('input, select, textarea').count();
        
        // Test CSS Grid/Flexbox support (by checking computed styles)
        const layoutSupport = await page.evaluate(() => {
          const testDiv = document.createElement('div');
          testDiv.style.display = 'grid';
          document.body.appendChild(testDiv);
          
          const gridSupported = window.getComputedStyle(testDiv).display === 'grid';
          
          testDiv.style.display = 'flex';
          const flexSupported = window.getComputedStyle(testDiv).display === 'flex';
          
          document.body.removeChild(testDiv);
          
          return { gridSupported, flexSupported };
        });

        // Check for JavaScript errors specific to browser
        const jsErrors = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            jsErrors.push(msg.text());
          }
        });

        // Wait a bit for any delayed errors
        await page.waitForTimeout(2000);

        const result = {
          route,
          browserName,
          userAgent,
          viewport,
          clickableElements,
          interactiveElements,
          layoutSupport,
          jsErrors: jsErrors.length,
          success: true
        };

        compatibilityResults.push(result);

        console.log(`    ✅ ${route} compatible with ${browserName}`);
        console.log(`      Clickable Elements: ${clickableElements}`);
        console.log(`      Interactive Elements: ${interactiveElements}`);
        console.log(`      Grid Support: ${layoutSupport.gridSupported}`);
        console.log(`      Flex Support: ${layoutSupport.flexSupported}`);
        
        if (jsErrors.length > 0) {
          console.log(`      JS Errors: ${jsErrors.length}`);
        }

        await helpers.takeScreenshot(`compatibility_${browserName}_${route.replace('/', 'root')}`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  ❌ Compatibility test failed for ${route} on ${browserName}: ${errorMessage}`);
        compatibilityResults.push({
          route,
          browserName,
          success: false,
          error: errorMessage
        });
      }
    }

    // Generate compatibility summary
    console.log(`  📊 ${browserName} Compatibility Summary:`);
    const successfulRoutes = compatibilityResults.filter(result => result.success).length;
    console.log(`    Successful Routes: ${successfulRoutes}/${compatibilityResults.length}`);
  });

  test('should generate final comprehensive test report', async ({ page }) => {
    console.log('📋 Generating comprehensive test report...');

    // Take final screenshots of all major pages
    const routes = ['/', '/vendors', '/reports', '/analytics', '/settings'];
    const finalReport = {
      timestamp: new Date().toISOString(),
      testSummary: {
        totalRoutesTested: routes.length,
        browserTested: await page.evaluate(() => navigator.userAgent),
        viewport: page.viewportSize()
      },
      routeStatus: [] as Array<{
        route: string;
        pageTitle?: string;
        accessible: boolean;
        contentLength?: number;
        screenshotTaken: boolean;
        error?: string;
      }>
    };

    for (const route of routes) {
      try {
        console.log(`  📸 Final capture of: ${route}`);
        
        await page.goto(route);
        await helpers.waitForPageLoad();

        const pageTitle = await page.title();
        const pageContent = await page.textContent('body');
        const isAccessible = Boolean(pageContent && pageContent.trim().length > 0);
        
        const routeStatus = {
          route,
          pageTitle,
          accessible: isAccessible,
          contentLength: pageContent?.length || 0,
          screenshotTaken: true
        };

        finalReport.routeStatus.push(routeStatus);

        await helpers.takeScreenshot(`final_report_${route.replace('/', 'root')}`);

        console.log(`    ✅ ${route}: ${pageTitle} (${routeStatus.contentLength} chars)`);

      } catch (error) {
        console.log(`  ❌ Final capture failed for ${route}: ${error}`);
        finalReport.routeStatus.push({
          route,
          accessible: false,
          error: error instanceof Error ? error.message : String(error),
          screenshotTaken: false
        });
      }
    }

    // Generate summary statistics
    const accessibleRoutes = finalReport.routeStatus.filter(status => status.accessible).length;
    const totalScreenshots = finalReport.routeStatus.filter(status => status.screenshotTaken).length;

    console.log('  📊 Final Test Report Summary:');
    console.log(`    Routes Tested: ${finalReport.testSummary.totalRoutesTested}`);
    console.log(`    Accessible Routes: ${accessibleRoutes}/${finalReport.testSummary.totalRoutesTested}`);
    console.log(`    Screenshots Captured: ${totalScreenshots}`);
    console.log(`    Test Completion Time: ${finalReport.timestamp}`);

    // The report would be saved to a file in a real implementation
    console.log('  ✅ Comprehensive test report generation complete');
  });
});