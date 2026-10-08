import type {Response} from '@playwright/test';
import {parsePrice,type Product} from '../utils/products';
/** Schema adapter: only accepts recognized product arrays, not arbitrary JSON objects. */
export function extractProducts(payload:unknown):Product[]{
 const root=payload as any;
 const paths=[root?.products,root?.results,root?.items,root?.data?.products,root?.data?.results,
  root?.data?.search?.products,root?.searchResult?.products,root?.productList,
  root?.response?.products,root?.contents?.[0]?.mainContent?.[0]?.records];
 const list=paths.find(Array.isArray);
 if(!list)throw new Error('JSON de productos no reconocido: inspeccionar respuesta real y actualizar el adaptador');
 return list.map((raw:any)=>{
  const item=raw?.product??raw;const name=String(item?.productName??item?.name??item?.displayName??item?.title??'').trim();
  const value=item?.salePrice??item?.sellingPrice??item?.price?.value??item?.price?.amount??item?.price??item?.listPrice;
  const price=parsePrice(typeof value==='string'||typeof value==='number'?value:'');
  return {name,price,id:String(item?.productId??item?.sku??item?.id??'')};
 }).filter((v:Product)=>Boolean(v.name)&&Number.isFinite(v.price));
}
export async function findSearchProducts(responses:Response[]):Promise<{products:Product[];url:string}>{
 for(const response of [...responses].reverse()){
  try{if(!response.ok())continue;const products=extractProducts(await response.json());if(products.length>=5)return {products,url:response.url()};}catch{ /* unrelated JSON response */ }
 }throw new Error(`No se encontró respuesta de catálogo reconocible. Candidatas: ${responses.map(r=>r.url()).join(' | ')}`);
}
