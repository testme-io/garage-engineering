# ForgeMe — Product Overview

> Covers: what it does, who it's for, how it works, tech stack, and what's next.

---

## What is ForgeMe

ForgeMe is a synthetic anomaly dataset generator built for data engineers and QA engineers
who need dirty data fast — without writing scripts or exposing production data.

You pick which anomalies to inject, set volume and rate, hit Generate.
You get back a labeled dataset with every anomalous row indexed and explained.

**Core promise:** stress-test your pipeline against dirty data in under 30 seconds,
with no setup and no data leaving your machine.

---

## MVP — What it can do today

### Two generation modes

**Raw generator:**
Generates a sensor-style dataset (temperature, pressure, humidity, timestamps)
and injects anomalies into it. Zero configuration required — useful for quick
pipeline smoke tests when schema doesn't matter.

**Schema match:**
User provides their own column names and types by pasting a CSV sample
or uploading a file. The generator uses those column names to produce
a dataset that matches the user's real data structure.
Schema is parsed entirely client-side — the file never leaves the browser.

### Anomaly types (implemented)

| Type | Badge | What happens |
|---|---|---|
| Nulls | any | `NULL` injected into a selected column |
| Duplicates | any | Row copied verbatim from the previous row |
| Outliers | any | Subtle ±3σ shift from column mean — plausible visually, triggers IQR |
| Out-of-order | stream | Timestamps swapped between adjacent rows to break chronological order |
| Late arrivals | stream | Row assigned a stale timestamp simulating an event that arrived late |
| Type mismatches | any | String value (`"N/A"`, `"ERROR"`) injected into a numeric column |
| Stale timestamps | batch | Timestamp shifted 7–30 days into the past |
| Schema drift | — | Planned — disabled in UI |

### Anomaly mix control
- Select any combination of anomaly types via checkboxes
- Set total anomaly rate (e.g. 10% of rows)
- Preview distribution before generating: "3 nulls · 3 duplicates · 3 outliers"
- Presets: **Starter** (nulls + duplicates + outliers) and **Full chaos** (all types)

### Reproducibility
Every generation uses a configurable random seed.
Same seed + same parameters = identical dataset every time.
Useful for sharing test cases with teammates.

### Output formats
JSON · CSV · SQL (`INSERT INTO` statements)

### Results table
- Rendered via DuckDB-Wasm (in-browser SQL engine)
- Filter: All rows / Anomalies only
- Per-row highlighting with color-coded anomaly type badge
- Sticky column headers, horizontal scroll for wide datasets

### Generation history
Last 10 runs stored in session: rows, rate, format, anomaly types used.

---

## How the logic works

### Data generation — backend

```
generate_clean_dataset(rows, seed)
    → DataFrame with normally distributed numeric columns
    → timestamps via pd.date_range (hourly, starting 2024-01-01)
    → sensor_id sampled from ["sensor_A", "sensor_B", "sensor_C"]

inject_anomalies(df, anomaly_rate, seed, anomaly_types[])
    → selects n = rows × rate random rows
    → distributes rows evenly across requested anomaly types
    → routes each chunk to the matching injector in injectors.py:
        nulls           → inject_missing()        — NULL in first non-id column
        duplicates      → inject_duplicates()      — copy of previous row
        outliers        → inject_subtle_outlier()  — ±3σ shift from column mean
        out-of-order    → inject_out_of_order()    — timestamp swap with next row
        late-arrivals   → inject_late_arrival()    — stale timestamp at stream tail
        type-mismatches → inject_type_mismatch()   — string in numeric column
        stale-timestamps→ inject_stale_timestamp() — timestamp shifted 7-30 days back
    → returns modified df + AnomalyRecord list (row_index, column, type, description)
```

All randomness via `numpy.random.default_rng(seed)` — fully reproducible.

### File structure — backend

```
backend/services/forge_me/forge_me/
├── anomaly_engine.py   — generate_clean_dataset, inject_anomalies (orchestrator),
│                         serialize_dataset, detect_anomalies
├── injectors.py        — individual injector functions + INJECTORS dict
├── router.py           — FastAPI routes: /generate, /analyze, /health
└── schemas.py          — Pydantic models: GenerateRequest, GenerateResponse, AnomalyInfo
```

### Anomaly detection — backend (used in Analyze mode)

```
detect_anomalies(df)
    → outliers:   IQR method per numeric column (Q1 - 1.5×IQR, Q3 + 1.5×IQR)
    → nulls:      pd.isna() per column
    → duplicates: df.duplicated(keep='first')
    → returns AnomalyRecord list
```

### Frontend data flow

```
Generate clicked
    → POST /forge-me/generate { anomaly_types[], schema?, seed, rows, anomaly_rate, format }
    → response: { data (JSON string), anomalies[] }
    → loadJSON(data) → DuckDB-Wasm table: sensor_data
    → loadAnomalyIndex(anomalies) → DuckDB-Wasm table: anomaly_index
    → SELECT * FROM sensor_data → rendered in AnomalyTable
    → "Anomalies only": JOIN sensor_data ON anomaly_index
```

**Schema inference (client-side only):**
```
User pastes CSV sample or uploads file
    → normalize line endings (\r\n, Google Sheets escaped \r\n, semicolons)
    → parse headers from line 0, sample values from line 1
    → infer types: int / float / timestamp / string
    → display detected fields as labeled tags
    → send schema to backend only on Generate click
```

---

## Who it's for

**Data engineers setting up pipelines (CI/CD stage)**
Need to verify that their Kafka connector, Flink job, or ingestion script
doesn't crash on NULL, doesn't silently pass duplicates, doesn't mishandle
a timestamp spike. ForgeMe generates the failure case in seconds.

**QA engineers (junior/middle)**
Need to fill a database with bad data to test frontend validation or backend endpoints.
Saves time vs. manually crafting broken CSV files.

**Data science students and instructors**
The math of detection (IQR) matches the math of generation — making it a transparent,
reproducible teaching example for anomaly detection concepts.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite |
| Styling | Tailwind v4 · Shadcn/ui (Nova preset, Radix) |
| In-browser DB | DuckDB-Wasm (Singleton Worker) |
| State | Zustand |
| i18n | i18next · EN / ES / UK |
| Backend | Python 3.12 · FastAPI · uv |
| Data layer | NumPy · Pandas |
| Auth | Clerk (Google OAuth, JWT verification) |
| Database | SQLite (local) → PostgreSQL on Railway |
| Deploy frontend | Vercel |
| Deploy backend | Railway |

---

## What's known to be simple / rough in the MVP

| Area | Current state | Why it's acceptable for MVP |
|---|---|---|
| Column independence | Each column generated independently | No correlations between temperature and pressure — phase 2 item |
| String fields in Schema match | `customer_name_1`, `customer_name_2` | Sufficient to test whether data passes schema validation |
| Schema drift | Shown in UI as disabled / coming soon | Requires structural dataset changes — separate iteration |

---

## Phase 2 — What's planned

### ForgeMe improvements

**1. Correlated columns (multivariate distribution)**
Replace independent column generation with `numpy.random.multivariate_normal`.
Define a covariance matrix so that temperature and pressure co-vary realistically.
Anomalies then need to violate the correlation — not just the individual column range.
Estimated effort: 3–5 hours (requires rewriting `generate_clean_dataset`).

**2. Temporal patterns and seasonality**
Add sinusoidal day/night cycles or linear drift trends to time-series columns.
Anomalies are injected so they disrupt the pattern without being trivially obvious.
Requires a separate time series generation module.
Estimated effort: separate iteration, higher complexity.

**3. Schema drift**
Add/remove columns mid-dataset to simulate real-world schema evolution.
Currently disabled in UI — requires structural changes to dataset format and rendering.

**4. Realistic string generation**
Use Faker or similar to generate `Alice Johnson` instead of `customer_name_1`
in Schema match mode. Makes datasets more realistic for demos and testing.

### AnalyzeMe (separate module, in design)

A "lie detector" for real datasets. User uploads their own file —
ForgeMe creates chaos, AnalyzeMe finds it.

- Fully client-side: file never leaves the browser (DuckDB-Wasm)
- IQR outlier detection, null detection, duplicate detection via SQL
- Summary view (how many anomalies, by type) → drill-down to specific rows
- Explainable results: every flagged row shows why it was flagged and by what method

---

*ForgeMe is part of StackMe — a modular platform for data engineering tools.*
*Open source. No data collected. Runs locally.*