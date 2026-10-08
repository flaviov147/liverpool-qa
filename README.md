# Liverpool QA Automation — Playwright + TypeScript

![CI](https://github.com/flaviov147/liverpool-qa/actions/workflows/test.yml/badge.svg)

Reto técnico: búsqueda `playstation 5` → color blanco → precio menor a mayor → primeros 5 productos → validación contra respuesta de red (mínimo 3 coincidencias exactas de nombre normalizado y precio ±0.01).

## Requisitos e instalación

Node.js 22+, npm, conexión a Liverpool y los navegadores de Playwright.

```bash
npm install
npx playwright install chromium firefox webkit
npm run typecheck
npm run test:unit        # unitarias
npm test                 # E2E headless en chromium + firefox + webkit (secuencial)
npm run test:chromium    # E2E solo en chromium
npm run test:visual      # regresión visual (baseline local)
npm run test:all         # unitarias + E2E + visual
npm run report           # abre el reporte HTML
```

Modo visible: `npm run test:headed`. Búsqueda parametrizada: `SEARCH_TERM='nintendo switch' npm test` (macOS/Linux), `$env:SEARCH_TERM='nintendo switch'; npm test` (PowerShell). Presupuesto de carga de resultados: `LOAD_BUDGET_MS=30000 npm test`. Paralelismo (por defecto 1 para no disparar el anti-bot): `WORKERS=3 npm test`.

## Arquitectura

- `src/pages/search.page.ts`: POM y selectores UI.
- `src/services/search-response.ts`: adaptador de respuesta de catálogo y captura de respuestas de red.
- `src/utils/products.ts`: normalización, parseo MXN y comparación.
- `tests/search.spec.ts`: orquestación E2E (búsqueda, filtro, orden, extracción UI, validación UI/API, accesibilidad y rendimiento) y evidencia adjunta.
- `tests/search.visual.spec.ts`: regresión visual (`@visual`), local con snapshot con máscaras de precio/imágenes y `maxDiffPixelRatio`.
- `tests/unit`: pruebas aisladas de las funciones críticas.
- `playwright.config.ts`: `channel: 'chromium'`, `locale: 'es-MX'` y proyectos `chromium`, `firefox`, `webkit`, `visual` y `unit`.
- `.github/workflows/test.yml`: typecheck, unitarias, E2E en los tres navegadores y artefactos HTML.

Además del E2E, la prueba incluye:
- **Accesibilidad** con `@axe-core/playwright` (etiquetas WCAG 2 A/AA): adjunta `axe-violations.json` y registra las violaciones. Es **informativa**, no bloqueante: las 3 violaciones actuales (`button-name`, `color-contrast`, `label`) pertenecen al sitio de Liverpool, no a la automatización.
- **Rendimiento**: asevera que la página de resultados queda lista bajo `LOAD_BUDGET_MS` (45 s por defecto).

## Reportes

`playwright-report/` contiene HTML; `test-results/` conserva capturas, trazas y videos de fallos; la prueba adjunta `ui-api-comparison.json`. La captura se configura automáticamente mediante `screenshot: 'only-on-failure'`.

## Estado real y consideraciones

Estado: **probado en local en modo headless** — E2E `3/3` (5/5 coincidencias UI/API en chromium, firefox y webkit), unitarias `3/3` y visual `1/1`.

Los selectores y el esquema del servicio fueron verificados contra el sitio real (oct. 2026):

- Endpoint de resultados interceptado: `POST https://www.liverpool.com.mx/api/plp/search` (`data.records`).
- Tarjeta de producto: `section[data-testid$="-card"]`; nombre `h3`; precio `[data-testid$="-price"]`; filtro color `checkbox "Blanco (76)"`; orden `[data-testid="dropdown-sorting-button"]` → «Menor precio».

**Nota de anti-bot (Akamai):** Liverpool devuelve `403 Access Denied` al headless clásico de Playwright (headless shell). Por eso `playwright.config.ts` usa `channel: 'chromium'` (nuevo modo headless), que sí carga el sitio. El anti-bot también penaliza la concurrencia: los tres navegadores se ejecutan **en secuencia** (`workers: 1` por defecto) para mantener la fiabilidad; con `WORKERS=3` se paralelizan bajo tu responsabilidad. Si el sitio cambia o bloquea IP de datacenter, ajusta el POM/adaptador o apunta a un entorno QA autorizado.

**GitHub Actions:** `https://github.com/flaviov147/liverpool-qa/actions`. En CI, `typecheck` y las unitarias bloquean; el E2E en vivo es **informativo** (`continue-on-error`), porque los runners de GitHub usan IPs de datacenter que Akamai bloquea. La validación E2E real se ejecuta en local.
