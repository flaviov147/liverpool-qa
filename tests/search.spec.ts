import {test,expect,type Response} from '@playwright/test';
import {SearchPage} from '../src/pages/search.page';
import {findSearchProducts,SEARCH_ENDPOINT} from '../src/services/search-response';
import {compareProducts} from '../src/utils/products';
const term=process.env.SEARCH_TERM??'playstation 5';
test('Liverpool: búsqueda, color blanco, precio ascendente y validación UI/API',async({page},testInfo)=>{
 const search=new SearchPage(page);const responses:Response[]=[];
 page.on('response',response=>{if(SEARCH_ENDPOINT.test(response.url()))responses.push(response);});
 await test.step('Buscar producto',async()=>{await search.open();await search.search(term);});
 await test.step('Filtrar por blanco',async()=>{await search.filterWhite();});
 await test.step('Ordenar de menor a mayor',async()=>{await search.sortLowToHigh();});
 const ui=await test.step('Extraer cinco productos UI',()=>search.firstFive());console.table(ui);
 for(let i=1;i<ui.length;i++)expect(ui[i].price,`Orden de precio en posición ${i+1}`).toBeGreaterThanOrEqual(ui[i-1].price);
 const {products:api,url}=await test.step('Interpretar respuesta de red',()=>findSearchProducts(responses));
 const comparison=compareProducts(ui,api);console.log(`Servicio: ${url}; coincidencias: ${comparison.matches}/5`);
 comparison.discrepancies.forEach(d=>console.warn(`[DIFERENCIA] ${d}`));
 await testInfo.attach('ui-api-comparison.json',{body:JSON.stringify({term,url,ui,api:api.slice(0,10),comparison},null,2),contentType:'application/json'});
 expect(comparison.matches,comparison.discrepancies.join(' | ')).toBeGreaterThanOrEqual(3);
});
