import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Evidence Viewer Testing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should navigate to evidence viewer if accessible', async ({ page }) => {
    console.log('🔍 Testing evidence viewer navigation...');

    // Try different routes that might lead to evidence viewer
    const evidenceRoutes = [
      '/evidence',
      '/evidence/1',
      '/evidence/sample',
      '/documents',
      '/viewer',
      '/pdf-viewer'
    ];

    let accessibleRoute = null;

    for (const route of evidenceRoutes) {
      try {
        console.log(`  🧭 Trying route: ${route}`);
        const response = await page.goto(route);
        await helpers.waitForPageLoad();
        
        if (response?.ok() && !page.url().includes('404') && !page.url().includes('not-found')) {
          accessibleRoute = route;
          console.log(`    ✅ Successfully accessed: ${route}`);
          break;
        }
      } catch (error) {
        console.log(`    ⚠️ Route ${route} not accessible: ${error}`);
      }
    }

    if (accessibleRoute) {
      await helpers.takeScreenshot('evidence_viewer_loaded');
      
      // Look for evidence viewer components
      const evidenceElements = [
        'canvas', // PDF canvas
        'iframe', // Embedded document
        '.pdf-viewer',
        '[data-testid*="pdf"]',
        '[data-testid*="document"]',
        '.document-viewer',
        '.evidence-viewer'
      ];

      for (const selector of evidenceElements) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`    📄 Found ${count} evidence viewer elements: ${selector}`);
        }
      }
    } else {
      console.log('  ℹ️ No direct evidence viewer routes accessible');
      
      // Check if evidence viewer can be accessed from other pages
      await page.goto('/');
      await helpers.waitForPageLoad();
      
      // Look for links to evidence or documents
      const evidenceLinks = [
        'a[href*="evidence"]',
        'a[href*="document"]',
        'a[href*="pdf"]',
        'button:has-text("View")',
        'button:has-text("Evidence")'
      ];

      for (const selector of evidenceLinks) {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`    🔗 Found ${count} potential evidence links: ${selector}`);
        }
      }
    }
  });

  test('should test PDF document viewing capabilities', async ({ page }) => {
    console.log('📄 Testing PDF document viewing...');

    // First, try to access evidence viewer routes
    const routes = ['/evidence/1', '/evidence', '/documents', '/'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📋 Testing PDF viewing on: ${route}`);

        // Look for PDF-related elements
        const pdfElements = [
          'canvas[data-page]', // PDF.js canvas
          '.react-pdf__Page',
          '.pdf-page',
          '[class*="pdf"]',
          'canvas[width][height]', // Generic canvas that might be PDF
          'iframe[src*="pdf"]'
        ];

        let foundPDFViewer = false;

        for (const selector of pdfElements) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    📄 Found ${count} PDF elements: ${selector}`);
            foundPDFViewer = true;
            
            // Test interaction with first PDF element
            const firstElement = elements.first();
            
            try {
              await firstElement.hover();
              await page.waitForTimeout(500);
              
              // Test click interaction
              await firstElement.click();
              await page.waitForTimeout(500);
              
              console.log(`      ✅ PDF element interaction successful`);
            } catch (error) {
              console.log(`      ℹ️ PDF element interaction limited: ${error}`);
            }
          }
        }

        if (foundPDFViewer) {
          await helpers.takeScreenshot(`pdf_viewer_${route.replace('/', 'root')}`);
          
          // Test PDF controls
          const pdfControls = [
            'button[aria-label*="zoom" i]',
            'button[aria-label*="page" i]',
            '.zoom-in',
            '.zoom-out',
            '.next-page',
            '.prev-page',
            '[data-testid*="zoom"]',
            '[data-testid*="page"]'
          ];

          for (const selector of pdfControls) {
            const elements = page.locator(selector);
            const count = await elements.count();
            if (count > 0) {
              console.log(`      🎮 Found ${count} PDF controls: ${selector}`);
              
              // Test first control
              try {
                await elements.first().click();
                await page.waitForTimeout(1000);
                console.log(`        ✅ PDF control interaction successful`);
              } catch (error) {
                console.log(`        ⚠️ PDF control interaction failed: ${error}`);
              }
            }
          }

          // Test keyboard navigation for PDF
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('ArrowUp');
          await page.keyboard.press('PageDown');
          await page.keyboard.press('PageUp');
          
          console.log('      ⌨️ PDF keyboard navigation tested');
          
          break; // Found PDF viewer, no need to test other routes
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test PDF viewing on ${route}: ${error}`);
      }
    }
  });

  test('should test evidence anchors and findings interaction', async ({ page }) => {
    console.log('🎯 Testing evidence anchors and findings...');

    const routes = ['/evidence/1', '/evidence', '/'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  🔍 Testing evidence anchors on: ${route}`);

        // Look for evidence anchors or findings
        const anchorSelectors = [
          '[data-testid*="anchor"]',
          '.evidence-anchor',
          '.finding',
          '.annotation',
          '.highlight',
          '[class*="finding"]',
          '[class*="anchor"]',
          '.marker'
        ];

        let foundAnchors = false;

        for (const selector of anchorSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    🎯 Found ${count} evidence anchors: ${selector}`);
            foundAnchors = true;
            
            // Test interaction with anchors
            for (let i = 0; i < Math.min(count, 3); i++) {
              const anchor = elements.nth(i);
              
              try {
                await anchor.hover();
                await page.waitForTimeout(500);
                
                // Check for tooltip or popup
                const tooltip = page.locator('.tooltip, [role="tooltip"], .popup');
                const tooltipVisible = await tooltip.count() > 0;
                
                if (tooltipVisible) {
                  console.log(`      💬 Tooltip/popup appeared for anchor ${i + 1}`);
                }
                
                await anchor.click();
                await page.waitForTimeout(500);
                
                console.log(`      ✅ Evidence anchor ${i + 1} interaction successful`);
                
              } catch (error) {
                console.log(`      ⚠️ Evidence anchor ${i + 1} interaction failed: ${error}`);
              }
            }
          }
        }

        if (foundAnchors) {
          await helpers.takeScreenshot(`evidence_anchors_${route.replace('/', 'root')}`);
        }

        // Look for findings list or summary
        const findingsSelectors = [
          '.findings-list',
          '.summary',
          '[data-testid*="findings"]',
          '.evidence-summary',
          '.results'
        ];

        for (const selector of findingsSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    📋 Found ${count} findings elements: ${selector}`);
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test evidence anchors on ${route}: ${error}`);
      }
    }
  });

  test('should test side-by-side document comparison', async ({ page }) => {
    console.log('👯 Testing side-by-side document comparison...');

    const routes = ['/evidence/1', '/evidence', '/compare'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📊 Testing document comparison on: ${route}`);

        // Look for split-view or comparison layout
        const comparisonSelectors = [
          '.split-view',
          '.comparison-view',
          '.side-by-side',
          '[data-testid*="comparison"]',
          '.document-compare',
          '.dual-pane'
        ];

        let foundComparison = false;

        for (const selector of comparisonSelectors) {
          const elements = page.locator(selector);
          const count = await elements.count();
          if (count > 0) {
            console.log(`    👥 Found ${count} comparison view elements: ${selector}`);
            foundComparison = true;
          }
        }

        // Look for multiple document viewers (indicating comparison)
        const documentViewers = page.locator('canvas, iframe, .pdf-viewer, .document-viewer');
        const viewerCount = await documentViewers.count();
        
        if (viewerCount >= 2) {
          console.log(`    📄 Found ${viewerCount} document viewers (potential comparison view)`);
          foundComparison = true;
          
          // Test interaction with each viewer
          for (let i = 0; i < Math.min(viewerCount, 2); i++) {
            const viewer = documentViewers.nth(i);
            
            try {
              await viewer.hover();
              await page.waitForTimeout(500);
              
              await viewer.click();
              await page.waitForTimeout(500);
              
              console.log(`      ✅ Document viewer ${i + 1} interaction successful`);
            } catch (error) {
              console.log(`      ⚠️ Document viewer ${i + 1} interaction failed: ${error}`);
            }
          }
        }

        if (foundComparison) {
          await helpers.takeScreenshot(`document_comparison_${route.replace('/', 'root')}`);
          
          // Look for comparison controls
          const comparisonControls = [
            'button:has-text("Compare")',
            'button:has-text("Sync")',
            '.sync-scroll',
            '[data-testid*="sync"]',
            '.comparison-controls'
          ];

          for (const selector of comparisonControls) {
            const elements = page.locator(selector);
            const count = await elements.count();
            if (count > 0) {
              console.log(`      🎮 Found ${count} comparison controls: ${selector}`);
            }
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test document comparison on ${route}: ${error}`);
      }
    }
  });

  test('should test evidence viewer responsive behavior', async ({ page }) => {
    console.log('📱 Testing evidence viewer responsive design...');

    const routes = ['/evidence/1', '/evidence', '/'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📐 Testing responsive behavior on: ${route}`);

        // Test different viewport sizes
        const viewports = [
          { width: 1440, height: 900, name: 'desktop' },
          { width: 768, height: 1024, name: 'tablet' },
          { width: 375, height: 667, name: 'mobile' }
        ];

        for (const viewport of viewports) {
          console.log(`    📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
          
          await page.setViewportSize(viewport);
          await helpers.waitForPageLoad();
          
          // Check if evidence viewer adapts
          const evidenceElements = page.locator('canvas, iframe, .pdf-viewer, .document-viewer');
          const elementCount = await evidenceElements.count();
          
          if (elementCount > 0) {
            console.log(`      📄 ${elementCount} evidence elements visible at ${viewport.name}`);
            
            // Check element dimensions
            for (let i = 0; i < Math.min(elementCount, 2); i++) {
              const element = evidenceElements.nth(i);
              const boundingBox = await element.boundingBox();
              
              if (boundingBox) {
                const fitsInViewport = boundingBox.width <= viewport.width && 
                                      boundingBox.height <= viewport.height;
                console.log(`        📏 Element ${i + 1} fits viewport: ${fitsInViewport} (${boundingBox.width}x${boundingBox.height})`);
              }
            }
          }
          
          await helpers.takeScreenshot(`evidence_viewer_${viewport.name}_${route.replace('/', 'root')}`);
          
          // Test mobile-specific interactions
          if (viewport.width <= 768) {
            // Test touch gestures simulation
            const viewer = evidenceElements.first();
            if (await viewer.count() > 0) {
              try {
                // Simulate pinch zoom (if supported)
                await viewer.hover();
                await page.mouse.wheel(0, -100); // Zoom in
                await page.waitForTimeout(500);
                await page.mouse.wheel(0, 100); // Zoom out
                
                console.log(`        📱 Mobile gesture simulation attempted`);
              } catch (error) {
                console.log(`        ⚠️ Mobile gesture simulation failed: ${error}`);
              }
            }
          }
        }

        // Reset to desktop viewport
        await page.setViewportSize({ width: 1440, height: 900 });

      } catch (error) {
        console.log(`  ⚠️ Could not test responsive behavior on ${route}: ${error}`);
      }
    }
  });

  test('should test evidence viewer accessibility features', async ({ page }) => {
    console.log('♿ Testing evidence viewer accessibility...');

    const routes = ['/evidence/1', '/evidence', '/'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  ♿ Testing accessibility on: ${route}`);

        // Test keyboard navigation
        console.log('    ⌨️ Testing keyboard navigation...');
        
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        
        const focusedElement = await page.evaluate(() => {
          const element = document.activeElement;
          return element ? {
            tagName: element.tagName,
            className: element.className,
            id: element.id
          } : null;
        });
        
        if (focusedElement) {
          console.log(`      ✅ Keyboard focus active: ${focusedElement.tagName}.${focusedElement.className}#${focusedElement.id}`);
        }

        // Test ARIA attributes
        const evidenceElements = page.locator('canvas, iframe, .pdf-viewer, .document-viewer');
        const elementCount = await evidenceElements.count();
        
        if (elementCount > 0) {
          for (let i = 0; i < Math.min(elementCount, 2); i++) {
            const element = evidenceElements.nth(i);
            
            const ariaLabel = await element.getAttribute('aria-label');
            const role = await element.getAttribute('role');
            const tabIndex = await element.getAttribute('tabindex');
            
            console.log(`      📋 Element ${i + 1} accessibility:`);
            console.log(`        aria-label: ${ariaLabel || 'none'}`);
            console.log(`        role: ${role || 'none'}`);
            console.log(`        tabindex: ${tabIndex || 'default'}`);
          }
        }

        // Test screen reader support
        const srOnlyElements = page.locator('.sr-only, .screen-reader-only, [class*="visually-hidden"]');
        const srCount = await srOnlyElements.count();
        
        if (srCount > 0) {
          console.log(`      👁️ Found ${srCount} screen reader only elements`);
        }

        await helpers.takeScreenshot(`evidence_viewer_accessibility_${route.replace('/', 'root')}`);

      } catch (error) {
        console.log(`  ⚠️ Could not test accessibility on ${route}: ${error}`);
      }
    }
  });
});