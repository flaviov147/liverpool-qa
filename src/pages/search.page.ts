import {expect,type Page,type Locator} from '@playwright/test';
import {parsePrice,type Product} from '../utils/products';
/** Isolates Liverpool's volatile DOM. Selectors verified against the live PLP (Oct 2026). */
export class SearchPage{
 constructor(private readonly page:Page){}
 private get cards():Locator{return this.page.locator('section[data-testid$="-card"]');}
 async open(){await this.page.goto('/',{waitUntil:'domcontentloaded'});}
 async search(term:string){
  const results=/\/tienda(\/N-[^?]+)?\?s=/i;
  const input=this.page.getByPlaceholder(/Buscar por producto/i).first();
  await expect(input,'Buscador Liverpool').toBeVisible();
  await input.click();
  for(let attempt=0;attempt<3;attempt++){
   await input.fill(term);
   await expect(input).toHaveValue(term);
   await input.press('Enter');
   try{await this.page.waitForURL(results,{timeout:10000});return;}catch{ await this.page.waitForTimeout(1000); }
  }
  await this.page.waitForURL(results,{timeout:15000});
 }
 async filterWhite(){
  const checkbox=this.page.getByRole('checkbox',{name:/^blanco/i}).first();
  await expect(checkbox,'Filtro color Blanco').toBeAttached();
  const label=this.page.locator('label',{has:checkbox}).first();
  const applied=this.page.waitForURL(/\/tienda\/N-/,{timeout:20000}).catch(()=>null);
  await label.scrollIntoViewIfNeeded();
  await label.click();
  await applied;
  await expect(this.page,'Filtro aplicado').toHaveURL(/\/tienda\/N-/);
 }
 async sortLowToHigh(){
  await this.page.locator('[data-testid="dropdown-sorting-button"]').click();
  const sorted=this.page.waitForResponse(r=>/\/api\/plp\/search/.test(r.url()),{timeout:15000}).catch(()=>null);
  await this.page.getByText(/^menor precio$/i).click();
  await sorted;
 }
  async waitForResults(){await expect(this.cards.first(),'Tarjetas de resultados').toBeVisible();}
  async firstFive():Promise<Product[]>{
   await this.waitForResults();
  await expect.poll(()=>this.cards.count()).toBeGreaterThanOrEqual(5);
  const raw=await this.cards.evaluateAll((cards)=>cards.slice(0,5).map((card)=>{
   const name=card.querySelector('h3')?.textContent?.trim()??'';
   const priceText=card.querySelector('[data-testid$="-price"]')?.textContent??'';
   const id=(card.getAttribute('data-testid')??'').replace('-card','');
   return {name,priceText,id};
  }));
  return raw.map(({name,priceText,id})=>{
   const price=parsePrice(priceText);expect(name,'Nombre de producto').not.toBe('');expect(Number.isFinite(price),`Precio no numérico: ${priceText}`).toBeTruthy();
   return {name,price,id};
  });
 }
}
