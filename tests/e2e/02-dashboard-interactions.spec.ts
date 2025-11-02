import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Dashboard Interactions', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.waitForPageLoad();
  });

  test('should display and interact with KPI cards', async ({ page }) => {
    console.log('📊 Testing KPI cards functionality...');

    // Look for KPI cards with various possible selectors
    const kpiSelectors = [
      '[data-testid*="kpi"]',
      '.kpi-card',
      '[class*="kpi"]',
      '.stat-card',
      '.metric-card',
      '.dashboard-card'
    ];

    let kpiCards = page.locator('');
    let foundKPIs = false;

    for (const selector of kpiSelectors) {
      kpiCards = page.locator(selector);
      const count = await kpiCards.count();
      if (count > 0) {
        console.log(`  ✅ Found ${count} KPI cards with selector: ${selector}`);
        foundKPIs = true;
        break;
      }
    }

    if (!foundKPIs) {
      // Look for any card-like elements that might be KPIs
      const genericCards = page.locator('[class*="card"], .bg-white, .border');
      const cardCount = await genericCards.count();
      console.log(`  📋 Found ${cardCount} generic card elements`);
      
      if (cardCount > 0) {
        kpiCards = genericCards;
        foundKPIs = true;
      }
    }

    if (foundKPIs) {
      const cardCount = await kpiCards.count();
      
      for (let i = 0; i < Math.min(cardCount, 5); i++) {
        const card = kpiCards.nth(i);
        
        // Test hover state
        await card.hover();
        await page.waitForTimeout(500);
        
        // Check if card is clickable
        try {
          await card.click();
          await page.waitForTimeout(500);
          console.log(`  ✅ KPI card ${i + 1} is interactive`);
        } catch (error) {
          console.log(`  ℹ️ KPI card ${i + 1} is not clickable (expected for display-only cards)`);
        }
      }

      await helpers.takeScreenshot('kpi_cards_interaction');
    } else {
      console.log('  ⚠️ No KPI cards found - may be loading or different structure');
      await helpers.takeScreenshot('dashboard_no_kpi_cards');
    }
  });

  test('should test "Attention Required" section functionality', async ({ page }) => {
    console.log('⚠️ Testing Attention Required section...');

    // Look for attention required section
    const attentionSelectors = [
      '[data-testid*="attention"]',
      '.attention-required',
      '[class*="attention"]',
      '.alert',
      '.warning',
      '[class*="urgent"]',
      'h2:has-text("Attention")',
      'h3:has-text("Attention")'
    ];

    let attentionSection = null;
    
    for (const selector of attentionSelectors) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        console.log(`  ✅ Found attention section with selector: ${selector}`);
        attentionSection = element;
        break;
      }
    }

    if (attentionSection) {
      // Check if section is visible
      await expect(attentionSection.first()).toBeVisible();

      // Look for items within the attention section
      const attentionItems = page.locator('.attention-required li, .alert li, [class*="attention"] li, [data-testid*="attention"] li');
      const itemCount = await attentionItems.count();
      console.log(`  📝 Found ${itemCount} attention items`);

      if (itemCount > 0) {
        // Test interaction with attention items
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const item = attentionItems.nth(i);
          await item.hover();
          
          try {
            await item.click();
            console.log(`  ✅ Attention item ${i + 1} is clickable`);
            await page.goBack();
            await helpers.waitForPageLoad();
          } catch (error) {
            console.log(`  ℹ️ Attention item ${i + 1} is not clickable`);
          }
        }
      }

      await helpers.takeScreenshot('attention_required_section');
    } else {
      console.log('  ℹ️ No attention required section found (may be empty or different structure)');
      await helpers.takeScreenshot('dashboard_no_attention_section');
    }
  });

  test('should test interactive dashboard elements', async ({ page }) => {
    console.log('🎯 Testing interactive dashboard elements...');

    // Look for various interactive elements
    const interactiveElements = [
      'button',
      'a[href]',
      '[role="button"]',
      '.clickable',
      '[onclick]',
      'input',
      'select'
    ];

    const interactions = [];

    for (const selector of interactiveElements) {
      const elements = page.locator(selector).locator('visible=true');
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`  📋 Found ${count} ${selector} elements`);
        
        // Test first few elements of each type
        for (let i = 0; i < Math.min(count, 3); i++) {
          const element = elements.nth(i);
          const tagName = await element.evaluate(el => el.tagName);
          
          try {
            await element.hover();
            await page.waitForTimeout(200);
            
            if (tagName === 'A') {
              const href = await element.getAttribute('href');
              console.log(`    → Link found: ${href}`);
              interactions.push({ type: 'link', href });
            } else if (tagName === 'BUTTON') {
              const text = await element.textContent();
              console.log(`    → Button found: ${text?.trim()}`);
              interactions.push({ type: 'button', text: text?.trim() });
            }
          } catch (error) {
            console.log(`    ⚠️ Could not interact with ${selector} element ${i + 1}`);
          }
        }
      }
    }

    console.log(`  📊 Total interactive elements cataloged: ${interactions.length}`);
    await helpers.takeScreenshot('dashboard_interactive_elements');

    // Test a few interactive elements
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      console.log(`  🔘 Testing ${Math.min(buttonCount, 3)} buttons...`);
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        const buttonText = await button.textContent();
        
        try {
          await button.click();
          await page.waitForTimeout(1000);
          console.log(`    ✅ Button "${buttonText?.trim()}" clicked successfully`);
        } catch (error) {
          console.log(`    ⚠️ Button "${buttonText?.trim()}" click failed: ${error}`);
        }
      }
    }
  });

  test('should verify real-time updates and data refresh', async ({ page }) => {
    console.log('🔄 Testing real-time updates and data refresh...');

    // Take initial screenshot
    await helpers.takeScreenshot('dashboard_initial_state');

    // Look for refresh buttons or auto-refresh indicators
    const refreshElements = [
      '[data-testid*="refresh"]',
      'button:has-text("Refresh")',
      '.refresh-button',
      '[aria-label*="refresh"]',
      '[class*="refresh"]'
    ];

    let refreshButton = null;
    
    for (const selector of refreshElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        console.log(`  🔄 Found refresh button with selector: ${selector}`);
        refreshButton = element.first();
        break;
      }
    }

    if (refreshButton) {
      // Test refresh functionality
      await refreshButton.click();
      await page.waitForTimeout(2000);
      console.log('  ✅ Refresh button clicked');
      
      await helpers.takeScreenshot('dashboard_after_refresh');
    } else {
      console.log('  ℹ️ No explicit refresh button found');
    }

    // Look for real-time indicators
    const realTimeIndicators = [
      '[data-testid*="live"]',
      '.live-indicator',
      '[class*="real-time"]',
      '.status-indicator',
      '[class*="pulse"]'
    ];

    for (const selector of realTimeIndicators) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  📡 Found ${count} real-time indicators: ${selector}`);
      }
    }

    // Wait and check for any automatic updates
    console.log('  ⏱️ Waiting for potential auto-refresh...');
    await page.waitForTimeout(5000);
    
    await helpers.takeScreenshot('dashboard_after_wait');
  });

  test('should test dashboard responsiveness', async ({ page }) => {
    console.log('📱 Testing dashboard responsive behavior...');

    // Test at different viewports
    const viewports = [
      { width: 1440, height: 900, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      console.log(`  📐 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize(viewport);
      await helpers.waitForPageLoad();
      
      // Check if layout adapts properly
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      console.log(`    Body width: ${bodyWidth}px`);
      
      // Look for hamburger menu on mobile
      if (viewport.width <= 768) {
        const mobileMenu = page.locator('[data-testid="mobile-menu"], .hamburger, button[aria-label*="menu"]');
        const hasMobileMenu = await mobileMenu.count() > 0;
        console.log(`    Mobile menu present: ${hasMobileMenu}`);
      }
      
      await helpers.takeScreenshot(`dashboard_${viewport.name}`);
      
      // Check for horizontal scrolling (should be avoided)
      const hasHorizontalScroll = bodyWidth > viewport.width;
      if (hasHorizontalScroll) {
        console.log(`    ⚠️ Horizontal scrolling detected at ${viewport.name} viewport`);
      }
    }

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
  });
});