import {test,expect} from '@playwright/test';
import {parsePrice,compareProducts,normalizeName} from '../../src/utils/products';
import {extractProducts} from '../../src/services/search-response';
test('@unit parseo de precios MXN',()=>{expect(parsePrice('$12,499.00')).toBe(12499);expect(parsePrice('1.299,50')).toBe(1299.5);expect(parsePrice('$314.30$449.00')).toBe(314.3);});
test('@unit comparación detecta diferencias',()=>{const ui=[{name:'PlayStation 5',price:100},{name:'Control blanco',price:50}];const api=[{name:'playstation 5',price:100},{name:'Control blanco',price:60}];const result=compareProducts(ui,api);expect(result.matches).toBe(1);expect(result.discrepancies).toHaveLength(1);expect(normalizeName('Blánco')).toBe('blanco');});
test('@unit extrae esquema de servicio',()=>{expect(extractProducts({data:{records:[{productId:'1',title:'PS5',priceInfo:{salePrice:9999}}]}})).toEqual([{name:'PS5',price:9999,id:'1'}]);});
