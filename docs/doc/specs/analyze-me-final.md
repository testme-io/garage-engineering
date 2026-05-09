# AnalyzeMe — Final Spec

> Last updated: May 2026  
> Status: Done (Iterations 1–5)

## What it is

AnalyzeMe is a local-first anomaly detection tool for real datasets. The user uploads a CSV or JSON file — the file never leaves the browser. Analysis runs entirely in DuckDB-Wasm (WebAssembly SQL engine). No backend, no uploads, no logs.

## Core principle

**Data privacy is not a feature — it is the product.**  
The "stays in your browser" badge and tooltip are present before any file is uploaded, not as a footnote.

---

## Architecture

### Frontend
```
apps/hub/src/modules/analyze-me/
├── index.tsx              — page layout + footer
├── AnalyzeSection.tsx     — orchestrator: state + filter logic
├── useAnalyze.ts          — analysis hook: file validation, DuckDB queries, detector pipeline
├── UploadZone.tsx         — drag-and-drop zone, privacy badge, tooltip
├── AnalysisSummary.tsx    — summary bar + filter buttons
├── AnomalyTable.tsx       — data table with anomaly highlighting
├── AnomalyCards.tsx       — anomaly detail cards
├── types.ts               — AnomalyInfo, AnalyzeResult, csvToJson
└── __tests__/
    ├── csvToJson.test.ts
    └── validation.test.ts
```

### Backend
```
backend/services/analyze_me/
├── pyproject.toml
└── analyze_me/
    ├── __init__.py
    ├── router.py          — POST /analyze-me/analyze, GET /analyze-me/health
    └── detectors.py       — detect_nulls, detect_duplicates, detect_outliers, detect_all
```

### Shared
```
apps/hub/src/shared/analytics/
├── index.ts               — loadCSV, loadJSON, loadAnomalyIndex, runQuery
└── duckdb.worker.ts       — DuckDB-Wasm worker: INIT, LOAD_JSON, QUERY
```

---

## Analysis pipeline (frontend, local)

1. File validation — type, size, encoding, structure
2. `loadCSV` or `loadJSON` → DuckDB table `analyze_data`
3. `CREATE TABLE analyze_data_indexed` with `_row_index` (0-based)
4. Detect nulls — per column, `IS NULL OR CAST = ''`
5. Detect duplicates — string concatenation key, `GROUP BY HAVING COUNT > 1`
6. Detect outliers — IQR method (3×IQR), numeric columns only, `PERCENTILE_CONT`
7. Sort all anomalies by `row_index`
8. Render: table with highlighting + anomaly cards

## Analysis pipeline (backend, optional)

`POST /analyze-me/analyze` accepts a CSV file and runs the same three detectors via `detectors.py` using pandas. Returns `AnalyzeResponse` with `rows_total`, `anomalies_count`, `anomalies[]`.

The backend endpoint exists but the frontend does **not** call it — all analysis is local. The backend is available for future server-side use cases (batch processing, API integrations).

---

## Detectors

### Nulls (`missing`)
- Checks every column for `None` / `NaN` / empty string
- Reports: `row_index`, `column`, description

### Duplicates (`duplicate`)
- Finds rows where all column values match a previously seen row
- First occurrence is kept, subsequent ones flagged
- Column reported as `*` (whole row)

### Outliers (`outlier`)
- Numeric columns only
- IQR method: `lower = Q1 - 3×IQR`, `upper = Q3 + 3×IQR`
- Skips columns with zero IQR (constant values)
- Skips columns with fewer than 4 non-null values
- Reports: value, expected range

---

## File support

| Format | Validation | Notes |
|--------|-----------|-------|
| CSV | Header row required, ≥1 data row, UTF-8 | Parsed via `csvToJson` → JSON → DuckDB |
| JSON | Must be array of objects, non-empty, UTF-8 | Loaded directly via `loadJSON` |

**Size limits:**
- Warning at >10 MB (analysis continues)
- Hard limit at 50 MB (rejected before analysis)

---

## UI/UX decisions

### Upload zone
- Full drag-and-drop + click to browse
- After file loaded: shows filename + "drop another file or click to replace"
- Privacy badge always visible inside the zone
- Tooltip explains DuckDB-Wasm on click, closes on outside click

### Table
- Anomalous rows highlighted by type:
  - `missing` → red background
  - `duplicate` → blue background  
  - `outlier` → amber background
- Anomalous cells highlighted in amber text
- NULL values shown as red `NULL` badge
- Timestamps auto-formatted from unix ms to `YYYY-MM-DD HH:MM:SS`
- Max height 680px with scroll

### Filters
- All rows / Anomalies only / Nulls (N) / Duplicates (N) / Outliers (N)
- Filters apply to both table and anomaly cards simultaneously
- Same visual pattern as ForgeMe Raw/Schema toggle

### Progress
- Step-by-step progress text during analysis:  
  Reading file → Loading into DuckDB → Reading columns → Detecting nulls → Detecting duplicates → Detecting outliers
- Animated pulse bar during loading
- Upload zone disabled during analysis

---

## i18n

All user-facing strings use `t()` via `react-i18next`.  
Keys live in `apps/hub/src/i18n/locales/{en|es|uk}/common.json` under the `analyze` namespace.

Languages supported: English, Spanish, Ukrainian.

---

## Tests

### Frontend (Vitest)
```
apps/hub/src/modules/analyze-me/__tests__/
├── csvToJson.test.ts     — 7 tests
└── validation.test.ts    — 10 tests
```
Run: `cd apps/hub && npm test`

### Backend (pytest)
```
backend/services/analyze_me/tests/
└── test_detectors.py     — 13 tests
```
Run: `cd backend/services/analyze_me && uv run pytest tests/ -v`

---

## What was decided during development (vs original plan)

| Decision | Reason |
|----------|--------|
| All analysis runs locally, backend not called | Privacy is the core value. Backend `/analyze-me/analyze` exists but frontend skips it |
| Duplicate detection via string key concatenation | DuckDB-Wasm JSON type casting: all values become strings, so JOIN on typed columns fails |
| IQR multiplier = 3× (not 1.5×) | 1.5× produces too many false positives on real sensor data |
| No `AnalyzeSection.tsx` in `forge-me/` | Old `AnalyzeSection` was removed from ForgeMe as part of A.0 before AnalyzeMe iteration started |
| File split into 6 components + 1 hook | `AnalyzeSection.tsx` grew to 354 lines — split at iteration 4 refactor |
| JSON support added in 4.3 | Data engineers often work with JSON; same DuckDB pipeline handles both formats |
| Upload zone stays visible after file load | Collapsing it was less intuitive — showing filename + replace hint is clearer |

---

## Module manifest

```ts
// apps/hub/src/registry/analyze-me.ts
{
  id: 'analyze-me',
  name: 'AnalyzeMe',
  description: 'Detect anomalies in your real datasets before they reach production.',
  icon: 'ScanSearch',
  route: '/analyze-me',
  category: 'analytics',
  defaultForNewUsers: false,
}
```

---

## Known limitations / future work

- Outlier detection uses IQR only — no z-score, no ML-based detection
- No export of anomaly report (planned)
- No support for multi-sheet Excel, Parquet, or other formats
- Duplicate detection compares all columns — no option to select key columns
- Table shows max 680px height — no virtual scrolling for very large datasets
- i18n per-service file split (separate `analyze.json` per locale) — deferred