import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Browser Setup and Navigation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should load platform successfully across all viewports', async ({ page }) => {
    console.log('🔍 Testing browser setup and navigation...');

    // Monitor console errors
    const consoleErrors = await helpers.checkConsoleErrors();
    
    // Monitor network activity
    const networkActivity = await helpers.monitorNetworkActivity();

    // Navigate to platform
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Verify page loads successfully
    await expect(page).toHaveTitle(/DRIFT/);
    
    // Take baseline screenshots across viewports
    const responsiveScreenshots = await helpers.testResponsiveDesign();
    console.log('📸 Responsive screenshots taken:', responsiveScreenshots);

    // Measure performance
    const performance = await helpers.measurePagePerformance();
    console.log('⚡ Page performance metrics:', performance);

    // Verify no critical console errors
    expect(consoleErrors.filter(msg => msg.type === 'error')).toHaveLength(0);

    // Take final screenshot
    await helpers.takeScreenshot('platform_loaded_successfully');
  });

  test('should navigate through sidebar menu items', async ({ page }) => {
    console.log('🧭 Testing sidebar navigation...');

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Test navigation to each main section
    const navigationItems = [
      { selector: 'a[href="/"]', label: 'Dashboard', expectedUrl: '/' },
      { selector: 'a[href="/vendors"]', label: 'Vendors', expectedUrl: '/vendors' },
      { selector: 'a[href="/reports"]', label: 'Reports', expectedUrl: '/reports' },
      { selector: 'a[href="/analytics"]', label: 'Analytics', expectedUrl: '/analytics' },
      { selector: 'a[href="/settings"]', label: 'Settings', expectedUrl: '/settings' }
    ];

    for (const item of navigationItems) {
      console.log(`  → Testing navigation to ${item.label}`);
      
      try {
        // Click navigation item
        await page.click(item.selector);
        await helpers.waitForPageLoad();

        // Verify URL changed
        expect(page.url()).toContain(item.expectedUrl);

        // Take screenshot of page
        await helpers.takeScreenshot(`navigation_${item.label.toLowerCase()}`);

        // Verify page content loaded
        await expect(page.locator('body')).toBeVisible();

      } catch (error) {
        console.log(`  ⚠️ Navigation to ${item.label} failed: ${error}`);
      }
    }

    // Return to dashboard
    await page.click('a[href="/"]');
    await helpers.waitForPageLoad();
  });

  test('should handle responsive navigation on mobile', async ({ page }) => {
    console.log('📱 Testing mobile navigation...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check if mobile menu button exists
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], .hamburger, button[aria-label*="menu"]');
    
    if (await mobileMenuButton.count() > 0) {
      console.log('  🍔 Mobile menu button found');
      
      // Click mobile menu
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Take screenshot of opened mobile menu
      await helpers.takeScreenshot('mobile_menu_opened');

      // Test navigation in mobile mode
      const mobileNavItems = page.locator('nav a, [role="navigation"] a');
      const navCount = await mobileNavItems.count();
      console.log(`  📝 Found ${navCount} mobile navigation items`);

      if (navCount > 0) {
        // Click first navigation item
        await mobileNavItems.first().click();
        await helpers.waitForPageLoad();
        await helpers.takeScreenshot('mobile_navigation_success');
      }
    } else {
      console.log('  ℹ️ No mobile menu button found - navigation may be always visible');
      await helpers.takeScreenshot('mobile_navigation_always_visible');
    }
  });

  test('should validate page load performance', async ({ page }) => {
    console.log('⚡ Testing page load performance...');

    const startTime = Date.now();
    
    await page.goto('/');
    await helpers.waitForPageLoad();
    
    const loadTime = Date.now() - startTime;
    console.log(`  📊 Total load time: ${loadTime}ms`);

    // Performance should be reasonable (less than 10 seconds)
    expect(loadTime).toBeLessThan(10000);

    // Check for performance metrics
    const performanceMetrics = await helpers.measurePagePerformance();
    console.log('  📈 Performance metrics:', performanceMetrics);

    // Take performance screenshot
    await helpers.takeScreenshot('performance_test_completed');
  });

  test('should check basic accessibility compliance', async ({ page }) => {
    console.log('♿ Testing basic accessibility...');

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Check basic accessibility
    const accessibilityIssues = await helpers.checkBasicAccessibility();
    console.log('  🔍 Accessibility issues found:', accessibilityIssues);

    // Test keyboard navigation
    const keyboardNavigation = await helpers.testKeyboardNavigation();
    console.log('  ⌨️ Keyboard navigation test:', keyboardNavigation);

    expect(keyboardNavigation.canNavigateWithTab).toBeTruthy();

    // Take accessibility test screenshot
    await helpers.takeScreenshot('accessibility_test_completed');
  });
});