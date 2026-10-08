export type Product={name:string;price:number;id?:string};
export function normalizeName(s:string):string{return s.toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
export function parsePrice(raw:string|number):number{
 if(typeof raw==='number')return raw;
 const s=raw.replace(/[^\d.,]/g,'');if(!s)return NaN;
 const decimal=s.lastIndexOf(',')>s.lastIndexOf('.')?',':'.';
 const n=decimal===','?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');return Number(n);
}
export function compareProducts(ui:Product[],api:Product[]){
 const discrepancies:string[]=[];let matches=0;const used=new Set<number>();
 for(const item of ui){const index=api.findIndex((p,i)=>!used.has(i)&&normalizeName(p.name)===normalizeName(item.name));
 if(index<0){discrepancies.push(`Ausente en API: ${item.name} ($${item.price})`);continue;}
 used.add(index);const found=api[index];if(Math.abs(found.price-item.price)>0.01){discrepancies.push(`Precio diferente: ${item.name}; UI=$${item.price}; API=$${found.price}`);continue;}matches++;
 }return {matches,discrepancies};
}
