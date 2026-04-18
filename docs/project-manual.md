# NEURO — Manual completo del proyecto

**Formato:** Markdown (`.md`). Para **PDF**: abre este archivo en GitHub o en un visor Markdown y usa **Imprimir → Guardar como PDF**, o instala [Pandoc](https://pandoc.org) y ejecuta  
`pandoc docs/project-manual.md -o NEURO-manual.pdf`.

**Rama de referencia:** `main` (GitHub: `venezuela412/NEURO`).  
**Última revisión documental:** coherente con el estado del repositorio a fecha de consolidación del manual (incluye control plane admin, fixes React #185, Buffer polyfills, landing minimal).

---

## Tabla de contenidos

1. [Visión del producto](#1-visión-del-producto)  
2. [Monorepo y paquetes](#2-monorepo-y-paquetes)  
3. [Stack y versiones](#3-stack-y-versiones)  
4. [Miniapp: arquitectura y rutas](#4-miniapp-arquitectura-y-rutas)  
5. [Estado global y persistencia cliente](#5-estado-global-y-persistencia-cliente)  
6. [Control plane: API y datos](#6-control-plane-api-y-datos)  
7. [Motor de planes y fees](#7-motor-de-planes-y-fees)  
8. [Integraciones TON](#8-integraciones-ton)  
9. [Seguridad](#9-seguridad)  
10. [Variables de entorno](#10-variables-de-entorno)  
11. [Scripts y comandos](#11-scripts-y-comandos)  
12. [Despliegue](#12-despliegue)  
13. [Operación y administración](#13-operación-y-administración)  
14. [Problemas conocidos resueltos](#14-problemas-conocidos-resueltos)  
15. [Limitaciones actuales](#15-limitaciones-actuales)  
16. [Roadmap técnico sugerido](#16-roadmap-técnico-sugerido)  
17. [Mapa de documentación](#17-mapa-de-documentación)

---

## 1. Visión del producto

**NEURO** es una aplicación **Telegram-first** (Mini App) y **web** para que personas **sin conocimiento profundo de DeFi** pongan su **TON** a trabajar mediante **planes de ingreso** en lenguaje simple: *Protect*, *Earn*, *Grow*.

- **No** es un dashboard de trading ni un “hedge fund con IA”.
- El **motor de recomendación** es **determinista** (`@neuro/domain`): reglas explícitas, sin LLM en el núcleo.
- **Fondos:** arquitectura orientada a **control por el usuario** (wallet + firmas); no hay un gran contrato custodial en el MVP.
- **Fees (MVP):** el producto muestra **estimaciones** de comisión sobre beneficio (`estimatedFeeTon`, `calculateFeePreview`). **No** existe en este repositorio la **transferencia automática** de comisiones a una tesorería NEURO on-chain; eso sería una fase posterior (contrato, facturación, etc.).

---

## 2. Monorepo y paquetes

**Gestor:** `pnpm@10.33.0` (`pnpm-workspace.yaml`: `apps/*`, `packages/*`).

| Ruta | Nombre | Rol |
|------|--------|-----|
| `apps/miniapp` | `@neuro/miniapp` | Frontend Vite + React + TonConnect + Telegram + UI |
| `apps/control-plane` | `@neuro/control-plane` | API Fastify: preview, persistencia, sesiones, reconciliación |
| `packages/shared` | `@neuro/shared` | Tipos, constantes y contratos de datos compartidos |
| `packages/domain` | `@neuro/domain` | Motor de planes, fee preview, snapshots de portfolio |
| `packages/adapters` | `@neuro/adapters` | Tonstakers, overview, STON/Omniston (quotes), mocks |
| `packages/contracts` | `@neuro/contracts` | Reservado para contratos TON delgados (sin flujo productivo documentado como obligatorio) |

**TypeScript:** configuración base estricta en `tsconfig.base.json`; los consumidores incluyen fuentes de `packages/*/src` según sus `tsconfig`.

---

## 3. Stack y versiones

### 3.1 Miniapp (`apps/miniapp/package.json`)

- **React** `^19.2.4`, **React DOM** `^19.2.4`
- **React Router** `^7.9.5`
- **Vite** `^8.0.4`, **@vitejs/plugin-react** `^6.0.1`
- **TypeScript** `^6.0.2`
- **Tailwind CSS** `^4.1.14`, **@tailwindcss/vite** `^4.1.14`
- **Zustand** `^5.0.8` (+ `persist` en store)
- **TanStack React Query** `^5.90.2`
- **Framer Motion** `^12.23.24`
- **Lucide React** `^0.554.0`, **clsx** `^2.1.1`
- **@tonconnect/ui-react** `^2.4.2`
- **@telegram-apps/sdk-react** `^3.3.9`
- **@ton/core** `^0.63.1`
- **tonstakers-sdk** `0.0.19-development`
- **@ston-fi/omniston-sdk-react** `^0.7.12`
- **vite-plugin-node-polyfills** `^0.26.0` (Buffer/global/process en navegador)
- **vite-tsconfig-paths** `^5.1.4`
- **ESLint** 9 + **typescript-eslint** 8

### 3.2 Control plane (`apps/control-plane/package.json`)

- **fastify** `^5.6.1`
- **@fastify/cors** `^11.2.0`
- **@fastify/rate-limit** `^10.3.0`
- **zod** `^4.3.6`
- **@electric-sql/pglite** `^0.4.4` (modo embebido si no hay `DATABASE_URL`)
- **pg** `^8.20.0` (Postgres si hay `DATABASE_URL`)
- **@ton/core**, **@ton/ton**, **@ton/crypto**, **tweetnacl**, **crc-32** (verificación / reconciliación)
- **tsx** para ejecutar TypeScript en `start` / `dev`

### 3.3 Dominio y adapters

- **domain** y **shared** dependen principalmente de TypeScript y `@neuro/shared`.
- **adapters** incluye `@ton/core`, **tonstakers-sdk**, **@tonconnect/ui** (para integración Tonstakers).

**Node recomendado:** 22+.

---

## 4. Miniapp: arquitectura y rutas

### 4.1 Puntos de entrada

- `index.html` → `src/main.tsx` → `RootErrorBoundary` → `App` → `RouterProvider` + `appRouter`.
- `src/app/providers.tsx`: `TonConnectUIProvider`, `QueryClientProvider`, `TelegramBridge`, `PortfolioSyncBridge`, rutas hijas.
- **Manifest TonConnect:** generado en build por `scripts/generate-tonconnect-manifest.mjs` usando `VITE_APP_URL` (fallback localhost en desarrollo).

### 4.2 Rutas (`src/app/router.tsx`)

Layout: `AppShell` + `Outlet`. Rutas **lazy** (code splitting).

| Ruta | Componente (lazy) | Descripción breve |
|------|-------------------|-------------------|
| `/` | `LandingScreen` | Pantalla mínima: tagline, una línea, **Start** → `/plans`, enlace **New to TON?** |
| `/onboarding` | `WalletOnboardingScreen` | Guía de wallets y pasos |
| `/plans` | `PlanSelectorRoute` | Selector de cantidad, goal, riesgo, flexibilidad; preview; contexto STON en rutas que lo montan |
| `/result` | `PlanResultRoute` | Resultado del plan, riesgo, fee, ejecución |
| `/active` | `ActivePlanScreen` | Plan activo, receipts, reconciliación, acciones |
| `/activity` | `ActivityScreen` | Feed de `portfolio.activity` |
| `*` | `NotFoundScreen` | 404 |

**Error de rutas:** `errorElement` → `RouterErrorPage` (mensaje corto, enlace a inicio).

### 4.3 Layout (`src/components/layout/AppShell.tsx`)

- Cabecera: marca **NEURO**, subtítulo según ruta (en `/` se omiten detalles extra de plataforma), **TonConnectButton**, pill de nombre de wallet si conectado.
- Navegación inferior fija: Home, Build, Plan, Activity.
- **Nota UX:** existe icono de “alertas” (campana) sin lógica de producto conectada en el MVP.

### 4.4 Estilos

- `src/index.css`: tema oscuro, cards, grids, sticky bar, bottom nav.
- Ajustes importantes: `.section-intro` en **columna** por defecto (evita solapamiento); `.split-card` apilado en móvil; utilidades landing minimal (`.landing-minimal*`).

### 4.5 Hooks y puentes relevantes

- `PortfolioSyncBridge`: sincroniza store ↔ control plane; persistencia firmada; **serialización estable** (sin `updatedAt` en el JSON de igualdad) para evitar bucles.
- `useWalletActionAuth`: `signAction` / `ensureSession` con **`useCallback`** (evita re-ejecución infinita de efectos).
- `usePlanExecution`: Tonstakers `stake` para `safe-income`; `signData` para otros planes (aprobación textual, no swap STON completo).
- `useStonQuote`, `useTonstakers`, `useNeuroOverview`, `usePlanPreview`, `usePortfolioActions`, `useExecutionReconciliation`.

### 4.6 Cliente HTTP (`src/lib/controlPlane.ts`)

Base URL: `import.meta.env.VITE_CONTROL_PLANE_URL` o `http://localhost:8787`.

Incluye fallbacks locales cuando el control plane no responde (p. ej. overview / preview).

---

## 5. Estado global y persistencia cliente

- **Zustand** `useAppStore` en `src/store/appStore.ts` con **`persist`** (`localStorage`, clave `neuro-app-store`).
- Campos típicos: `amountTon`, `goal`, `riskPreference`, `wantsFlexibility`, `recommendation`, `feePreview`, `portfolio`, `executionStatus`, `executionReceipt`, `isPortfolioHydrating`, etc.
- **Activity:** en `ActivityScreen`, el selector usa un array vacío **constante** (`EMPTY_ACTIVITY`), no `?? []` literal (evita React error #185 por referencia nueva cada render).

---

## 6. Control plane: API y datos

### 6.1 Servidor

- `apps/control-plane/src/index.ts`: Fastify, **CORS** (`origin: true` en MVP), **rate limit** global.
- Body limit configurado; validación **zod** en rutas mutantes.

### 6.2 Esquema de base de datos (`src/db.ts`)

| Tabla | Uso |
|-------|-----|
| `portfolio_state` | `wallet_address` PK, `state_json`, `updated_at` — estado `PersistedPortfolioState` |
| `execution_receipts` | Receipts por wallet |
| `used_signed_nonces` | Anti-replay por wallet + nonce |
| `wallet_action_sessions` | Tokens de sesión de corta duración |

**Modos:** sin `DATABASE_URL` → **PGlite** en disco (`NEURO_DB_PATH` o `.neuro-db` bajo cwd). Con `DATABASE_URL` → **PostgreSQL** vía `pg`.

### 6.3 Catálogo de rutas HTTP (referencia)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/overview` | Datos de “overview” para copy/config |
| GET | `/portfolio/demo` | Portfolio mock (query `amount`) |
| POST | `/plan/preview` | Preview de plan con Zod |
| GET | `/portfolio/:walletAddress/state` | GET estado o 404 |
| PUT | `/portfolio/:walletAddress/state` | PUT estado firmado + nonce |
| GET | `/portfolio/:walletAddress/executions` | Lista de receipts |
| POST | `/portfolio/:walletAddress/executions/:executionId/reconcile` | Reconciliación on-chain |
| POST | `/portfolio/:walletAddress/switch-to-safety` | Acción con sesión o proof |
| POST | `/portfolio/:walletAddress/withdraw` | Idem |
| POST | `/auth/session` | (según versión; ver `index.ts` para rutas de sesión exactas) |
| GET | `/admin/summary` | Resumen JSON si `NEURO_ADMIN_TOKEN` está configurado y coincide en header o Bearer |

### 6.4 Repositorio y reconciliación

- `src/repository.ts`: CRUD de estado, receipts, nonces, sesiones; operaciones de negocio `applySwitchToSafety`, `applyWithdraw`, `reconcilePersistedExecution`, etc.
- `src/reconciliation.ts`: búsqueda en cadena con `TonClient`, normalización de hash (TEP-467), reintentos.
- `src/security.ts`: verificación de firmas TonConnect / payload textual.

---

## 7. Motor de planes y fees

**Ubicación:** `packages/domain/src/index.ts` (y exportaciones relacionadas).

- **`PLAN_LIBRARY`:** definiciones de planes (título, riesgo, rangos **anuales orientativos** fijos por tipo de plan, textos de comportamiento interno y fallback).
- **`recommendPlan`:** entrada `PlanRecommendationInput` (cantidad, goal, riesgo, flexibilidad, `routeQualityScore`, `safePathAvailable`, `hasActivePlan`, etc.) → salida `PlanRecommendation` con razones legibles.
- **`FEE_RATES`:** tasas por `PlanId` (ej. growth con comisión de plataforma mayor en el modelo; safe puede ser 0 en la tabla actual).
- **`calculateFeePreview`:** estimación de fee sobre beneficio según reglas del dominio (MVP; no liquidación).
- **`buildPortfolioSnapshot`:** construye `PortfolioSnapshot` con métricas e **historial de actividad** (`ActivityEvent[]`).

**Importante para negocio/legal:** los porcentajes anuales mostrados son **rangos de producto / modelo**, no garantías de rendimiento ni APY on-chain auditado en tiempo real.

---

## 8. Integraciones TON

| Integración | Nivel actual |
|-------------|----------------|
| **TON Connect UI** | Completo para conectar wallet y firmar (`sendTransaction` / `signData` según flujo) |
| **Tonstakers** | Lectura de pool + **staking (`stake`)** para plan **Safe Income** vía adapter en `packages/adapters` y `usePlanExecution` |
| **STON.fi / Omniston** | **Cotización / señal de ruta** (`useStonQuote`, SDK React); **no** hay pipeline completo de construcción de mensajes DEX + broadcast + settle para planes Balanced/Growth como en un DEX productivo |
| **Telegram** | Detección y bridge básico (`TelegramBridge`, `useTelegramEnv`); la app también corre en navegador |

---

## 9. Seguridad

- **Mutaciones:** `SignedActionProof` con `action`, `nonce`, payload textual firmado; verificación en servidor (`security.ts`).
- **Replay:** tabla `used_signed_nonces`.
- **Sesiones:** `wallet_action_sessions` para reducir fatiga de firma (`X-Neuro-Session-Token` en headers donde aplique).
- **Dominios firmados:** `ALLOWED_SIGN_DOMAINS` (lista de hosts **sin** esquema) debe incluir el host del frontend en producción (ej. `neuroton-lime.vercel.app`).
- **Rate limiting:** Fastify plugin global.
- **Admin:** `GET /admin/summary` protegido por `NEURO_ADMIN_TOKEN` (503 si no está configurado, 403 si token incorrecto).

**Pendiente de endurecimiento típico en prod:** CORS restrictivo, CSP en static host, métricas y alertas, rotación de secretos.

---

## 10. Variables de entorno

### 10.1 Miniapp (build-time `VITE_*`)

Definir en Vercel (o `.env` local):

| Variable | Rol |
|----------|-----|
| `VITE_APP_URL` | Origen público HTTPS del miniapp; usado al generar `tonconnect-manifest.json` en build |
| `VITE_CONTROL_PLANE_URL` | URL base del API (sin `/` final). Si falta, el bundle usa `http://localhost:8787` |
| `VITE_TON_NETWORK` | `mainnet` o `testnet` |
| `VITE_TELEGRAM_BOT_USERNAME` | Opcional; username del bot sin `@` |
| `VITE_TONSTAKERS_PARTNER_CODE` | Opcional; numérico si aplica |
| `VITE_TONAPI_KEY` | Opcional; TonAPI |
| `VITE_STONFI_API_URL` | Opcional |

### 10.2 Control plane (runtime)

| Variable | Rol |
|----------|-----|
| `PORT` | Puerto HTTP (default 8787) |
| `DATABASE_URL` | Si existe → Postgres; si no → PGlite en disco |
| `DATABASE_SSL` | `require` si el proveedor Postgres exige SSL relajado |
| `NEURO_DB_PATH` | Ruta de datos PGlite si aplica |
| `TON_RPC_ENDPOINT` | RPC HTTP para reconciliación / TonClient |
| `ALLOWED_SIGN_DOMAINS` | Hosts permitidos en firmas (coma-separados) |
| `NEURO_ADMIN_TOKEN` | Secreto para `GET /admin/summary` |

Ver también `.env.example` en la raíz.

---

## 11. Scripts y comandos

En la **raíz** (`package.json`):

| Script | Acción |
|--------|--------|
| `pnpm dev` | Miniapp Vite dev server |
| `pnpm dev:miniapp` | Igual |
| `pnpm dev:control-plane` | Control plane con `tsx watch` |
| `pnpm build` | Build miniapp |
| `pnpm build:control-plane` | `tsc` control plane |
| `pnpm lint` | Lint miniapp |
| `pnpm check` | `build` + `build:control-plane` + `lint` |
| `pnpm start:control-plane` | Arranque producción local del API |
| `pnpm preview:miniapp` | Preview estático miniapp |
| `pnpm deploy:test` | `docker compose up --build` (entorno depende de máquina) |

**Manifest:** `pnpm --filter @neuro/miniapp build` ejecuta `build:manifest` antes de `vite build`.

---

## 12. Despliegue

### 12.1 Miniapp (Vercel)

- `vercel.json` en raíz: install `pnpm`, build del workspace miniapp, output `apps/miniapp/dist`, rewrites SPA.
- Tras cada cambio de `VITE_*`: **Redeploy** en Vercel.

### 12.2 Control plane (Railway / Render / Docker)

- Dockerfile: `apps/control-plane/Dockerfile`.
- Variables: ver sección 10.2 y **`docs/deployment.md`** (incluye paso a paso Railway y notas Postgres).

### 12.3 Docker Compose

- `docker-compose.yml` en raíz para stack local (miniapp nginx + control plane + opcional postgres). En algunos entornos Compose v2 no está disponible; ver notas en `docs/deployment.md`.

---

## 13. Operación y administración

### 13.1 Health

```http
GET https://<API_HOST>/health
```

### 13.2 Resumen operativo (JSON)

```http
GET https://<API_HOST>/admin/summary
X-Neuro-Admin-Token: <NEURO_ADMIN_TOKEN>
```

o `Authorization: Bearer <NEURO_ADMIN_TOKEN>`.

Respuesta incluye conteos y listas resumidas de `portfolio_state` y `execution_receipts`. El campo `note` en la respuesta aclara que los fees son **estimaciones MVP**.

### 13.3 “Usuarios”

No hay tabla `users`. El identificador operativo es **`wallet_address`**. Para analítica humana hace falta producto/CRM aparte si se desea.

---

## 14. Problemas conocidos resueltos

- **`Buffer is not defined` en producción:** resuelto con `vite-plugin-node-polyfills` y `define.global` en Vite.
- **React minified error #185 (maximum update depth):**
  - `PortfolioSyncBridge`: no incluir timestamp variable en la igualdad de estado serializado; timestamp solo al persistir payload.
  - `useWalletActionAuth`: funciones memoizadas con `useCallback`.
  - `ActivityScreen`: no usar `?? []` en selector Zustand; usar constante `EMPTY_ACTIVITY`.
- **Solapamiento de texto en layouts:** corrección de `.section-intro` y `.split-card`.
- **Pantalla de error de React Router:** `RouterErrorPage` + `errorElement`.

---

## 15. Limitaciones actuales

- **Fees:** estimación en UI/estado; **sin** cobro on-chain automático a tesorería NEURO.
- **STON:** cotización / señal; **sin** ejecución DEX completa para planes no-safe en el sentido de “swap producido y rastreado como producto maduro”.
- **Rebalanceo automático real:** no implementado como worker confiable + políticas on-chain/off-chain cerradas.
- **Contratos propios:** no hay despliegue/ flujo de usuario con contrato NEURO auditado.
- **CORS:** permisivo (`origin: true`).
- **Tests automatizados:** asumir cobertura limitada salvo que el repo añada suites explícitas después de este manual.
- **`docs/repo-status.md`:** puede quedar desfasado en metadatos de rama; el código en **`main`** prevalece.

---

## 16. Roadmap técnico sugerido

1. **Producción mínima:** Postgres obligatorio, CORS restrictivo, secretos rotados, métricas `/health` extendido.
2. **STON execution path:** un solo flujo end-to-end (quote → mensajes → firma → broadcast → indexer).
3. **Tonstakers:** confirmación/indexación rica y manejo de errores de usuario (slippage de staking, etc. si aplica).
4. **Fees:** diseño de settlement (pull contract, pago en withdraw firmado, o modelo legal off-chain) + tablas contables.
5. **Policy wallet / smart account** (si el producto lo valida) para automatización acotada.
6. **Admin UI** interna o BI (Metabase) sobre Postgres.
7. **Tests:** Vitest en `domain`; Playwright smoke en testnet.

---

## 17. Mapa de documentación

| Archivo | Contenido |
|---------|-----------|
| `README.md` | Visión general, setup, arquitectura resumida |
| `docs/architecture.md` | Límites entre capas |
| `docs/deployment.md` | Vercel, Railway, env, admin, fees, CORS |
| `docs/telegram-mini-app.md` | BotFather, URL HTTPS, variables |
| `docs/judge-qa.md` | Q&A para jurados |
| `docs/demo-script.md` | Guión de demo |
| `docs/launch-copy.md` | Copy marketing |
| `docs/repo-status.md` | Estado del repo (verificar fecha/rama) |
| **`docs/project-manual.md`** | **Este manual integral** |
| `.env.example` | Lista de variables ejemplo |

---

## Licencia y contribución

El repositorio es privado/público según configuración del dueño en GitHub. Para contribuir, otra IA o desarrollador debe seguir **`pnpm check`** antes de merge y respetar las convenciones TypeScript del monorepo.

---

*Fin del manual.*
