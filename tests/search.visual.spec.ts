import {test,expect} from '@playwright/test';
import {SearchPage} from '../src/pages/search.page';
const term=process.env.SEARCH_TERM??'playstation 5';
test('@visual Regresión visual de la página de resultados',async({page})=>{
 const search=new SearchPage(page);
 await search.open();
 await search.search(term);
 await search.filterWhite();
 await search.sortLowToHigh();
 await search.waitForResults();
 await expect(page).toHaveScreenshot('resultados-busqueda.png',{
  fullPage:false,animations:'disabled',maxDiffPixelRatio:0.03,
  mask:[page.locator('[data-testid$="-price"]'),page.locator('img'),page.locator('.MuiRating-root')]
 });
});
