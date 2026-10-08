import {expect,type Page,type Locator} from '@playwright/test';
import {parsePrice,type Product} from '../utils/products';
/** Isolates Liverpool's volatile DOM. Selectors verified against the live PLP (Oct 2026). */
export class SearchPage{
 constructor(private readonly page:Page){}
 private get cards():Locator{return this.page.locator('section[data-testid$="-card"]');}
 async open(){await this.page.goto('/',{waitUntil:'domcontentloaded'});}
 async search(term:string){
  const input=this.page.getByPlaceholder(/Buscar por producto/i).first();
  await expect(input,'Buscador Liverpool').toBeVisible();await input.fill(term);await input.press('Enter');
  await expect(this.page,'Resultados de búsqueda').toHaveURL(/\/tienda(\/N-[^?]+)?\?s=/i);
 }
 async filterWhite(){
  const option=this.page.getByRole('checkbox',{name:/^blanco/i}).first();
  await expect(option,'Filtro color Blanco').toBeVisible();
  await option.click({force:true});
  await expect(this.page,'Filtro aplicado').toHaveURL(/\/tienda\/N-/);
 }
 async sortLowToHigh(){
  await this.page.locator('[data-testid="dropdown-sorting-button"]').click();
  const sorted=this.page.waitForResponse(r=>/\/api\/plp\/search/.test(r.url()),{timeout:15000}).catch(()=>null);
  await this.page.getByText(/^menor precio$/i).click();
  await sorted;
 }
 async firstFive():Promise<Product[]>{
  await expect(this.cards.first(),'Tarjetas de resultados').toBeVisible();
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
