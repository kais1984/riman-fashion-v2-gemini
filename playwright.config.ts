import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  retries: 1,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 60000,
  },
  projects: [{ name: 'chromium', use: {} }],
});
