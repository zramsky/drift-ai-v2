import { defineConfig, devices } from '@playwright/test';

/**
 * Local testing configuration for performance and compatibility testing
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'performance-test-results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium-performance',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      },
      testMatch: /performance-tests\.spec\.ts/,
    },

    {
      name: 'firefox-compatibility',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1440, height: 900 }
      },
      testMatch: /performance-tests\.spec\.ts/,
    },

    {
      name: 'mobile-responsiveness',
      use: { 
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 667 }
      },
      testMatch: /performance-tests\.spec\.ts/,
    },
  ],
});