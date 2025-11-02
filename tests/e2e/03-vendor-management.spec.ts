import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Vendor Management Workflows', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should navigate to vendors page and display vendor listings', async ({ page }) => {
    console.log('🏢 Testing vendor page navigation and listings...');

    await page.goto('/vendors');
    await helpers.waitForPageLoad();

    // Verify we're on the vendors page
    expect(page.url()).toContain('/vendors');
    await helpers.takeScreenshot('vendors_page_loaded');

    // Look for vendor listings with various possible structures
    const vendorSelectors = [
      '[data-testid*="vendor"]',
      '.vendor-card',
      '.vendor-item',
      '[class*="vendor"]',
      'table tbody tr',
      '.list-item',
      '.card'
    ];

    let vendorElements = null;
    let vendorCount = 0;

    for (const selector of vendorSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  ✅ Found ${count} vendor elements with selector: ${selector}`);
        vendorElements = elements;
        vendorCount = count;
        break;
      }
    }

    if (vendorElements) {
      console.log(`  📋 Testing interaction with ${Math.min(vendorCount, 3)} vendors...`);
      
      for (let i = 0; i < Math.min(vendorCount, 3); i++) {
        const vendor = vendorElements.nth(i);
        
        // Hover over vendor
        await vendor.hover();
        await page.waitForTimeout(500);
        
        // Try to click vendor (might navigate to detail page)
        try {
          await vendor.click();
          await page.waitForTimeout(1000);
          console.log(`  ✅ Vendor ${i + 1} clicked successfully`);
          
          // Take screenshot of vendor detail if navigated
          if (!page.url().endsWith('/vendors')) {
            await helpers.takeScreenshot(`vendor_detail_${i + 1}`);
            await page.goBack();
            await helpers.waitForPageLoad();
          }
        } catch (error) {
          console.log(`  ℹ️ Vendor ${i + 1} click did not navigate: ${error}`);
        }
      }
    } else {
      console.log('  ℹ️ No vendor elements found - may be empty state or different structure');
    }

    await helpers.takeScreenshot('vendors_page_complete');
  });

  test('should test vendor search functionality', async ({ page }) => {
    console.log('🔍 Testing vendor search functionality...');

    await page.goto('/vendors');
    await helpers.waitForPageLoad();

    // Look for search input
    const searchSelectors = [
      '[data-testid*="search"]',
      'input[placeholder*="search" i]',
      'input[type="search"]',
      '.search-input',
      'input[placeholder*="vendor" i]',
      'input[aria-label*="search" i]'
    ];

    let searchInput = null;

    for (const selector of searchSelectors) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        console.log(`  ✅ Found search input with selector: ${selector}`);
        searchInput = element.first();
        break;
      }
    }

    if (searchInput) {
      // Test search functionality
      const searchTerms = ['acme', 'test', 'vendor', 'company'];
      
      for (const term of searchTerms) {
        console.log(`  🔍 Searching for: "${term}"`);
        
        await searchInput.clear();
        await searchInput.fill(term);
        await page.waitForTimeout(1000); // Allow for debounced search
        
        // Press Enter to trigger search if needed
        await searchInput.press('Enter');
        await page.waitForTimeout(2000);
        
        await helpers.takeScreenshot(`search_results_${term}`);
        
        // Check if results changed
        const resultsText = await page.textContent('body');
        console.log(`    Results contain "${term}": ${resultsText?.toLowerCase().includes(term.toLowerCase())}`);
      }

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
      await helpers.takeScreenshot('search_cleared');

    } else {
      console.log('  ℹ️ No search input found');
    }
  });

  test('should test vendor filtering and status options', async ({ page }) => {
    console.log('🔧 Testing vendor filtering functionality...');

    await page.goto('/vendors');
    await helpers.waitForPageLoad();

    // Look for filter controls
    const filterSelectors = [
      '[data-testid*="filter"]',
      'select',
      '.filter-dropdown',
      'button:has-text("Filter")',
      '[role="combobox"]',
      '.select-trigger'
    ];

    const filters = [];

    for (const selector of filterSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  🔧 Found ${count} filter elements: ${selector}`);
        filters.push({ selector, count });
      }
    }

    if (filters.length > 0) {
      // Test each filter type
      for (const filter of filters.slice(0, 3)) { // Test max 3 filters
        const filterElement = page.locator(filter.selector).first();
        
        try {
          // Click to open filter
          await filterElement.click();
          await page.waitForTimeout(500);
          
          // Look for filter options
          const filterOptions = page.locator('[role="option"], option, .dropdown-item, [data-value]');
          const optionCount = await filterOptions.count();
          
          if (optionCount > 0) {
            console.log(`    📝 Found ${optionCount} filter options`);
            
            // Test first few options
            for (let i = 0; i < Math.min(optionCount, 3); i++) {
              const option = filterOptions.nth(i);
              const optionText = await option.textContent();
              
              try {
                await option.click();
                await page.waitForTimeout(1000);
                console.log(`    ✅ Applied filter: ${optionText?.trim()}`);
                
                await helpers.takeScreenshot(`filter_applied_${optionText?.trim().replace(/\s+/g, '_')}`);
                
                // Reset filter for next test
                await filterElement.click();
                await page.waitForTimeout(500);
              } catch (error) {
                console.log(`    ⚠️ Could not apply filter option: ${optionText?.trim()}`);
              }
            }
          }
        } catch (error) {
          console.log(`  ⚠️ Could not interact with filter: ${error}`);
        }
      }
    } else {
      console.log('  ℹ️ No filter controls found');
    }

    await helpers.takeScreenshot('vendor_filtering_complete');
  });

  test('should test vendor creation workflow', async ({ page }) => {
    console.log('➕ Testing vendor creation workflow...');

    await page.goto('/vendors');
    await helpers.waitForPageLoad();

    // Look for "Add Vendor" or "Create Vendor" button
    const createButtons = [
      'button:has-text("Add Vendor")',
      'button:has-text("Create Vendor")',
      'button:has-text("New Vendor")',
      '[data-testid*="add-vendor"]',
      '[data-testid*="create-vendor"]',
      'a:has-text("Add")',
      '.add-button',
      'button[aria-label*="add" i]'
    ];

    let createButton = null;

    for (const selector of createButtons) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        console.log(`  ✅ Found create vendor button: ${selector}`);
        createButton = element.first();
        break;
      }
    }

    if (createButton) {
      try {
        await createButton.click();
        await page.waitForTimeout(2000);
        
        await helpers.takeScreenshot('vendor_creation_modal_opened');

        // Look for form fields
        const formFields = [
          'input[name*="name"], input[placeholder*="name" i]',
          'input[name*="email"], input[type="email"]',
          'input[name*="phone"], input[type="tel"]',
          'input[name*="address"], textarea[name*="address"]',
          'select[name*="status"], select[name*="category"]'
        ];

        const foundFields = [];

        for (const fieldSelector of formFields) {
          const field = page.locator(fieldSelector);
          const count = await field.count();
          if (count > 0) {
            foundFields.push({ selector: fieldSelector, element: field.first() });
            console.log(`    📝 Found form field: ${fieldSelector}`);
          }
        }

        if (foundFields.length > 0) {
          console.log(`  📋 Testing ${foundFields.length} form fields...`);
          
          // Fill out form fields with test data
          for (const field of foundFields) {
            try {
              const fieldType = await field.element.evaluate(el => el.tagName);
              
              if (fieldType === 'INPUT') {
                const inputType = await field.element.getAttribute('type') || 'text';
                
                switch (inputType) {
                  case 'email':
                    await field.element.fill('test@example.com');
                    break;
                  case 'tel':
                    await field.element.fill('555-123-4567');
                    break;
                  default:
                    await field.element.fill('Test Vendor Name');
                }
              } else if (fieldType === 'SELECT') {
                const options = page.locator(`${field.selector} option`);
                const optionCount = await options.count();
                if (optionCount > 1) {
                  await field.element.selectOption({ index: 1 });
                }
              } else if (fieldType === 'TEXTAREA') {
                await field.element.fill('123 Test Street, Test City, TC 12345');
              }
              
              console.log(`    ✅ Filled field: ${field.selector}`);
            } catch (error) {
              console.log(`    ⚠️ Could not fill field ${field.selector}: ${error}`);
            }
          }

          await helpers.takeScreenshot('vendor_form_filled');

          // Look for submit button
          const submitButtons = [
            'button[type="submit"]',
            'button:has-text("Save")',
            'button:has-text("Create")',
            'button:has-text("Submit")',
            '.submit-button'
          ];

          let submitButton = null;

          for (const selector of submitButtons) {
            const element = page.locator(selector);
            const count = await element.count();
            if (count > 0) {
              submitButton = element.first();
              break;
            }
          }

          if (submitButton) {
            console.log('  🚀 Attempting to submit vendor form...');
            try {
              await submitButton.click();
              await page.waitForTimeout(3000);
              
              await helpers.takeScreenshot('vendor_creation_attempted');
              
              // Check for success message or redirect
              const currentUrl = page.url();
              console.log(`    📍 Current URL after submit: ${currentUrl}`);
              
            } catch (error) {
              console.log(`    ⚠️ Form submission failed: ${error}`);
            }
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not open vendor creation form: ${error}`);
      }
    } else {
      console.log('  ℹ️ No vendor creation button found (may be restricted or different location)');
    }

    await helpers.takeScreenshot('vendor_creation_workflow_complete');
  });

  test('should test vendor detail page navigation', async ({ page }) => {
    console.log('👁️ Testing vendor detail page navigation...');

    await page.goto('/vendors');
    await helpers.waitForPageLoad();

    // Find clickable vendor elements
    const vendorLinks = [
      'a[href*="/vendors/"]',
      '[data-testid*="vendor"] a',
      '.vendor-card a',
      '.vendor-item a'
    ];

    let vendorLink = null;

    for (const selector of vendorLinks) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  ✅ Found ${count} vendor links: ${selector}`);
        vendorLink = elements.first();
        break;
      }
    }

    if (vendorLink) {
      const href = await vendorLink.getAttribute('href');
      console.log(`  🔗 Navigating to vendor detail: ${href}`);
      
      await vendorLink.click();
      await helpers.waitForPageLoad();
      
      // Verify we're on vendor detail page
      expect(page.url()).toMatch(/\/vendors\/\w+/);
      
      await helpers.takeScreenshot('vendor_detail_page');

      // Look for vendor detail content
      const detailElements = [
        'h1, h2, h3',
        '.vendor-info',
        '.contact-info',
        '.vendor-details',
        'table',
        '.info-section'
      ];

      for (const selector of detailElements) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`    📋 Found ${count} detail elements: ${selector}`);
        }
      }

      // Test back navigation
      await page.goBack();
      await helpers.waitForPageLoad();
      expect(page.url()).toContain('/vendors');
      console.log('  ⬅️ Successfully navigated back to vendors list');

    } else {
      // Try to construct a vendor detail URL manually
      console.log('  🔧 Attempting direct navigation to vendor detail...');
      await page.goto('/vendors/1');
      
      const response = await page.waitForResponse(response => 
        response.url().includes('/vendors/1') && response.status() !== 404
      ).catch(() => null);

      if (response) {
        await helpers.takeScreenshot('vendor_detail_direct_navigation');
      } else {
        console.log('  ℹ️ Vendor detail page not accessible or not found');
      }
    }
  });
});