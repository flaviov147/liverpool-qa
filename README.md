# Liverpool QA Automation — Playwright + TypeScript

Reto técnico: búsqueda `playstation 5` → color blanco → precio menor a mayor → primeros 5 productos → validación contra respuesta de red (mínimo 3 coincidencias exactas de nombre normalizado y precio ±0.01).

## Requisitos e instalación

Node.js 22+, npm, conexión a Liverpool y Chromium de Playwright.

```bash
npm install
npx playwright install chromium
npm run typecheck
npm run test:unit
npm test
```

Modo visible: `npm run test:headed`. Reporte: `npm run report`. Búsqueda parametrizada: `SEARCH_TERM='nintendo switch' npm test` (macOS/Linux), `$env:SEARCH_TERM='nintendo switch'; npm test` (PowerShell). En Windows CMD: `set SEARCH_TERM=nintendo switch && npm test`.

## Arquitectura

- `src/pages/search.page.ts`: POM y selectores UI.
- `src/services/search-response.ts`: adaptador de respuesta de catálogo y captura de respuestas de red.
- `src/utils/products.ts`: normalización, parseo MXN y comparación.
- `tests/search.spec.ts`: orquestación E2E y evidencia adjunta.
- `tests/unit`: pruebas aisladas de las funciones críticas.
- `.github/workflows/test.yml`: typecheck, unitarias, E2E headless y artefactos HTML.

## Reportes

`playwright-report/` contiene HTML; `test-results/` conserva capturas, trazas y videos de fallos; la prueba adjunta `ui-api-comparison.json`. La captura se configura automáticamente mediante `screenshot: 'only-on-failure'`.

## Estado real y consideraciones

**Este repositorio es una implementación entregable de código, NO una ejecución verde certificada.** Los selectores son candidatos porque no se ha inspeccionado el DOM actual de Liverpool desde un navegador funcional. También debe verificarse la ruta y estructura JSON del servicio real; los sitios pueden variar por región, sesión o anti-bot. El flujo no se considera validado hasta ejecutar `npm test` contra el sitio y ajustar el POM/adaptador. No se ha publicado repositorio ni enviado correo.

Para entregar: inspeccionar DOM/XHR en DevTools, ajustar selectores/esquema, ejecutar localmente, publicar en GitHub, verificar Actions verde e insertar el enlace a la ejecución aquí.

**GitHub Actions:** `https://github.com/USUARIO/REPOSITORIO/actions` (reemplazar tras publicar).
