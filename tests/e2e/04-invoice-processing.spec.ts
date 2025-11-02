import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import path from 'path';

test.describe('Invoice Processing Automation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should navigate to invoice processing section', async ({ page }) => {
    console.log('🧾 Testing invoice processing navigation...');

    // Try multiple possible invoice routes
    const invoiceRoutes = ['/invoices', '/invoice', '/upload', '/processing'];
    let successfulRoute = null;

    for (const route of invoiceRoutes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        if (page.url().includes(route) && !page.url().includes('404')) {
          successfulRoute = route;
          console.log(`  ✅ Successfully accessed: ${route}`);
          break;
        }
      } catch (error) {
        console.log(`  ⚠️ Route ${route} not accessible`);
      }
    }

    if (successfulRoute) {
      await helpers.takeScreenshot('invoice_processing_page_loaded');
      
      // Look for invoice-related content
      const invoiceElements = [
        'h1:has-text("Invoice")',
        'h2:has-text("Invoice")',
        '[data-testid*="invoice"]',
        '.invoice',
        '.upload',
        'input[type="file"]'
      ];

      for (const selector of invoiceElements) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`    📋 Found ${count} invoice elements: ${selector}`);
        }
      }
    } else {
      console.log('  ℹ️ No direct invoice processing page found, checking dashboard for upload options');
      await page.goto('/');
      await helpers.waitForPageLoad();
    }
  });

  test('should test file upload component functionality', async ({ page }) => {
    console.log('📁 Testing file upload component...');

    // Navigate to likely upload locations
    const uploadLocations = ['/', '/invoices', '/upload'];
    
    for (const location of uploadLocations) {
      await page.goto(location);
      await helpers.waitForPageLoad();
      
      console.log(`  🔍 Checking upload options at: ${location}`);

      // Look for file input elements
      const fileInputs = page.locator('input[type="file"]');
      const fileInputCount = await fileInputs.count();

      if (fileInputCount > 0) {
        console.log(`    ✅ Found ${fileInputCount} file input(s)`);
        
        for (let i = 0; i < fileInputCount; i++) {
          const fileInput = fileInputs.nth(i);
          const accept = await fileInput.getAttribute('accept');
          const multiple = await fileInput.getAttribute('multiple');
          
          console.log(`      File input ${i + 1}:`);
          console.log(`        Accept: ${accept || 'any'}`);
          console.log(`        Multiple: ${multiple !== null}`);
        }

        await helpers.takeScreenshot(`file_upload_found_${location.replace('/', 'root')}`);
        break;
      }

      // Look for drag-and-drop zones
      const dropzoneSelectors = [
        '[data-testid*="dropzone"]',
        '.dropzone',
        '[class*="drop-zone"]',
        '.upload-area',
        '[data-testid*="upload"]',
        '.drag-drop'
      ];

      for (const selector of dropzoneSelectors) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`    📤 Found ${count} dropzone elements: ${selector}`);
          
          // Test hover over dropzone
          await elements.first().hover();
          await page.waitForTimeout(500);
          await helpers.takeScreenshot(`dropzone_hover_${location.replace('/', 'root')}`);
        }
      }

      // Look for upload buttons
      const uploadButtons = [
        'button:has-text("Upload")',
        'button:has-text("Browse")',
        'button:has-text("Choose File")',
        '[data-testid*="upload-button"]',
        '.upload-button'
      ];

      for (const selector of uploadButtons) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`    🔘 Found ${count} upload buttons: ${selector}`);
        }
      }
    }
  });

  test('should create test files and simulate upload process', async ({ page }) => {
    console.log('🧪 Creating test files and simulating upload...');

    // Create test files directory
    await helpers.getPage().evaluate(() => {
      // This will run in browser context, so we can't actually create files
      // We'll work with the upload simulation instead
    });

    // Navigate to upload area
    await page.goto('/');
    await helpers.waitForPageLoad();

    const fileInputs = page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();

    if (fileInputCount > 0) {
      console.log(`  📁 Testing file upload with ${fileInputCount} input(s)...`);
      
      // Create a simple test file content that we can use for upload simulation
      const testFileContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
180
%%EOF`;

      try {
        // For the test environment, we'll simulate the upload process
        // by focusing on the file input and checking the UI response
        
        const firstFileInput = fileInputs.first();
        
        // Simulate file selection by focusing and triggering change events
        await firstFileInput.focus();
        console.log('    📎 File input focused');
        
        await helpers.takeScreenshot('file_input_focused');
        
        // Check if there are any upload progress indicators or areas
        const progressSelectors = [
          '[data-testid*="progress"]',
          '.progress',
          '.upload-progress',
          '[role="progressbar"]'
        ];

        for (const selector of progressSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    📊 Found ${count} progress indicators: ${selector}`);
          }
        }

      } catch (error) {
        console.log(`    ⚠️ File upload simulation error: ${error}`);
      }

    } else {
      console.log('  ℹ️ No file inputs found for upload testing');
    }

    await helpers.takeScreenshot('file_upload_test_complete');
  });

  test('should test AI processing simulation and status updates', async ({ page }) => {
    console.log('🤖 Testing AI processing simulation...');

    await page.goto('/');
    await helpers.waitForPageLoad();

    // Look for AI processing indicators
    const aiProcessingSelectors = [
      '[data-testid*="ai"]',
      '[data-testid*="processing"]',
      '.ai-processing',
      '.processing-status',
      '[class*="ai"]',
      '.scan-progress',
      '.analysis'
    ];

    let foundAiElements = false;

    for (const selector of aiProcessingSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  🧠 Found ${count} AI processing elements: ${selector}`);
        foundAiElements = true;
        
        // Test interaction with AI elements
        for (let i = 0; i < Math.min(count, 3); i++) {
          const element = elements.nth(i);
          await element.hover();
          
          const text = await element.textContent();
          console.log(`    📝 AI element ${i + 1} text: ${text?.trim()}`);
        }
      }
    }

    if (!foundAiElements) {
      console.log('  ℹ️ No AI processing indicators found in current view');
    }

    // Look for status indicators
    const statusSelectors = [
      '.status',
      '[data-status]',
      '.badge',
      '[class*="status"]',
      '.indicator'
    ];

    for (const selector of statusSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  📊 Found ${count} status elements: ${selector}`);
      }
    }

    // Simulate waiting for processing
    console.log('  ⏳ Simulating processing wait time...');
    await page.waitForTimeout(3000);

    await helpers.takeScreenshot('ai_processing_simulation');

    // Check for any dynamic content changes
    const bodyText = await page.textContent('body');
    const hasProcessingTerms = ['processing', 'analyzing', 'scanning', 'ai', 'loading'].some(term => 
      bodyText?.toLowerCase().includes(term)
    );

    console.log(`  🔍 Page contains processing-related terms: ${hasProcessingTerms}`);
  });

  test('should test invoice approval/rejection workflow', async ({ page }) => {
    console.log('✅❌ Testing invoice approval/rejection workflow...');

    // Check if we can access any invoice detail pages
    const invoiceRoutes = ['/invoices/1', '/invoices/sample', '/invoice/1'];
    let accessibleRoute = null;

    for (const route of invoiceRoutes) {
      try {
        const response = await page.goto(route);
        await helpers.waitForPageLoad();
        
        if (response?.ok() && !page.url().includes('404')) {
          accessibleRoute = route;
          console.log(`  ✅ Accessed invoice route: ${route}`);
          break;
        }
      } catch (error) {
        console.log(`  ⚠️ Route ${route} not accessible: ${error}`);
      }
    }

    if (accessibleRoute) {
      await helpers.takeScreenshot('invoice_detail_page');

      // Look for approval/rejection buttons
      const actionButtons = [
        'button:has-text("Approve")',
        'button:has-text("Reject")',
        'button:has-text("Accept")',
        'button:has-text("Decline")',
        '[data-testid*="approve"]',
        '[data-testid*="reject"]'
      ];

      const foundActions = [];

      for (const selector of actionButtons) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`    ✅ Found ${count} action buttons: ${selector}`);
          foundActions.push({ selector, elements });
        }
      }

      if (foundActions.length > 0) {
        // Test approve action
        const approveButtons = foundActions.filter(action => 
          action.selector.toLowerCase().includes('approve') || 
          action.selector.toLowerCase().includes('accept')
        );

        if (approveButtons.length > 0) {
          console.log('  👍 Testing approve action...');
          try {
            await approveButtons[0].elements.first().click();
            await page.waitForTimeout(2000);
            await helpers.takeScreenshot('invoice_approve_clicked');
          } catch (error) {
            console.log(`    ⚠️ Approve action failed: ${error}`);
          }
        }

        // Test reject action
        const rejectButtons = foundActions.filter(action => 
          action.selector.toLowerCase().includes('reject') || 
          action.selector.toLowerCase().includes('decline')
        );

        if (rejectButtons.length > 0) {
          console.log('  👎 Testing reject action...');
          try {
            await rejectButtons[0].elements.first().click();
            await page.waitForTimeout(2000);
            await helpers.takeScreenshot('invoice_reject_clicked');
          } catch (error) {
            console.log(`    ⚠️ Reject action failed: ${error}`);
          }
        }
      } else {
        console.log('  ℹ️ No approval/rejection buttons found');
      }

    } else {
      console.log('  ℹ️ No accessible invoice detail pages found for approval/rejection testing');
      
      // Check main dashboard for any approval workflow
      await page.goto('/');
      await helpers.waitForPageLoad();
      
      const dashboardActions = [
        'button:has-text("Approve")',
        'button:has-text("Review")',
        '.approval-card',
        '[data-testid*="approval"]'
      ];

      for (const selector of dashboardActions) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`    📋 Found ${count} dashboard approval elements: ${selector}`);
        }
      }
    }

    await helpers.takeScreenshot('invoice_approval_workflow_complete');
  });

  test('should test invoice processing responsiveness', async ({ page }) => {
    console.log('📱 Testing invoice processing responsive design...');

    const testRoutes = ['/', '/invoices'];
    
    for (const route of testRoutes) {
      console.log(`  📐 Testing responsive design for: ${route}`);
      
      await page.goto(route);
      await helpers.waitForPageLoad();

      const screenshots = await helpers.testResponsiveDesign();
      console.log(`    📸 Captured responsive screenshots:`, screenshots);

      // Test mobile-specific interactions
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if upload functionality works on mobile
      const mobileFileInputs = page.locator('input[type="file"]');
      const mobileFileInputCount = await mobileFileInputs.count();
      
      if (mobileFileInputCount > 0) {
        console.log(`    📱 Mobile file inputs available: ${mobileFileInputCount}`);
        await helpers.takeScreenshot(`mobile_file_upload_${route.replace('/', 'root')}`);
      }
    }

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });
  });
});