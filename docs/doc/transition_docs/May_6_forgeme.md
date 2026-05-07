# StackMe — Full Project Context
> Handoff document for continuing development in a new chat.
> Last updated: May 2026

---

## What is StackMe

StackMe is a modular platform for data engineering tools. The core idea: instead of one monolithic product, users build their own toolkit by activating individual services — like apps on a phone. Each service solves one specific problem in the data engineering workflow.

The platform is inspired by the "Eat Me / Drink Me" motif from Alice in Wonderland — each tool invites you to try it. Service names follow the `*Me` pattern: ForgeMe, AnalyzeMe, TestMe, etc.

**Core principles:**
- One service = one focused tool
- Free to use, open source
- No data collected, no setup required
- Everything runs locally where possible (DuckDB-Wasm in browser)
- Monetization via personal cabinet (multi-project workspace) — future phase

**Current services:**
- ForgeMe — synthetic anomaly dataset generator (MVP complete, pre-deploy)
- AnalyzeMe — real dataset anomaly detector (in design, next to build)

---

## Tech stack — full platform

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind v4 + Shadcn/ui (Nova preset, Radix) |
| In-browser DB | DuckDB-Wasm Singleton Worker |
| State | Zustand (`activeModules[]`) |
| i18n | i18next + react-i18next · EN / ES / UK |
| Backend | Python 3.12 + FastAPI + uv |
| Data layer | NumPy + Pandas |
| Auth | Clerk (Google OAuth, JWT via JWKS) |
| Database | SQLite locally → PostgreSQL on Railway |
| Deploy frontend | Vercel |
| Deploy backend | Railway |

---

## Repository structure

```
StackMe/
├── apps/
│   └── hub/                          ← Frontend (Vite + React)
│       └── src/
│           ├── api/
│           │   └── client.ts         ← axios base client
│           ├── components/           ← Shadcn/ui components
│           ├── hooks/
│           │   └── useTheme.ts       ← dark/light theme
│           ├── i18n/
│           │   ├── index.ts          ← i18next config
│           │   └── locales/
│           │       ├── en/common.json
│           │       ├── es/common.json
│           │       └── uk/common.json
│           ├── layouts/
│           │   └── AppShell.tsx      ← topbar + service switcher + auth
│           ├── modules/
│           │   ├── forge-me/         ← ForgeMe module (complete)
│           │   │   ├── index.tsx     ← page layout, sidebar, state
│           │   │   ├── GenerateSection.tsx
│           │   │   ├── SchemaSection.tsx
│           │   │   ├── AnomalyTable.tsx
│           │   │   └── types.ts
│           │   └── analyze-me/       ← AnalyzeMe module (skeleton only)
│           │       ├── index.tsx     ← stub page "Coming soon"
│           │       └── AnalyzeSection.tsx  ← moved from ForgeMe, not yet wired
│           ├── pages/
│           │   └── MarketMe.tsx      ← marketplace page
│           ├── registry/
│           │   ├── index.ts          ← MODULE_REGISTRY array
│           │   ├── forge-me.ts       ← ForgeMe manifest
│           │   └── analyze-me.ts     ← AnalyzeMe manifest
│           ├── router/               ← empty, routes defined in App.tsx
│           ├── shared/
│           │   └── analytics/        ← DuckDB-Wasm Singleton Worker
│           ├── store/                ← Zustand store
│           ├── types/
│           │   └── module-manifest.ts
│           ├── App.tsx               ← BrowserRouter + routes
│           ├── main.tsx              ← ClerkProvider + createRoot
│           └── index.css             ← Tailwind + CSS variables
├── backend/
│   ├── core/                         ← Stable core (never depends on services)
│   │   ├── main.py                   ← FastAPI app, mounts service routers
│   │   ├── auth.py                   ← Clerk JWT verification via JWKS
│   │   ├── db.py                     ← SQLAlchemy session
│   │   ├── config.py                 ← DATABASE_URL with sqlite fallback
│   │   ├── models/
│   │   │   └── user_module.py        ← user_modules table
│   │   └── routers/
│   │       ├── users.py              ← GET /api/me
│   │       └── modules.py            ← GET/POST/DELETE /api/modules
│   ├── services/
│   │   └── forge_me/
│   │       └── forge_me/
│   │           ├── __init__.py
│   │           ├── router.py         ← FastAPI routes
│   │           ├── schemas.py        ← Pydantic models
│   │           ├── anomaly_engine.py ← orchestrator + detect_anomalies
│   │           └── injectors.py      ← all injector functions + INJECTORS dict
│   ├── shared/                       ← shared Python utilities (currently empty)
│   ├── tests/
│   │   └── services/forge_me/tests/
│   │       └── test_anomaly_engine.py ← 24 passing tests
│   └── pyproject.toml                ← uv workspace config
└── doc/
    ├── decisions/
    │   └── architecture.md
    ├── specs/
    │   ├── forge-me.md
    │   ├── analyze-me.md             ← principles & architecture decisions
    │   ├── auth.md
    │   ├── market-me.md
    │   └── env-variables.md
    ├── forgeme-product-overview.md   ← updated product overview v2
    ├── forgeme-d6-iteration-plan.md  ← D6 iteration plan
    ├── analyze-me-iterations.md      ← AnalyzeMe full iteration plan
    ├── forge-me-remaining.md         ← ForgeMe remaining work log
    └── iteration-log.md              ← global iteration log
```

---

## ForgeMe — complete feature description

### What it does
Generates synthetic datasets with injected anomalies for pipeline stress-testing.
Two modes: Raw (sensor data template) and Schema Match (user's own column structure).

### Frontend — `apps/hub/src/modules/forge-me/`

**`index.tsx`** — page root
- State: `sidebarOpen`, `viewMode` (raw/schema), `selected` (Set of AnomalyType), `preset`, `seed`, `rows`, `anomalyRate`, `history`, `schemaFields`
- Renders: collapsible sidebar + main area with toggle Raw/Schema
- Sidebar sections: Anomaly mix (7 checkboxes + schema drift disabled), Presets (Starter/Full chaos), History (last 10 runs)
- Footer: `// no setup // runs locally // no data collected // open source`

**`GenerateSection.tsx`** — form + results
- Props: selectedAnomalies, seed, rows, anomalyRate, onSeedChange, onRowsChange, onAnomalyRateChange, onGenerated, schemaFields
- Controls: Format (JSON/CSV/SQL), Row count, Anomaly rate, Seed with randomize button
- On Generate: POST `/forge-me/generate` with `anomaly_types[]` + optional `schema[]`
- JSON only: loads into DuckDB, renders table
- CSV/SQL: shows dashed placeholder "Table preview not available, use Download"
- Stat bar: rows / anomalies (amber) / format / seed + Download button
- Download: creates Blob, triggers browser download with filename `forgeme_seed{n}_{rows}rows.{ext}`
- Filters: All rows / Anomalies only (hidden for non-JSON)

**`SchemaSection.tsx`** — schema input for Schema Match mode
- Two tabs: Paste sample / Upload file
- Normalizes: `\r\n`, Google Sheets escaped CRLF, semicolon separators
- Infers types: int / float / timestamp (regex) / string
- Shows detected fields as colored tags before Generate
- Privacy badge: green dot + "stays in your browser — never leaves this tab"

**`AnomalyTable.tsx`** — results table
- Sticky header, vertical scroll (max-h 420px), full-width horizontal
- Per-row amber highlight for anomalous rows
- TYPE column with colored badges:
  - outlier → amber
  - missing → red
  - duplicate → blue
  - type_mismatch → purple
  - stale_timestamp → cyan
  - out_of_order → orange
  - late_arrival → rose
- NULL renders as red monospace `NULL`
- isTimestamp prop: converts Unix ms → ISO string for timestamp/date/time columns

**`types.ts`**
```typescript
type DataFormat = 'json' | 'csv' | 'sql'
type FilterMode = 'all' | 'anomalies'
type ViewMode = 'raw' | 'schema'
type PresetMode = 'starter' | 'chaos' | null
type AnomalyType = 'nulls' | 'duplicates' | 'outliers' | 'out-of-order' |
                   'late-arrivals' | 'type-mismatches' | 'stale-timestamps'
interface HistoryEntry { rows, rate, format, anomalies }
interface AnomalyInfo { row_index, column, anomaly_type, original_value, description }
interface GenerateResponse { format, rows_total, anomalies_count, anomalies, data }
interface AnalyzeResponse { rows_total, anomalies_count, anomalies }
```

### Backend — `backend/services/forge_me/forge_me/`

**`schemas.py`**
- `DataFormat` enum: json / csv / sql
- `AnomalyType` enum: outlier / missing / duplicate / type_mismatch / stale_timestamp / out_of_order / late_arrival
- `SchemaField`: name + type
- `GenerateRequest`: prompt (optional), format, rows (10-10000), anomaly_rate (0-0.5), seed, schema[], anomaly_types[]
- `GenerateResponse`: format, rows_total, anomalies_count, anomalies[], data
- `AnalyzeResponse`: rows_total, anomalies_count, anomalies[]

**`anomaly_engine.py`**
- `generate_clean_dataset(rows, seed)` → DataFrame: id, timestamp, sensor_id, temperature, pressure, humidity, user_id. All via `np.random.default_rng(seed)`
- `inject_anomalies(df, anomaly_rate, seed, anomaly_types[])` → routes to injectors, distributes rows evenly across selected types
- `serialize_dataset(df, format)` → JSON / CSV / SQL string
- `detect_anomalies(df)` → IQR outliers + pd.isna() + df.duplicated()

**`injectors.py`**
- `inject_subtle_outlier` — ±3σ shift from column mean (not ×10)
- `inject_missing` — NULL in first non-id/timestamp column
- `inject_duplicates` — copy of previous row, preserves id
- `inject_type_mismatch` — string ("N/A", "ERROR") in numeric column
- `inject_stale_timestamp` — shifts timestamp 7-30 days back
- `inject_out_of_order` — swaps timestamps between adjacent rows
- `inject_late_arrival` — stale timestamp relative to stream tail
- `INJECTORS` dict maps UI type strings to functions

**`router.py`**
- `GET /forge-me/health`
- `POST /forge-me/generate` — schema branch (generate_schema_dataset) or raw branch
- `POST /forge-me/analyze` — accepts CSV, runs detect_anomalies (used by AnalyzeMe later)

### Tests
- 24 tests in `test_anomaly_engine.py`
- Covers: dataset shape, reproducibility, all 7 injectors, detect_anomalies, edge cases
- Run: `uv run pytest -v` from `backend/`

### Known issues / tech debt
- CSV and SQL formats don't show table preview (placeholder shown instead)
- `uv run` uses `backend/.venv`, always run from `backend/` directory
- `uv pip install -e services/forge_me --no-deps` needed after clean install
- `stackme-shared` package has broken hatchling config — doesn't affect runtime
- Clerk JWT: only `sub` (user ID) is reliable, not email/first_name
- `defaultForNewUsers: true` in ForgeMe manifest — auto-activation not implemented
- Browser extension (Exploratory Tester) causes harmless `message channel closed` in console

---

## ForgeMe — what's left before deploy

| Task | Priority | Notes |
|---|---|---|
| Deploy backend to Railway | HIGH | Set `CLERK_SECRET_KEY`, `DATABASE_URL` env vars |
| Deploy frontend to Vercel | HIGH | Set `VITE_CLERK_PUBLISHABLE_KEY` env var |
| Smoke tests in production | HIGH | Login, generate, analyze, download |
| Loading states polish | MEDIUM | Spinner on Generate button is minimal |
| Error handling polish | MEDIUM | Network errors show generic message |
| CSV table preview | LOW | Parse CSV client-side via csvToJson → DuckDB |
| Correlated columns | LOW | multivariate_normal for temperature+pressure |
| Faker for Schema match strings | LOW | `customer_name_1` → realistic names |

---

## AnalyzeMe — full specification

### What it does
"Lie detector" for real datasets. User uploads their own file — system highlights anomalies before data reaches production. Counterpart to ForgeMe: ForgeMe creates chaos, AnalyzeMe finds it.

### Core architectural principle — NEVER NEGOTIABLE
**The user's file never leaves the browser under any circumstances.**
Backend does not participate in analysis. No API calls with user data. Verifiable: open DevTools, zero outbound requests with file contents.

### Processing stack
- File → DuckDB-Wasm (in-browser) → SQL analysis → anomaly index → AnomalyTable
- IQR via `PERCENTILE_CONT` SQL
- Nulls and duplicates via standard SQL
- No Pandas on server for analysis

### UI flow
1. User drops/uploads CSV (or JSON — phase 2)
2. File loaded into DuckDB-Wasm client-side
3. Summary shown: total anomalies by type
4. Drill-down: table with highlighted rows, filters by type
5. Each anomaly has explanation: why flagged, what method, what values

### Iteration plan (from `doc/analyze-me-iterations.md`)

**A.0** — Move `AnalyzeSection.tsx` from forge-me to analyze-me folder ✅ Done
**A.1** — Manifest + registry + stub index.tsx ✅ Done

**Iteration 1 — Skeleton**
- 1.1: `backend/services/analyze_me/` with health endpoint
- 1.2: Connect router via try/except
- 1.3: Layout — dropzone + empty results area

**Iteration 2 — Local analysis (DuckDB-Wasm)**
- 2.1: Load CSV into DuckDB client-side, verify zero network requests
- 2.2: Nulls + duplicates via SQL
- 2.3: IQR outliers via `PERCENTILE_CONT` SQL
- 2.4: Unified `analyzeLocally(tableName)` in `shared/analytics/`

**Iteration 3 — Results UI**
- 3.1: Summary panel (total + by type)
- 3.2: AnomalyTable with filters
- 3.3: Per-anomaly explanation cards
- 3.4: "stays in your browser" badge visible before upload

**Iteration 4 — Quality**
- 4.1: Large file handling + progress, warning >10MB
- 4.2: Edge cases: empty file, no headers, wrong format, encoding
- 4.3: JSON file support
- 4.4: Vitest unit tests for all detectors

**Iteration 5 — Polish**
- 5.1: i18n keys for all AnalyzeMe text
- 5.2: Final design aligned with ForgeMe
- 5.3: Update `doc/specs/analyze-me.md`

### Key decisions already made
- Backend NOT involved in analysis (DuckDB-Wasm only)
- `/forge-me/analyze` endpoint exists but will move to `/analyze-me/analyze` when needed
- `AnalyzeSection.tsx` already moved to `modules/analyze-me/` — starting point for UI
- Security is top-5 product value — must be visible in UI before user uploads

---

## AppShell — current structure

Topbar (horizontal, 44px height):
- Left: `StackMe | • ActiveModule`
- Right: Language dropdown (Globe icon) + Theme toggle (Sun/Moon) + Avatar/SignIn + 9-dots service switcher

9-dots dropdown:
- Lists all MODULE_REGISTRY services
- `+ MarketMe` at bottom
- Clicking navigates and updates topbar pill

No vertical sidebar — removed in favor of per-module sidebars (ForgeMe has its own anomaly mix sidebar).

---

## Environment variables

| Variable | Where | Description |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Vercel / `.env` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Railway / `.env` | Clerk backend key |
| `DATABASE_URL` | Railway / `.env` | PostgreSQL URL (optional locally) |

Never commit `.env`. Already in `.gitignore`.
Railway may return `postgres://` — always replace with `postgresql://` (handled in `config.py`).

---

## How to run locally

**Backend** (from `backend/`):
```bash
uv run uvicorn core.main:app --reload
```

**Frontend** (from `apps/hub/`):
```bash
npm run dev
```

**Both** (from root):
```bash
npm run dev
```

**Tests** (from `backend/`):
```bash
uv run pytest -v
```

**If ForgeMe not loading** (after clean install):
```bash
cd backend
uv pip install -e services/forge_me --no-deps
```

---

## Iteration log summary

| Iteration | Description | Status |
|---|---|---|
| 0 | Monorepo setup | ✅ Done |
| 1.1–1.4 | ForgeMe skeleton | ✅ Done |
| 2.1–2.4 | First endpoint | ✅ Done |
| 3.1–3.4 | Anomaly engine | ✅ Done |
| 4.1–4.4 | DuckDB Worker | ✅ Done |
| 5.1–5.4 | Analyzer (moved to AnalyzeMe) | ✅ Done |
| 6.1–6.4 | Auth + MarketMe | ✅ Done |
| D1–D3 | AppShell + ForgeMe + MarketMe redesign | ✅ Done |
| D4.1–D4.6 | ForgeMe new UI layout | ✅ Done |
| D5.1–D5.3 | Raw/Schema toggle + Schema Match | ✅ Done |
| D6.1–D6.10 | All anomaly types + injectors refactor | ✅ Done |
| 7.1–7.4 | Deploy to Railway + Vercel | ⏳ Not started |
| AnalyzeMe A.0–A.1 | Skeleton + registry | ✅ Done |
| AnalyzeMe 1–5 | Full AnalyzeMe implementation | ⏳ Not started |