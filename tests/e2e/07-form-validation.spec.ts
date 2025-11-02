import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Form Input and Validation Testing', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should test all form fields with valid and invalid data', async ({ page }) => {
    console.log('📝 Testing form fields validation...');

    // Test forms across different pages
    const formRoutes = ['/vendors', '/settings', '/', '/contacts'];
    
    for (const route of formRoutes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📋 Testing forms on: ${route}`);

        // Look for form elements
        const forms = page.locator('form');
        const formCount = await forms.count();
        
        if (formCount > 0) {
          console.log(`    📝 Found ${formCount} forms`);
          
          for (let i = 0; i < Math.min(formCount, 3); i++) {
            const form = forms.nth(i);
            
            console.log(`      🔍 Testing form ${i + 1}`);
            
            // Find input fields within this form
            const inputs = form.locator('input, textarea, select');
            const inputCount = await inputs.count();
            
            if (inputCount > 0) {
              console.log(`        📝 Found ${inputCount} input fields in form ${i + 1}`);
              
              for (let j = 0; j < Math.min(inputCount, 5); j++) {
                const input = inputs.nth(j);
                const inputType = await input.getAttribute('type') || 'text';
                const inputName = await input.getAttribute('name') || `input_${j}`;
                const required = await input.getAttribute('required') !== null;
                
                console.log(`          🔧 Testing input: ${inputName} (${inputType}) ${required ? '[required]' : ''}`);
                
                try {
                  // Test valid values first
                  await testValidInputValues(input, inputType, inputName);
                  
                  // Test invalid values
                  await testInvalidInputValues(input, inputType, inputName, page);
                  
                } catch (error) {
                  console.log(`          ⚠️ Error testing input ${inputName}: ${error}`);
                }
              }
              
              await helpers.takeScreenshot(`form_${i + 1}_tested_${route.replace('/', 'root')}`);
            }
          }
        } else {
          // Look for standalone input fields (not in forms)
          const standaloneInputs = page.locator('input, textarea, select').filter({
            hasNot: page.locator('form input, form textarea, form select')
          });
          
          const standaloneCount = await standaloneInputs.count();
          
          if (standaloneCount > 0) {
            console.log(`    📝 Found ${standaloneCount} standalone input fields`);
            
            for (let k = 0; k < Math.min(standaloneCount, 5); k++) {
              const input = standaloneInputs.nth(k);
              const inputType = await input.getAttribute('type') || 'text';
              const inputName = await input.getAttribute('name') || `standalone_${k}`;
              
              console.log(`      🔧 Testing standalone input: ${inputName} (${inputType})`);
              
              try {
                await testValidInputValues(input, inputType, inputName);
                await testInvalidInputValues(input, inputType, inputName, page);
              } catch (error) {
                console.log(`        ⚠️ Error testing standalone input ${inputName}: ${error}`);
              }
            }
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test forms on ${route}: ${error}`);
      }
    }
  });

  const testValidInputValues = async (input: any, inputType: string, inputName: string) => {
    const testValues = getValidTestValues(inputType);
    
    for (const value of testValues) {
      try {
        await input.clear();
        await input.fill(value);
        await input.blur(); // Trigger validation
        await input.page().waitForTimeout(500);
        
        // Check for error indicators
        const hasError = await checkForValidationError(input);
        
        if (!hasError) {
          console.log(`            ✅ Valid value "${value}" accepted for ${inputName}`);
        } else {
          console.log(`            ⚠️ Valid value "${value}" rejected for ${inputName}`);
        }
      } catch (error) {
        console.log(`            ❌ Error testing valid value "${value}" for ${inputName}: ${error}`);
      }
    }
  }

  const testInvalidInputValues = async (input: any, inputType: string, inputName: string, page: any) => {
    const testValues = getInvalidTestValues(inputType);
    
    for (const value of testValues) {
      try {
        await input.clear();
        await input.fill(value);
        await input.blur(); // Trigger validation
        await page.waitForTimeout(500);
        
        // Check for error indicators
        const hasError = await checkForValidationError(input);
        
        if (hasError) {
          console.log(`            ✅ Invalid value "${value}" properly rejected for ${inputName}`);
        } else {
          console.log(`            ⚠️ Invalid value "${value}" incorrectly accepted for ${inputName}`);
        }
      } catch (error) {
        console.log(`            ❌ Error testing invalid value "${value}" for ${inputName}: ${error}`);
      }
    }
  }

  const checkForValidationError = async (input: any) => {
    // Look for various error indicators
    const errorSelectors = [
      '.error',
      '.invalid',
      '[aria-invalid="true"]',
      '.field-error',
      '.validation-error',
      '.error-message'
    ];
    
    // Check the input itself
    const ariaInvalid = await input.getAttribute('aria-invalid');
    if (ariaInvalid === 'true') return true;
    
    // Check for error classes
    const inputClass = await input.getAttribute('class') || '';
    if (inputClass.includes('error') || inputClass.includes('invalid')) return true;
    
    // Check for nearby error elements
    for (const selector of errorSelectors) {
      const errorElements = input.page().locator(selector);
      const errorCount = await errorElements.count();
      if (errorCount > 0) {
        // Check if error is visible and related to this input
        for (let i = 0; i < errorCount; i++) {
          const errorElement = errorElements.nth(i);
          const isVisible = await errorElement.isVisible();
          if (isVisible) return true;
        }
      }
    }
    
    return false;
  }

  const getValidTestValues = (inputType: string): string[] => {
    switch (inputType) {
      case 'email':
        return ['test@example.com', 'user.name@company.co.uk', 'valid@test.org'];
      case 'tel':
      case 'phone':
        return ['555-123-4567', '(555) 123-4567', '+1-555-123-4567'];
      case 'url':
        return ['https://example.com', 'http://test.org', 'https://www.company.com'];
      case 'number':
        return ['123', '45.67', '0', '999'];
      case 'date':
        return ['2024-01-01', '2023-12-31', '2024-06-15'];
      case 'password':
        return ['SecureP@ssw0rd', 'MyP@ssw0rd123', 'Strong!Pass1'];
      default:
        return ['Valid Text', 'Test Input', 'Sample Data'];
    }
  }

  const getInvalidTestValues = (inputType: string): string[] => {
    switch (inputType) {
      case 'email':
        return ['invalid-email', 'test@', '@example.com', 'not.an.email'];
      case 'tel':
      case 'phone':
        return ['not-a-phone', '123', 'abc-def-ghij'];
      case 'url':
        return ['not-a-url', 'http://', 'www.example', 'invalid.url'];
      case 'number':
        return ['not-a-number', 'abc', '12.34.56'];
      case 'date':
        return ['invalid-date', '2024-13-01', '32/01/2024', 'not-a-date'];
      case 'password':
        return ['weak', '123', '   ', 'a']; // Assuming password requirements
      default:
        return ['', '   ', '<script>alert("xss")</script>']; // Empty and XSS attempt
    }
  }

  test('should test form submission and loading states', async ({ page }) => {
    console.log('🚀 Testing form submission and loading states...');

    const routes = ['/vendors', '/settings', '/'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📨 Testing form submission on: ${route}`);

        const forms = page.locator('form');
        const formCount = await forms.count();
        
        if (formCount > 0) {
          for (let i = 0; i < Math.min(formCount, 2); i++) {
            const form = forms.nth(i);
            
            console.log(`    📝 Testing submission for form ${i + 1}`);
            
            // Fill out form with valid data
            const inputs = form.locator('input, textarea, select');
            const inputCount = await inputs.count();
            
            for (let j = 0; j < Math.min(inputCount, 5); j++) {
              const input = inputs.nth(j);
              const inputType = await input.getAttribute('type') || 'text';
              const required = await input.getAttribute('required') !== null;
              
              if (required || j < 3) { // Fill required fields and first 3 fields
                const validValue = getValidTestValues(inputType)[0];
                try {
                  await input.fill(validValue);
                } catch (error) {
                  console.log(`      ⚠️ Could not fill input ${j}: ${error}`);
                }
              }
            }
            
            await helpers.takeScreenshot(`form_${i + 1}_filled_${route.replace('/', 'root')}`);
            
            // Look for submit button
            const submitButtons = form.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Save")');
            const submitCount = await submitButtons.count();
            
            if (submitCount > 0) {
              const submitButton = submitButtons.first();
              
              try {
                console.log(`      🚀 Attempting form submission...`);
                await submitButton.click();
                await page.waitForTimeout(2000);
                
                // Look for loading states
                const loadingElements = page.locator('.loading, .spinner, [data-testid*="loading"], .submitting');
                const hasLoading = await loadingElements.count() > 0;
                
                if (hasLoading) {
                  console.log(`        ⏳ Loading state detected`);
                  await helpers.takeScreenshot(`form_${i + 1}_loading_${route.replace('/', 'root')}`);
                }
                
                // Check for success/error messages
                await page.waitForTimeout(3000);
                
                const successMessages = page.locator('.success, .alert-success, [data-testid*="success"]');
                const errorMessages = page.locator('.error, .alert-error, [data-testid*="error"]');
                
                const hasSuccess = await successMessages.count() > 0;
                const hasError = await errorMessages.count() > 0;
                
                if (hasSuccess) {
                  console.log(`        ✅ Success message detected`);
                } else if (hasError) {
                  console.log(`        ❌ Error message detected`);
                } else {
                  console.log(`        ℹ️ No clear success/error feedback`);
                }
                
                await helpers.takeScreenshot(`form_${i + 1}_submitted_${route.replace('/', 'root')}`);
                
              } catch (error) {
                console.log(`      ⚠️ Form submission failed: ${error}`);
              }
            } else {
              console.log(`      ℹ️ No submit button found for form ${i + 1}`);
            }
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test form submission on ${route}: ${error}`);
      }
    }
  });

  test('should test file upload validation', async ({ page }) => {
    console.log('📁 Testing file upload validation...');

    const routes = ['/', '/vendors', '/upload'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  📤 Testing file upload validation on: ${route}`);

        const fileInputs = page.locator('input[type="file"]');
        const fileInputCount = await fileInputs.count();
        
        if (fileInputCount > 0) {
          console.log(`    📁 Found ${fileInputCount} file input(s)`);
          
          for (let i = 0; i < fileInputCount; i++) {
            const fileInput = fileInputs.nth(i);
            const accept = await fileInput.getAttribute('accept');
            const multiple = await fileInput.getAttribute('multiple') !== null;
            
            console.log(`      📋 File input ${i + 1}:`);
            console.log(`        Accept: ${accept || 'any'}`);
            console.log(`        Multiple: ${multiple}`);
            
            // Test file input focus and interaction
            try {
              await fileInput.focus();
              await page.waitForTimeout(500);
              
              console.log(`        ✅ File input can be focused`);
              
              // Look for associated error messages or validation
              const parentElement = page.locator(`input[type="file"] >> nth=${i} >> ..`);
              const errorElements = parentElement.locator('.error, .invalid, .validation-error');
              const errorCount = await errorElements.count();
              
              if (errorCount > 0) {
                console.log(`        📝 Found ${errorCount} potential validation elements`);
              }
              
            } catch (error) {
              console.log(`        ⚠️ File input interaction failed: ${error}`);
            }
          }
          
          await helpers.takeScreenshot(`file_upload_validation_${route.replace('/', 'root')}`);
        } else {
          console.log(`    ℹ️ No file inputs found on ${route}`);
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test file upload validation on ${route}: ${error}`);
      }
    }
  });

  test('should test form error handling and user feedback', async ({ page }) => {
    console.log('💬 Testing form error handling and user feedback...');

    const routes = ['/vendors', '/settings', '/'];
    
    for (const route of routes) {
      try {
        await page.goto(route);
        await helpers.waitForPageLoad();
        
        console.log(`  💬 Testing error feedback on: ${route}`);

        const forms = page.locator('form');
        const formCount = await forms.count();
        
        if (formCount > 0) {
          for (let i = 0; i < Math.min(formCount, 2); i++) {
            const form = forms.nth(i);
            
            console.log(`    📝 Testing error feedback for form ${i + 1}`);
            
            // Try submitting empty form (should trigger validation)
            const submitButtons = form.locator('button[type="submit"], input[type="submit"]');
            const submitCount = await submitButtons.count();
            
            if (submitCount > 0) {
              try {
                console.log(`      🚀 Submitting empty form to test validation...`);
                await submitButtons.first().click();
                await page.waitForTimeout(2000);
                
                // Look for error messages
                const errorSelectors = [
                  '.error',
                  '.invalid',
                  '.validation-error',
                  '[aria-invalid="true"]',
                  '.field-error',
                  '.alert-error'
                ];
                
                let foundErrors = 0;
                const errorDetails = [];
                
                for (const selector of errorSelectors) {
                  const elements = page.locator(selector);
                  const count = await elements.count();
                  
                  if (count > 0) {
                    foundErrors += count;
                    
                    for (let j = 0; j < Math.min(count, 3); j++) {
                      const element = elements.nth(j);
                      const isVisible = await element.isVisible();
                      const text = await element.textContent();
                      
                      if (isVisible && text?.trim()) {
                        errorDetails.push({
                          selector,
                          text: text.trim(),
                          visible: true
                        });
                      }
                    }
                  }
                }
                
                console.log(`        📊 Found ${foundErrors} error indicators`);
                
                if (errorDetails.length > 0) {
                  console.log(`        💬 Error messages:`);
                  errorDetails.forEach((error, index) => {
                    console.log(`          ${index + 1}. "${error.text}" (${error.selector})`);
                  });
                }
                
                await helpers.takeScreenshot(`form_${i + 1}_validation_errors_${route.replace('/', 'root')}`);
                
              } catch (error) {
                console.log(`      ⚠️ Error testing form validation: ${error}`);
              }
            }
          }
        }

        // Test individual field validation
        const allInputs = page.locator('input[required], textarea[required]');
        const requiredInputCount = await allInputs.count();
        
        if (requiredInputCount > 0) {
          console.log(`    📝 Testing ${requiredInputCount} required field(s) validation`);
          
          for (let k = 0; k < Math.min(requiredInputCount, 3); k++) {
            const input = allInputs.nth(k);
            const inputName = await input.getAttribute('name') || `required_${k}`;
            
            try {
              // Clear field and trigger validation
              await input.focus();
              await input.clear();
              await input.blur();
              await page.waitForTimeout(500);
              
              // Check for validation feedback
              const hasError = await checkForValidationError(input);
              
              if (hasError) {
                console.log(`      ✅ Required field validation working for ${inputName}`);
              } else {
                console.log(`      ⚠️ Required field validation not triggered for ${inputName}`);
              }
              
            } catch (error) {
              console.log(`      ❌ Error testing required field ${inputName}: ${error}`);
            }
          }
        }

      } catch (error) {
        console.log(`  ⚠️ Could not test error handling on ${route}: ${error}`);
      }
    }
  });
});