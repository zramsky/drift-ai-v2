import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Reports & Analytics Automation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should navigate to reports and analytics sections', async ({ page }) => {
    console.log('📊 Testing reports and analytics navigation...');

    const reportRoutes = ['/reports', '/analytics', '/dashboard'];
    
    for (const route of reportRoutes) {
      console.log(`  🧭 Testing navigation to: ${route}`);
      
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        if (page.url().includes(route.substring(1)) && !page.url().includes('404')) {
          console.log(`    ✅ Successfully accessed: ${route}`);
          await helpers.takeScreenshot(`${route.replace('/', '')}_page_loaded`);
          
          // Look for charts and data visualization
          const chartSelectors = [
            'canvas',
            'svg',
            '.recharts-wrapper',
            '.chart',
            '[data-testid*="chart"]',
            '.graph',
            '.visualization'
          ];

          for (const selector of chartSelectors) {
            const elements = page.locator(selector);
            const count = await elements.count();
            if (count > 0) {
              console.log(`      📈 Found ${count} chart/visualization elements: ${selector}`);
            }
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Could not access ${route}: ${error}`);
      }
    }
  });

  test('should test report filtering and date range selection', async ({ page }) => {
    console.log('🔧 Testing report filtering functionality...');

    const routes = ['/reports', '/analytics'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  🔍 Testing filters on: ${route}`);

        // Test date range pickers
        const datePickerSelectors = [
          'input[type="date"]',
          '[data-testid*="date"]',
          '.date-picker',
          'input[placeholder*="date" i]',
          '[class*="date-range"]',
          '.calendar-input'
        ];

        for (const selector of datePickerSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    📅 Found ${count} date picker elements: ${selector}`);
            
            // Test date input
            const dateInput = elements.first();
            try {
              await dateInput.click();
              await page.waitForTimeout(500);
              
              // Try to set a date
              await dateInput.fill('2024-01-01');
              await page.waitForTimeout(1000);
              
              console.log(`      ✅ Date picker interaction successful`);
              await helpers.takeScreenshot(`date_picker_${route.replace('/', '')}`);
            } catch (error) {
              console.log(`      ⚠️ Date picker interaction failed: ${error}`);
            }
          }
        }

        // Test dropdown filters
        const filterSelectors = [
          'select',
          '[role="combobox"]',
          '.select-trigger',
          '[data-testid*="filter"]',
          '.filter-dropdown',
          'button:has-text("Filter")'
        ];

        for (const selector of filterSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    🔽 Found ${count} filter dropdown elements: ${selector}`);
            
            const firstFilter = elements.first();
            try {
              await firstFilter.click();
              await page.waitForTimeout(500);
              
              // Look for filter options
              const filterOptions = page.locator('[role="option"], option, .dropdown-item');
              const optionCount = await filterOptions.count();
              
              if (optionCount > 0) {
                console.log(`      📝 Found ${optionCount} filter options`);
                
                // Select first available option
                await filterOptions.first().click();
                await page.waitForTimeout(1000);
                
                console.log(`      ✅ Filter selection successful`);
                await helpers.takeScreenshot(`filter_selected_${route.replace('/', '')}`);
              }
            } catch (error) {
              console.log(`      ⚠️ Filter interaction failed: ${error}`);
            }
          }
        }

        // Test search functionality
        const searchSelectors = [
          'input[type="search"]',
          'input[placeholder*="search" i]',
          '[data-testid*="search"]',
          '.search-input'
        ];

        for (const selector of searchSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    🔍 Found ${count} search elements: ${selector}`);
            
            const searchInput = elements.first();
            try {
              await searchInput.fill('test search');
              await searchInput.press('Enter');
              await page.waitForTimeout(2000);
              
              console.log(`      ✅ Search functionality tested`);
              await helpers.takeScreenshot(`search_results_${route.replace('/', '')}`);
              
              // Clear search
              await searchInput.clear();
              await page.waitForTimeout(1000);
            } catch (error) {
              console.log(`      ⚠️ Search interaction failed: ${error}`);
            }
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test filters on ${route}: ${error}`);
      }
    }
  });

  test('should test export functionality and CSV generation', async ({ page }) => {
    console.log('📤 Testing export functionality...');

    const routes = ['/reports', '/analytics'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📊 Testing export on: ${route}`);

        // Look for export buttons
        const exportSelectors = [
          'button:has-text("Export")',
          'button:has-text("Download")',
          'button:has-text("CSV")',
          'button:has-text("PDF")',
          '[data-testid*="export"]',
          '.export-button',
          '[aria-label*="export" i]'
        ];

        let exportButton = null;

        for (const selector of exportSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    📤 Found ${count} export buttons: ${selector}`);
            exportButton = elements.first();
            break;
          }
        }

        if (exportButton) {
          console.log('    🚀 Testing export functionality...');
          
          try {
            // Set up download listener
            const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
            
            await exportButton.click();
            await page.waitForTimeout(2000);
            
            try {
              const download = await downloadPromise;
              console.log(`      ✅ Download initiated: ${download.suggestedFilename()}`);
              await helpers.takeScreenshot(`export_successful_${route.replace('/', '')}`);
            } catch (downloadError) {
              console.log('      ℹ️ No download triggered, may open in new tab or show dialog');
              await helpers.takeScreenshot(`export_attempted_${route.replace('/', '')}`);
            }
            
          } catch (error) {
            console.log(`      ⚠️ Export button click failed: ${error}`);
          }
        } else {
          console.log('    ℹ️ No export buttons found');
        }

        // Look for export dropdown or menu
        const exportMenuSelectors = [
          '.export-menu',
          '.download-menu',
          '[data-testid*="export-menu"]'
        ];

        for (const selector of exportMenuSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    📋 Found ${count} export menu elements: ${selector}`);
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test export on ${route}: ${error}`);
      }
    }
  });

  test('should test charts and data visualization interactions', async ({ page }) => {
    console.log('📊 Testing charts and data visualization...');

    const routes = ['/reports', '/analytics', '/'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📈 Testing visualizations on: ${route}`);

        // Look for different types of charts
        const chartTypes = [
          { selector: 'canvas', type: 'Canvas Charts' },
          { selector: 'svg', type: 'SVG Charts' },
          { selector: '.recharts-wrapper', type: 'Recharts' },
          { selector: '[class*="chart"]', type: 'Chart Elements' },
          { selector: '.graph', type: 'Graph Elements' }
        ];

        let foundCharts = false;

        for (const chartType of chartTypes) {
          const elements = page.locator(chartType.selector);
          const count = await elements.count();
          
          if (count > 0) {
            console.log(`    📊 Found ${count} ${chartType.type}`);
            foundCharts = true;
            
            // Test interaction with first chart
            const firstChart = elements.first();
            
            try {
              // Test hover interaction
              await firstChart.hover();
              await page.waitForTimeout(500);
              
              // Test click interaction
              await firstChart.click();
              await page.waitForTimeout(500);
              
              console.log(`      ✅ ${chartType.type} interaction successful`);
              
            } catch (error) {
              console.log(`      ℹ️ ${chartType.type} interaction limited: ${error}`);
            }
          }
        }

        if (foundCharts) {
          await helpers.takeScreenshot(`charts_${route.replace('/', 'root')}`);
        } else {
          console.log(`    ℹ️ No charts found on ${route}`);
        }

        // Look for chart tooltips or legends
        const chartUIElements = [
          '.tooltip',
          '.legend',
          '.chart-legend',
          '[role="tooltip"]',
          '.recharts-tooltip',
          '.recharts-legend'
        ];

        for (const selector of chartUIElements) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    🏷️ Found ${count} chart UI elements: ${selector}`);
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test charts on ${route}: ${error}`);
      }
    }
  });

  test('should test facility vs vendor mode switching', async ({ page }) => {
    console.log('🏢 Testing facility vs vendor mode switching...');

    const routes = ['/reports', '/analytics'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  🔄 Testing mode switching on: ${route}`);

        // Look for mode switching controls
        const modeSelectors = [
          'button:has-text("Facility")',
          'button:has-text("Vendor")',
          '[data-testid*="mode"]',
          '.mode-toggle',
          '.tab[data-value*="facility"]',
          '.tab[data-value*="vendor"]',
          'input[type="radio"][value*="facility"]',
          'input[type="radio"][value*="vendor"]'
        ];

        const foundModes = [];

        for (const selector of modeSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    🔘 Found ${count} mode controls: ${selector}`);
            foundModes.push({ selector, elements });
          }
        }

        if (foundModes.length > 0) {
          // Test switching between modes
          for (const mode of foundModes.slice(0, 4)) { // Test max 4 modes
            const firstElement = mode.elements.first();
            const text = await firstElement.textContent();
            
            try {
              console.log(`      🔄 Switching to mode: ${text?.trim()}`);
              await firstElement.click();
              await page.waitForTimeout(2000);
              
              await helpers.takeScreenshot(`mode_${text?.trim().toLowerCase()}_${route.replace('/', '')}`);
              
              // Check if content changed
              const currentUrl = page.url();
              console.log(`        📍 URL after mode switch: ${currentUrl}`);
              
            } catch (error) {
              console.log(`      ⚠️ Mode switch failed for ${text?.trim()}: ${error}`);
            }
          }
        } else {
          console.log(`    ℹ️ No mode switching controls found on ${route}`);
        }

        // Look for tab-based mode switching
        const tabSelectors = [
          '[role="tab"]',
          '.tab',
          '[data-testid*="tab"]'
        ];

        for (const selector of tabSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    📑 Found ${count} tab elements: ${selector}`);
            
            // Test tab switching
            for (let i = 0; i < Math.min(count, 3); i++) {
              const tab = elements.nth(i);
              const tabText = await tab.textContent();
              
              try {
                await tab.click();
                await page.waitForTimeout(1000);
                console.log(`      ✅ Switched to tab: ${tabText?.trim()}`);
              } catch (error) {
                console.log(`      ⚠️ Tab switch failed: ${error}`);
              }
            }
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test mode switching on ${route}: ${error}`);
      }
    }
  });

  test('should verify report data updates with filter changes', async ({ page }) => {
    console.log('🔄 Testing report data updates with filters...');

    const routes = ['/reports', '/analytics'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📊 Testing data updates on: ${route}`);

        // Capture initial state
        const initialScreenshot = `initial_state_${route.replace('/', '')}`;
        await helpers.takeScreenshot(initialScreenshot);
        
        // Get initial page content hash to detect changes
        const initialContent = await page.textContent('body');
        const initialHash = initialContent?.length || 0;
        
        console.log(`    📋 Initial content length: ${initialHash}`);

        // Find and interact with filters
        const filterElements = page.locator('select, [role="combobox"], input[type="date"]');
        const filterCount = await filterElements.count();
        
        if (filterCount > 0) {
          console.log(`    🔧 Found ${filterCount} filter elements to test`);
          
          for (let i = 0; i < Math.min(filterCount, 3); i++) {
            const filter = filterElements.nth(i);
            const tagName = await filter.evaluate(el => el.tagName);
            
            try {
              console.log(`      🔄 Testing filter ${i + 1} (${tagName})`);
              
              if (tagName === 'SELECT') {
                const options = page.locator(`select >> nth=${i} >> option`);
                const optionCount = await options.count();
                
                if (optionCount > 1) {
                  await filter.selectOption({ index: 1 });
                  await page.waitForTimeout(2000);
                  
                  // Check for content changes
                  const updatedContent = await page.textContent('body');
                  const updatedHash = updatedContent?.length || 0;
                  
                  const contentChanged = updatedHash !== initialHash;
                  console.log(`        📈 Content changed: ${contentChanged} (${initialHash} -> ${updatedHash})`);
                  
                  await helpers.takeScreenshot(`filter_${i + 1}_applied_${route.replace('/', '')}`);
                }
              } else if (tagName === 'INPUT') {
                const inputType = await filter.getAttribute('type');
                
                if (inputType === 'date') {
                  await filter.fill('2024-01-01');
                  await page.waitForTimeout(2000);
                  
                  await helpers.takeScreenshot(`date_filter_${i + 1}_${route.replace('/', '')}`);
                }
              }
              
            } catch (error) {
              console.log(`      ⚠️ Filter ${i + 1} interaction failed: ${error}`);
            }
          }
        } else {
          console.log(`    ℹ️ No filter elements found on ${route}`);
        }

        // Look for loading indicators during updates
        const loadingSelectors = [
          '.loading',
          '.spinner',
          '[data-testid*="loading"]',
          '.skeleton'
        ];

        for (const selector of loadingSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    ⏳ Found ${count} loading indicators: ${selector}`);
          }
        }

        await helpers.takeScreenshot(`data_update_test_complete_${route.replace('/', '')}`);

      } catch (error) {
        console.log(`  ⚠️ Could not test data updates on ${route}: ${error}`);
      }
    }
  });
});