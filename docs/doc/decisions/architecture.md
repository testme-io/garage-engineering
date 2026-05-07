# StackMe — Architecture Decisions

> This document is the source of truth for all architectural decisions.
> Update it when a decision changes. Do not contradict it in code.

---

## Platform concept

StackMe is a plugin platform for engineering tools. The core (Auth, UI, DB layer) is stable and never changes. New tools (ForgeMe, AnalyzeMe, TestMe) are added as independent modules without rewriting the core.

**Core principle: the core does not know about modules. Modules know about the core. Never the other way around.**

---

## Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Monorepo | pnpm workspaces + Turbo | Single repo, CI cache, parallel dev |
| Frontend | Vite + React 19 + TypeScript | `apps/hub/` |
| Styling | Tailwind v4 + Shadcn/ui (Nova preset, Radix) | No inline styles |
| State | Zustand | `activeModules[]` only |
| Analytics | DuckDB-Wasm Singleton Worker | Client-side, no data sent to server |
| Backend | Python 3.12 + FastAPI + uv | `backend/` |
| Database | SQLite locally → PostgreSQL on Railway | See DB section |
| Auth | Clerk (Google OAuth) | JWT verified on backend |
| i18n | i18next + react-i18next | EN (default), ES, UK |
| Deploy Frontend | Vercel | `apps/hub/` |
| Deploy Backend | Railway | `backend/` |

---

## Frontend structure

```
apps/hub/src/
├── registry/          ← module registry (source of truth for modules)
│   ├── index.ts       → collects all manifests
│   └── forge-me.ts    → ForgeMe manifest
├── modules/           ← lazy-loaded module chunks
│   └── forge-me/
│       ├── index.tsx
│       ├── GenerateSection.tsx
│       ├── AnalyzeSection.tsx
│       ├── AnomalyTable.tsx
│       └── types.ts
├── layouts/
│   └── AppShell.tsx   → sidebar + theme + language + auth
├── pages/
│   └── MarketMe.tsx   → marketplace page
├── hooks/
│   └── useTheme.ts    → dark/light theme
├── shared/
│   └── analytics/     → DuckDB Singleton Worker
├── i18n/
│   ├── index.ts       → i18next config
│   └── locales/en|es|uk/common.json
└── api/
    └── client.ts      → axios base client
```

---

## Module manifest

Every tool is described by a `ModuleManifest`. This is the only place to change to add a new tool.

```typescript
interface ModuleManifest {
  id: string                    // 'forge-me'
  name: string                  // 'ForgeMe'
  description: string           // shown in MarketMe
  icon: string                  // lucide icon name
  route: string                 // '/forge-me'
  category: 'analytics' | 'testing' | 'generation'
  defaultForNewUsers: boolean   // auto-activate on registration
  component: LazyExoticComponent<ComponentType>
}
```

**Frontend = source of truth for module metadata (name, route, component). Backend stores only `user_id + module_id`. Never duplicate module metadata in DB.**

---

## How to add a new tool — 5 steps

1. Create `backend/services/<name>/` with `pyproject.toml` and `router.py`
2. Add `"services/<name>"` to `backend/pyproject.toml` uv workspace
3. Create `apps/hub/src/modules/<name>/index.tsx`
4. Create `apps/hub/src/registry/<name>.ts` with manifest
5. Import manifest in `apps/hub/src/registry/index.ts`

The hub core (router, sidebar, auth) is not touched.

---

## Backend structure

```
backend/
├── core/               ← stable core (never depends on services)
│   ├── main.py         → FastAPI app, connects service routers
│   ├── auth.py         → Clerk JWT verification via JWKS
│   ├── db.py           → SQLAlchemy session
│   ├── config.py       → DATABASE_URL with sqlite fallback
│   ├── models/
│   │   └── user_module.py
│   └── routers/
│       ├── users.py    → GET /api/me
│       └── modules.py  → GET /api/me/modules, POST /api/modules/activate
├── shared/             ← shared Python utilities
└── services/
    └── forge_me/       → isolated service
        ├── router.py
        ├── schemas.py
        └── anomaly_engine.py
```

Services connect to core via `try/except ImportError` — allows deploying without a service.

---

## Database rules

- **Local**: SQLite (`stackme.db`) — automatic fallback when no `DATABASE_URL` env var
- **Production**: PostgreSQL on Railway
- **Only simple types**: `String`, `Integer`, `Boolean`, `DateTime` — no JSONB
- Railway may return `postgres://` — always replace with `postgresql://` (handled in `config.py`)
- Migrations via Alembic — always review generated files before applying

---

## Auth model

- ForgeMe is open to all users (no login required)
- Sign in via modal (not redirect) — `SignInButton mode="modal"`
- MarketMe module activation requires login
- JWT verification on backend via Clerk JWKS endpoint
- Backend stores: `user_id` (Clerk `sub`) + `module_id` only

---

## DuckDB Singleton Worker

- One Worker instance per browser tab — initialized once, lives in memory
- Modules send SQL queries via `postMessage`, never initialize DuckDB themselves
- API: `loadJSON(data, tableName)`, `loadAnomalyIndex(indexes)`, `runQuery(sql)`
- Uses `VoidLogger` to suppress console noise

---

## i18n rules

- Default language: English
- Auto-detect from browser on first visit, saved to `localStorage`
- Supported: `en`, `es`, `uk`
- All UI text must go through `t('key')` — no hardcoded strings
- Translation keys live in `apps/hub/src/i18n/locales/<lang>/common.json`

---

## Code rules

- All UI and code in English only
- Always use full file paths when referencing files
- No cross-imports between modules (`modules/forge-me` cannot import from `modules/analyze-me`)
- No horizontal dependencies between backend services
- `shared/` only for code needed by 2+ modules
- Tests for every engine function: `uv run pytest`
- Git commit after every closed iteration

---

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Vercel / `.env` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Railway / `.env` | Clerk backend key |
| `DATABASE_URL` | Railway / `.env` | PostgreSQL URL (optional locally) |

Never commit `.env` files. Already in `.gitignore`.

---

## Deployment

| What | Where | Config |
|---|---|---|
| `apps/hub/` | Vercel | `vercel.json` in `apps/hub/` |
| `backend/` | Railway | `railway.toml` in `backend/` |
| PostgreSQL | Railway (managed) | `DATABASE_URL` in Railway env |
| SQLite | Local only | `stackme.db` in `backend/` (gitignored) |

---

*Update this document when architectural decisions change. Last updated: April 2026.*