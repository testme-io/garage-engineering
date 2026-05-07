# ForgeMe — Feature Spec

> Scope: anomaly dataset generator and analyzer — the first and flagship tool of StackMe.
> Route: `/forge-me` · Entry: `apps/hub/src/modules/forge-me/index.tsx`

---

## What it does

ForgeMe has two modes:

1. **Generate** — creates a synthetic dataset with injected anomalies based on a text prompt
2. **Analyze** — accepts a user-uploaded CSV and detects anomalies using statistical methods

All data processing happens client-side via DuckDB-Wasm. No user data is sent to the backend for analysis.

---

## File structure

```
apps/hub/src/modules/forge-me/
├── index.tsx           → page entry, uses GenerateSection + AnalyzeSection
├── GenerateSection.tsx → generate form + results table
├── AnalyzeSection.tsx  → drag-and-drop upload + results
├── AnomalyTable.tsx    → shared table component with anomaly highlighting
└── types.ts            → TypeScript interfaces + csvToJson utility

backend/services/forge_me/forge_me/
├── router.py           → FastAPI routes
├── schemas.py          → Pydantic request/response models
└── anomaly_engine.py   → dataset generation and anomaly detection logic
```

---

## Backend API

| Method | Path | Description |
|---|---|---|
| `GET` | `/forge-me/health` | Health check |
| `POST` | `/forge-me/generate` | Generate dataset with anomalies |
| `POST` | `/forge-me/analyze` | Analyze uploaded CSV file |

### POST /forge-me/generate

Request:
```json
{
  "prompt": "temperature sensor readings from a plant",
  "format": "json",
  "rows": 100,
  "anomaly_rate": 0.05
}
```

Response:
```json
{
  "format": "json",
  "rows_total": 100,
  "anomalies_count": 5,
  "anomalies": [
    {
      "row_index": 5,
      "column": "temperature",
      "anomaly_type": "outlier",
      "original_value": "21.5",
      "description": "Value 215.0 is outside IQR range"
    }
  ],
  "data": "[{...}]"
}
```

Supported formats: `json`, `csv`, `sql`

### POST /forge-me/analyze

- Accepts: `multipart/form-data` with `file` field (CSV only)
- Returns: same `anomalies` structure as generate
- Auth: not required (open to all users)

---

## Anomaly engine

Located in `backend/services/forge_me/forge_me/anomaly_engine.py`

### generate_clean_dataset(rows, seed)
- Generates synthetic sensor data: `id`, `timestamp`, `sensor_id`, `temperature`, `pressure`, `humidity`, `user_id`
- Reproducible with same seed
- Normal distribution for numeric columns

### inject_anomalies(df, anomaly_rate, seed)
- Splits anomaly rows into thirds: outliers, missing, duplicates
- Outliers: temperature × 10
- Missing: user_id → None
- Duplicates: row copied from previous row
- Returns: `(df_with_anomalies, list[AnomalyRecord])`

### detect_anomalies(df)
- Used for uploaded CSV analysis
- Outliers: IQR method (Q1 - 1.5×IQR, Q3 + 1.5×IQR) per numeric column
- Missing: `pd.isna()` per column
- Duplicates: `df.duplicated(keep='first')`
- Returns: `list[AnomalyRecord]`

### serialize_dataset(df, format)
- `json`: `df.to_json(orient="records")`
- `csv`: `df.to_csv(index=False)`
- `sql`: generates `INSERT INTO sensor_data (...) VALUES ...` statement

---

## Frontend data flow

### Generate flow
1. User fills form (prompt, format, rows, anomaly_rate)
2. POST `/forge-me/generate` → response with data + anomalies
3. If format = JSON: load data into DuckDB via `loadJSON(data, 'sensor_data')`
4. Load anomaly indexes via `loadAnomalyIndex(anomalies.map(a => a.row_index))`
5. Query DuckDB: `SELECT * FROM sensor_data`
6. Render AnomalyTable with highlighting

### Analyze flow
1. User drops CSV file onto dropzone (or clicks to upload)
2. POST `/forge-me/analyze` with FormData → response with anomalies
3. Read file text client-side → `csvToJson()` → load into DuckDB as `analyze_data`
4. Load anomaly indexes
5. Query DuckDB: `SELECT * FROM analyze_data`
6. Render AnomalyTable + anomaly cards

### Filter flow
- "All rows": `SELECT * FROM sensor_data`
- "Anomalies only": `SELECT s.* FROM sensor_data s INNER JOIN anomaly_index a ON s.id - 1 = a.row_index`

---

## DuckDB tables used

| Table | Created by | Content |
|---|---|---|
| `sensor_data` | Generate flow | Full generated dataset |
| `analyze_data` | Analyze flow | Uploaded CSV data |
| `anomaly_index` | Both flows | `{ row_index: number }` records |

---

## Anomaly highlighting rules

- Anomalous row: yellow background (`bg-amber-50`)
- Anomalous cell: amber text + amber cell background
- NULL value: red text, displays as `NULL`
- Timestamp column: converted from Unix ms to ISO string

---

## Auth

ForgeMe is fully open — no login required. Both generate and analyze work for guests.

---

## i18n keys used

All keys under `forge.*` in `locales/<lang>/common.json`:
`title`, `subtitle`, `datasetDescription`, `placeholder`, `format`, `rowCount`, `anomalyRate`, `generate`, `generating`, `rows`, `anomalies`, `allRows`, `anomaliesOnly`, `dataFromDuckDB`, `analyzeTitle`, `analyzeSubtitle`, `dropzone`, `csvOnly`, `analyzing`, `anomaliesFound`, `apiError`, `analyzeError`

---

## Tests

Located in `backend/services/forge_me/tests/test_anomaly_engine.py`

Run with: `uv run pytest services/forge_me/tests/ -v`

15 tests covering: dataset shape, no nulls, columns, temperature range, reproducibility, anomaly count, all types present, outlier values, missing values, row count preserved, detect outliers, detect missing, detect duplicates, clean dataset, AnomalyRecord structure.

---

## Future considerations

- Prompt-driven schema generation (use LLM to infer column types from prompt)
- Export generated dataset as file download
- Support for more formats: Parquet, Excel
- Custom anomaly type configuration
- History of generated datasets (requires auth)

---

*Created: April 2026. Update when ForgeMe behaviour changes.*
