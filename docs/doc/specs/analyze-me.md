# AnalyzeMe — Principles & Architecture Decisions

> This document captures the core principles and architectural decisions for AnalyzeMe.
> To be updated when development begins. Do not contradict it in code.

---

## What is AnalyzeMe

AnalyzeMe is a data quality audit tool — a "lie detector" for datasets.
Where ForgeMe creates chaos to test a system, AnalyzeMe finds chaos in real data before it breaks production.

Target user: a data engineer or analyst who has a CSV/file they plan to use in prod and needs to verify it is clean before it gets there.

---

## Core principle — full locality

**The user's file never leaves the browser. Under any circumstances.**

This is an architectural constraint, not a marketing claim. The backend does not participate in analysis. No API calls carry user data. No server sees a single byte of the uploaded file.

This is verifiable: any user can open DevTools and confirm there are no outbound network requests containing their data. That verifiability is the trust argument — not a banner saying "we don't store your data."

> Violating this principle is not allowed, even for new features.

---

## Processing stack

| Layer | Technology | Role |
|---|---|---|
| Storage | DuckDB-Wasm | In-browser SQL engine, loads file into local DB |
| Analysis | DuckDB SQL queries | IQR, nulls, duplicates — all client-side |
| Frontend | React + Tailwind | UI, file drop, results rendering |
| Backend | Not involved | No user data, no analysis endpoints |

---

## Analysis methods

Only classical, explainable statistical methods. No black boxes.
The user must always understand *why* a row is flagged.

**Outliers — IQR method**
For numeric columns: compute `Q1` and `Q3` via `PERCENTILE_CONT`.
Boundaries: `[Q1 - 1.5 × IQR, Q3 + 1.5 × IQR]`.
Anything outside is flagged as a suspected outlier.

**Nulls**
Any `NULL` value in any column is flagged with column name and row index.

**Duplicates**
Full-row duplicate detection via `GROUP BY` + `COUNT > 1`.

> Future methods (type mismatches, stale timestamps, schema drift) may be added
> but must remain fully client-side and explainable.

---

## UI principle — general to specific

1. User drops a file
2. System shows a summary: total anomalies, breakdown by type
3. User drills down: "Anomalies only" filter, type filters, specific rows highlighted
4. Never dump a raw table of thousands of flagged rows as the first view

---

## Data flow

```
User drops file
    → DuckDB-Wasm loads file into local in-memory DB
    → SQL queries run client-side (IQR, nulls, duplicates)
    → Anomaly indexes + descriptions returned to React state
    → AnomalyTable renders with highlighted rows
    → Backend never involved
```

---

## Relationship to ForgeMe

ForgeMe and AnalyzeMe are two ends of the same pipeline:

| | ForgeMe | AnalyzeMe |
|---|---|---|
| Input | Parameters | Real user file |
| Output | Synthetic dirty dataset | Anomaly report on real data |
| User need | "I need dirty data to test my system" | "I need to know if my data is clean before prod" |
| Data sensitivity | None (synthetic) | High (real prod data) |
| Backend involvement | Yes (generation) | Never |

---

## Security posture

- No file upload to server
- No logging of user data
- No analytics on file contents
- DuckDB-Wasm runs in a sandboxed Worker
- Security is a top-5 product value — must be preserved across all future decisions

---

*Created: May 2026. To be expanded when AnalyzeMe development begins.*