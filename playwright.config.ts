import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./tests',timeout:90_000,expect:{timeout:15_000},fullyParallel:false,
 retries:process.env.CI?1:0,workers:process.env.CI?1:undefined,
 reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report'}]],
 use:{baseURL:process.env.BASE_URL??'https://www.liverpool.com.mx',headless:true,
  trace:'retain-on-failure',screenshot:'only-on-failure',video:'retain-on-failure'},
 projects:[{name:'chromium',testIgnore:'**/unit/**',use:{...devices['Desktop Chrome']}},
           {name:'unit',testMatch:'**/unit/**'}]
});
