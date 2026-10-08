import type {Response} from '@playwright/test';
import {parsePrice,type Product} from '../utils/products';
/** Liverpool PLP search endpoint; products live in `data.records`. */
export const SEARCH_ENDPOINT=/\/api\/plp\/search(\?|$)/i;
/** Schema adapter: only accepts recognized product arrays, not arbitrary JSON objects. */
export function extractProducts(payload:unknown):Product[]{
 const root=payload as any;
 const paths=[root?.data?.records,root?.records,root?.data?.products,root?.products,
  root?.results,root?.items,root?.data?.results];
 const list=paths.find(Array.isArray);
 if(!list)throw new Error('JSON de productos no reconocido: inspeccionar respuesta real y actualizar el adaptador');
 return list.map((item:any)=>{
  const name=String(item?.title??item?.productName??item?.name??item?.displayName??'').trim();
  const value=item?.priceInfo?.salePrice??item?.priceInfo?.promoPrice?.price??item?.priceInfo?.listPrice?.price??item?.salePrice??item?.price;
  const price=parsePrice(typeof value==='string'||typeof value==='number'?value:'');
  return {name,price,id:String(item?.productId??item?.sku??item?.id??'')};
 }).filter((v:Product)=>Boolean(v.name)&&Number.isFinite(v.price));
}
export async function findSearchProducts(responses:Response[]):Promise<{products:Product[];url:string}>{
 for(const response of [...responses].reverse()){
  try{if(!response.ok())continue;const products=extractProducts(await response.json());if(products.length>=5)return {products,url:response.url()};}catch{ /* unrelated JSON response */ }
 }throw new Error(`No se encontró respuesta de catálogo reconocible. Candidatas: ${responses.map(r=>r.url()).join(' | ')}`);
}
