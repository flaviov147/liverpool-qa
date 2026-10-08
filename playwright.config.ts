import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',timeout:150_000,expect:{timeout:15_000},fullyParallel:false,
 retries:process.env.CI?1:0,workers:Number(process.env.WORKERS??1),
 reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report'}]],
 use:{baseURL:process.env.BASE_URL??'https://www.liverpool.com.mx',headless:true,locale:'es-MX',
  trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
 projects:[
  {name:'chromium',testIgnore:['**/unit/**','**/*.visual.spec.ts'],use:{...devices['Desktop Chrome'],channel:'chromium'}},
  {name:'firefox',testIgnore:['**/unit/**','**/*.visual.spec.ts'],use:{...devices['Desktop Firefox']}},
  {name:'webkit',testIgnore:['**/unit/**','**/*.visual.spec.ts'],use:{...devices['Desktop Safari']}},
  {name:'visual',testMatch:'**/*.visual.spec.ts',use:{...devices['Desktop Chrome'],channel:'chromium'}},
  {name:'unit',testMatch:'**/unit/**'}]
});
