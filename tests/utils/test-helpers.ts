import { Page, expect, Locator } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Get the page instance for direct access when needed
   */
  getPage(): Page {
    return this.page;
  }

  /**
   * Wait for page to be fully loaded and interactive
   */
  async waitForPageLoad(timeout: number = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string, fullPage: boolean = true) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    await this.page.screenshot({ 
      path: `tests/screenshots/${filename}`, 
      fullPage 
    });
    return filename;
  }

  /**
   * Check for console errors and warnings
   */
  async checkConsoleErrors() {
    const messages: { type: string; text: string }[] = [];
    
    this.page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        messages.push({
          type: msg.type(),
          text: msg.text()
        });
      }
    });

    return messages;
  }

  /**
   * Monitor network requests and responses
   */
  async monitorNetworkActivity() {
    const networkActivity: Array<{
      url: string;
      status: number;
      method: string;
      duration: number;
    }> = [];

    this.page.on('response', (response) => {
      networkActivity.push({
        url: response.url(),
        status: response.status(),
        method: response.request().method(),
        duration: 0 // Playwright doesn't provide timing directly
      });
    });

    return networkActivity;
  }

  /**
   * Wait for element with retry logic
   */
  async waitForElementWithRetry(
    selector: string,
    timeout: number = 10000,
    retries: number = 3
  ): Promise<Locator> {
    for (let i = 0; i < retries; i++) {
      try {
        const element = this.page.locator(selector);
        await element.waitFor({ timeout });
        return element;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
    throw new Error(`Element ${selector} not found after ${retries} retries`);
  }

  /**
   * Test responsive behavior by changing viewport
   */
  async testResponsiveDesign() {
    const viewports = [
      { width: 1440, height: 900, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    const screenshots = [];
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.waitForPageLoad();
      const filename = await this.takeScreenshot(`responsive_${viewport.name}`);
      screenshots.push({ viewport: viewport.name, screenshot: filename });
    }
    return screenshots;
  }

  /**
   * Simulate file upload
   */
  async uploadFile(selector: string, filePath: string) {
    const fileInput = await this.waitForElementWithRetry(selector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Test form validation
   */
  async testFormValidation(
    formSelector: string,
    fieldTests: Array<{
      selector: string;
      validValue: string;
      invalidValue: string;
      expectedErrorSelector?: string;
    }>
  ) {
    const results = [];
    
    for (const test of fieldTests) {
      // Test invalid value
      await this.page.fill(test.selector, test.invalidValue);
      await this.page.click(`${formSelector} button[type="submit"]`);
      
      if (test.expectedErrorSelector) {
        const errorVisible = await this.page
          .locator(test.expectedErrorSelector)
          .isVisible();
        results.push({
          field: test.selector,
          invalidValueTest: errorVisible,
          error: errorVisible ? null : 'Error message not shown for invalid value'
        });
      }

      // Test valid value
      await this.page.fill(test.selector, test.validValue);
      results.push({
        field: test.selector,
        validValueTest: true
      });
    }
    
    return results;
  }

  /**
   * Check accessibility basics
   */
  async checkBasicAccessibility() {
    const issues = [];
    
    // Check for alt text on images
    const imagesWithoutAlt = await this.page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images missing alt text`);
    }

    // Check for form labels
    const inputsWithoutLabels = await this.page
      .locator('input:not([aria-label]):not([aria-labelledby])')
      .filter({ hasNot: this.page.locator('label') })
      .count();
    
    if (inputsWithoutLabels > 0) {
      issues.push(`${inputsWithoutLabels} inputs missing proper labels`);
    }

    return issues;
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    // Test Tab navigation
    await this.page.keyboard.press('Tab');
    const activeElement = await this.page.evaluate(() => 
      document.activeElement?.tagName
    );
    
    return {
      canNavigateWithTab: !!activeElement,
      firstFocusableElement: activeElement
    };
  }

  /**
   * Measure page performance
   */
  async measurePagePerformance() {
    const navigationTiming = await this.page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadComplete: timing.loadEventEnd - timing.loadEventStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        firstPaint: 0, // Would need PerformancePaintTiming API
        totalLoadTime: timing.loadEventEnd - timing.fetchStart
      };
    });

    return navigationTiming;
  }
}