# Liverpool QA Automation — Playwright + TypeScript

![CI](https://github.com/flaviov147/liverpool-qa/actions/workflows/test.yml/badge.svg)

Reto técnico: búsqueda `playstation 5` → color blanco → precio menor a mayor → primeros 5 productos → validación contra respuesta de red (mínimo 3 coincidencias exactas de nombre normalizado y precio ±0.01).

## Requisitos e instalación

Node.js 22+, npm, conexión a Liverpool y Chromium de Playwright.

```bash
npm install
npx playwright install chromium
npm run typecheck
npm run test:unit
npm test          # E2E headless (por defecto)
npm run test:headed   # E2E con navegador visible
npm run test:all      # unitarias + E2E
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

Estado: **probado en local en modo headless** — E2E `1/1` (5/5 coincidencias UI/API) y unitarias `3/3`.

Los selectores y el esquema del servicio fueron verificados contra el sitio real (oct. 2026):

- Endpoint de resultados interceptado: `POST https://www.liverpool.com.mx/api/plp/search` (`data.records`).
- Tarjeta de producto: `section[data-testid$="-card"]`; nombre `h3`; precio `[data-testid$="-price"]`; filtro color `checkbox "Blanco (76)"`; orden `[data-testid="dropdown-sorting-button"]` → «Menor precio».

**Nota de anti-bot (Akamai):** Liverpool devuelve `403 Access Denied` al headless clásico de Playwright (headless shell). Por eso `playwright.config.ts` usa `channel: 'chromium'` (nuevo modo headless), que sí carga el sitio. Si el sitio cambia o bloquea IP de datacenter, ajusta el POM/adaptador o apunta a un entorno QA autorizado.

**GitHub Actions:** `https://github.com/flaviov147/liverpool-qa/actions`
