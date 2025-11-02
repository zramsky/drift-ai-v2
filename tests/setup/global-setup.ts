import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for DRIFT.AI E2E Testing');
  
  // Launch browser to test basic connectivity
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test connectivity to the platform
    const baseURL = config.projects?.[0]?.use?.baseURL || config.webServer?.url || 'https://frontend-j49urb7tp-zramskys-projects.vercel.app';
    console.log(`🌐 Testing connectivity to: ${baseURL}`);
    
    const response = await page.goto(baseURL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (response?.ok()) {
      console.log('✅ Platform is accessible');
    } else {
      console.log(`⚠️ Platform returned status: ${response?.status()}`);
    }
    
  } catch (error) {
    console.error('❌ Error during global setup:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
  
  console.log('✨ Global setup completed successfully');
}

export default globalSetup;