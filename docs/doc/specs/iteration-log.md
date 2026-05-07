# StackMe — Iteration Log

> Single source of truth for what has been done and what is next.
> Update after every completed iteration.

---

## Status legend
- ✅ Done
- 🔄 In Progress
- ⏳ Not Started

---

## Completed

### Infrastructure
- ✅ **0** — Monorepo setup: pnpm workspaces + Turborepo, FastAPI + Vite connected, CORS, status bar

### Iteration 1 — ForgeMe Skeleton
- ✅ **1.1** — `backend/services/forge_me/` created, uv workspace configured
- ✅ **1.2** — ForgeMe router connected in `core/main.py` via try/except, `GET /forge-me/health` works
- ✅ **1.3** — `apps/hub/src/modules/forge-me/index.tsx` stub page, manifest in registry, route `/forge-me` works
- ✅ **1.4** — ForgeMe added to sidebar, click opens page

### Iteration 2 — First Endpoint
- ✅ **2.1** — Pydantic schemas: `GenerateRequest`, `GenerateResponse`, `AnomalyInfo`
- ✅ **2.2** — `POST /forge-me/generate` with hardcoded stub response
- ✅ **2.3** — Frontend form: textarea, format select, row count, anomaly rate inputs
- ✅ **2.4** — axios connected, full request→response cycle works, results displayed

### Iteration 3 — Anomaly Engine
- ✅ **3.1** — numpy + pandas added, `generate_clean_dataset()` with unit tests (5/5)
- ✅ **3.2** — `inject_anomalies()` with outliers, missing, duplicates + unit tests (10/10)
- ✅ **3.3** — Engine connected to `/generate` endpoint, real data returned
- ✅ **3.4** — CSV and SQL format support added, all 3 formats verified

### Iteration 4 — DuckDB Worker
- ✅ **4.1** — DuckDB-Wasm Singleton Worker created in `shared/analytics/`, initializes once
- ✅ **4.2** — JSON response loaded into DuckDB after generate
- ✅ **4.3** — Data displayed in HTML table from DuckDB, timestamp fixed
- ✅ **4.4** — Anomaly row/cell highlighting, SQL filter ("All rows" / "Anomalies only")

### Iteration 5 — Analyzer
- ✅ **5.1** — `POST /forge-me/analyze` endpoint, accepts CSV file
- ✅ **5.2** — `detect_anomalies()` with IQR outliers + missing + duplicates, unit tests (15/15)
- ✅ **5.3** — Drag-and-drop CSV upload on frontend
- ✅ **5.4** — Analyze results in DuckDB table with anomaly highlighting, refactored to components

### Iteration 6 — Auth + MarketMe
- ✅ **6.1** — Clerk connected, Sign in modal, guest access for ForgeMe
- ✅ **6.2** — JWT verification on backend via JWKS, `GET /api/me` works
- ✅ **6.3** — `user_modules` table (SQLite/PostgreSQL), `GET /api/me/modules`, `POST /api/modules/activate`, `DELETE /api/modules/{id}`
- ✅ **6.4** — MarketMe page (renamed from Marketplace), module activation UI, Clerk integration

### Design
- ✅ **D1.1** — Tailwind v4, Shadcn/ui (Nova preset, Radix), i18next with EN/ES/UK locales
- ✅ **D1.2** — New AppShell: Tailwind classes, dark/light theme toggle, language dropdown (Globe icon)
- ✅ **D2** — ForgeMe redesign: Tailwind + i18n in all components
- ✅ **D3** — MarketMe redesign: Tailwind + i18n

### Documentation
- ✅ `doc/decisions/architecture.md` — full architecture reference
- ✅ `doc/specs/forge-me.md` — ForgeMe feature spec
- ✅ `doc/specs/market-me.md` — MarketMe feature spec
- ✅ `doc/specs/auth.md` — Auth spec
- ✅ `doc/specs/env-variables.md` — Environment variables reference
- ✅ `doc/iteration-log.md` — this file

---

## In Progress

- 🔄 **Design polish** — UI improvements before first deploy

---

## Next

- ⏳ **7.1** — Deploy backend to Railway, environment variables
- ⏳ **7.2** — Deploy frontend to Vercel, connect to production backend
- ⏳ **7.3** — Smoke tests in production: login, generate, analyze
- ⏳ **7.4** — Error handling polish, loading states, final UI cleanup

---

## Known issues / tech debt

- `uv run` uses `backend/.venv`, `python` uses root `.venv` — always use `uv run` from `backend/`
- Clerk JWT does not include email/first_name by default — only `sub` (user ID) is reliable
- `defaultForNewUsers: true` in ForgeMe manifest — auto-activation logic not yet implemented
- Browser extension (Exploratory Tester) causes `message channel closed` error in console — harmless, not our code
- DuckDB timestamp comes as Unix milliseconds — divide by 1 (not 1000) when creating `new Date()`

---

## How to start servers locally

**Backend** (from `D:\My projects\StackMe\backend`):
```bash
uv run uvicorn core.main:app --reload
```

**Frontend** (from `D:\My projects\StackMe\apps\hub`):
```bash
npm run dev
```

**Both at once** (from `D:\My projects\StackMe`):
```bash
npm run dev
```

---

*Last updated: April 2026*
