import { FullConfig } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for DRIFT.AI E2E Testing');
  
  try {
    // Generate test summary report
    const testResultsPath = path.join(process.cwd(), 'test-results.json');
    
    try {
      const testResults = await fs.readFile(testResultsPath, 'utf-8');
      const results = JSON.parse(testResults);
      
      console.log('📊 Test Execution Summary:');
      console.log(`   Total Tests: ${results.stats?.total || 0}`);
      console.log(`   Passed: ${results.stats?.passed || 0}`);
      console.log(`   Failed: ${results.stats?.failed || 0}`);
      console.log(`   Skipped: ${results.stats?.skipped || 0}`);
      console.log(`   Duration: ${results.stats?.duration || 0}ms`);
      
    } catch (error) {
      console.log('⚠️ Could not read test results file');
    }
    
    // Clean up any temporary test files if needed
    console.log('🧹 Cleaning up temporary test resources...');
    
  } catch (error) {
    console.error('❌ Error during global teardown:', error);
  }
  
  console.log('✨ Global teardown completed');
}

export default globalTeardown;