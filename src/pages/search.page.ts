import {expect,type Page,type Locator} from '@playwright/test';
import {parsePrice,type Product} from '../utils/products';
/** Isolates Liverpool's volatile DOM. Adjust here after inspecting the live page. */
export class SearchPage{
 constructor(private readonly page:Page){}
 private get cards():Locator{return this.page.locator('[data-testid="product-card"], [data-test="product-card"], .product-card, .m-product__card, li[class*="product"]');}
 async open(){await this.page.goto('/',{waitUntil:'domcontentloaded'});}
 async search(term:string){
  const input=this.page.locator('input[type="search"], input[name*="search" i], input[placeholder*="Buscar" i], input[aria-label*="Buscar" i]').first();
  await expect(input,'Buscador Liverpool').toBeVisible();await input.fill(term);await input.press('Enter');
  await expect(this.page).toHaveURL(/search|busca|s\?|keyword|query/i);
 }
 async filterWhite(){
  const option=this.page.getByRole('checkbox',{name:/^(blanco|white)$/i}).or(this.page.getByText(/^(blanco|white)$/i)).first();
  if(!await option.isVisible().catch(()=>false)){
   const section=this.page.getByText(/^color(es)?$/i).first();await expect(section,'Sección Color').toBeVisible();await section.click();
  }
  await expect(option,'Filtro blanco').toBeVisible();
  if(await option.getAttribute('type')==='checkbox')await option.check();else await option.click();
 }
 async sortLowToHigh(){
  const native=this.page.locator('select').filter({has:this.page.locator('option')}).first();
  if(await native.isVisible().catch(()=>false)){
   const options=await native.locator('option').all();for(const opt of options){const label=await opt.innerText();if(/menor.*mayor|precio.*ascendente|low.*high/i.test(label)){await native.selectOption({label});return;}}
  }
  const trigger=this.page.getByText(/ordenar por|relevancia|sort by/i).first();await expect(trigger,'Ordenamiento').toBeVisible();await trigger.click();
  await this.page.getByText(/precio.*menor.*mayor|menor.*mayor|low.*high/i).last().click();
 }
 async firstFive():Promise<Product[]>{
  await expect(this.cards.first(),'Tarjetas de resultados').toBeVisible();
  await expect.poll(()=>this.cards.count()).toBeGreaterThanOrEqual(5);
  const output:Product[]=[];
  for(let i=0;i<5;i++){
   const card=this.cards.nth(i);
   const name=(await card.locator('[data-testid="product-name"], .product-name, [class*="productName"], h2, h3').first().innerText()).trim();
   const priceText=await card.locator('[data-testid="product-price"], .price, [class*="salePrice"], [class*="price"] ').first().innerText();
   const price=parsePrice(priceText);expect(name).not.toBe('');expect(Number.isFinite(price),`Precio no numérico: ${priceText}`).toBeTruthy();output.push({name,price});
  }return output;
 }
}
