# ForgeMe — Manual QA Test Cases

> Full functional test coverage for manual testing session.
> Status column to fill in during testing: ✅ Pass | ❌ Fail | ⚠️ Partial

---

## Test datasets needed

| # | Dataset | Description | How to prepare |
|---|---|---|---|
| DS1 | Clean CSV — simple | 5 columns, 10 rows, no anomalies, comma separator | Create manually or export from Google Sheets |
| DS2 | Dirty CSV — mixed anomalies | 5 columns, 100 rows, nulls + duplicates + outliers | Use ForgeMe itself to generate and download |
| DS3 | CSV — semicolon separator | Same as DS1 but with `;` separator | Export from Google Sheets with European locale |
| DS4 | CSV — large | 7 columns, 1000+ rows | Export from any real data source or generate via ForgeMe |
| DS5 | CSV — edge cases | Empty rows, missing headers, non-UTF8 characters | Create manually in Notepad |
| DS6 | Schema sample — e-commerce | `order_id, customer_name, purchase_date, amount, status` | Paste as text in Schema match |
| DS7 | Schema sample — IoT | `device_id, event_time, temperature, voltage, error_code` | Paste as text in Schema match |

---

## 1. Navigation & Shell

| ID | Area | Action | Expected result | Dataset | Status |
|---|---|---|---|---|---|
| N1 | Topbar | Open app at `localhost:5173` | Redirects to `/forge-me`, topbar shows `StackMe | • ForgeMe` | — | |
| N2 | Topbar | Click 9-dots icon | Dropdown opens with ForgeMe, AnalyzeMe, + MarketMe | — | |
| N3 | Topbar | Click `AnalyzeMe` in dropdown | Navigates to `/analyze-me`, topbar pill updates | — | |
| N4 | Topbar | Click `ForgeMe` in dropdown | Returns to `/forge-me` | — | |
| N5 | Topbar | Click theme toggle | Switches between dark and light mode | — | |
| N6 | Topbar | Click language dropdown | Shows EN / ES / UK options | — | |
| N7 | Topbar | Select ES language | UI labels switch to Spanish | — | |
| N8 | Topbar | Select UK language | UI labels switch to Ukrainian | — | |
| N9 | Topbar | Click avatar (signed in) | Dropdown shows email, MarketMe link, Sign out | — | |
| N10 | Topbar | Click Sign in (guest) | Clerk modal opens | — | |

---

## 2. Sidebar — Anomaly mix

| ID | Area | Action | Expected result | Dataset | Status |
|---|---|---|---|---|---|
| S1 | Sidebar | Open ForgeMe | Default selection: nulls ✓, duplicates ✓, outliers ✓ | — | |
| S2 | Sidebar | Click `nulls` checkbox | Deselects — rate preview updates, "2 duplicates · 2 outliers" | — | |
| S3 | Sidebar | Click `nulls` again | Reselects — rate preview shows 3 types | — | |
| S4 | Sidebar | Click `out-of-order` | Selects — badge shows `stream`, rate preview updates | — | |
| S5 | Sidebar | Click `late arrivals` | Selects — badge shows `stream` | — | |
| S6 | Sidebar | Click `type mismatches` | Selects — badge shows `any` | — | |
| S7 | Sidebar | Click `stale timestamps` | Selects — badge shows `batch` | — | |
| S8 | Sidebar | Click `schema drift` | Nothing happens — item is greyed out, non-clickable, shows `soon` | — | |
| S9 | Sidebar | Click `Starter` preset | Selects exactly: nulls, duplicates, outliers. Others deselected | — | |
| S10 | Sidebar | Click `Full chaos` preset | All 7 active types selected | — | |
| S11 | Sidebar | Click toggle button `‹` | Sidebar collapses, main area expands | — | |
| S12 | Sidebar | Click toggle button `›` | Sidebar expands back | — | |
| S13 | Sidebar | Generate dataset | History entry appears: rows · rate · format + anomaly types | — | |
| S14 | Sidebar | Generate 3 times | History shows 3 entries, newest first | — | |

---

## 3. Rate preview

| ID | Area | Action | Expected result | Dataset | Status |
|---|---|---|---|---|---|
| R1 | Rate preview | Default state (3 types, 100 rows, 0.05) | Shows: `1 nulls · 1 duplicates · 1 outliers` (5 total ÷ 3) | — | |
| R2 | Rate preview | Change anomaly rate to 0.3 | Preview updates: `10 nulls · 10 duplicates · 10 outliers` | — | |
| R3 | Rate preview | Change row count to 200 | Preview updates proportionally | — | |
| R4 | Rate preview | Deselect all anomaly types | Preview disappears | — | |
| R5 | Rate preview | Select only 1 type | All anomaly rows go to that type | — | |

---

## 4. Raw Generator — Generate flow

| ID | Area | Action | Expected result | Dataset | Status |
|---|---|---|---|---|---|
| G1 | Raw / JSON | Select nulls+duplicates+outliers, click Generate | Stat bar appears: Rows/Anomalies/Format/seed. Table renders | — | |
| G2 | Raw / JSON | Check table | Columns: ID, TIMESTAMP, SENSOR_ID, TEMPERATURE, PRESSURE, HUMIDITY, USER_ID, TYPE | — | |
| G3 | Raw / JSON | Check anomaly rows | Highlighted rows with colored TYPE badge | — | |
| G4 | Raw / JSON | Check outlier badge | Amber badge `outlier`, temperature value plausible (not ×10) | — | |
| G5 | Raw / JSON | Check missing badge | Red badge `missing`, cell shows red `NULL` | — | |
| G6 | Raw / JSON | Check duplicate badge | Blue badge `duplicate` | — | |
| G7 | Raw / JSON | Select `out-of-order` only, Generate | Table shows rows with orange `out of order` badge, timestamps swapped | — | |
| G8 | Raw / JSON | Select `type-mismatches` only, Generate | Purple `type mismatch` badge, temperature column shows `"N/A"` or `"ERROR"` | — | |
| G9 | Raw / JSON | Select `stale-timestamps` only, Generate | Cyan `stale timestamp` badge, timestamp value older than surrounding rows | — | |
| G10 | Raw / JSON | Select `late-arrivals` only, Generate | Rose `late arrival` badge | — | |
| G11 | Raw / JSON | Select all 7 types, Generate | All badge types appear in table | — | |
| G12 | Raw / JSON | Generate with 0 anomaly types selected | Generate button disabled | — | |
| G13 | Raw / JSON | Filter `Anomalies only` | Table shows only anomalous rows | — | |
| G14 | Raw / JSON | Filter `All rows` | Table shows all 100 rows | — | |
| G15 | Raw / JSON | Same seed twice | Identical datasets generated | — | |
| G16 | Raw / JSON | Click `↺` seed button | Seed number changes | — | |
| G17 | Raw / CSV | Select format CSV, Generate | Stat bar appears, table NOT shown, dashed placeholder visible | — | |
| G18 | Raw / SQL | Select format SQL, Generate | Same as CSV — placeholder visible, no table | — | |
| G19 | Raw / JSON | Change row count to 500, Generate | Stat bar shows Rows: 500 | — | |
| G20 | Raw / JSON | Set anomaly rate 0.5, Generate | ~50% of rows anomalous | — | |

---

## 5. Download

| ID | Area | Action | Expected result | Dataset | Status |
|---|---|---|---|---|---|
| D1 | Download / JSON | Generate JSON, click `↓ Download JSON` | File downloads: `forgeme_seed42_100rows.json` | — | |
| D2 | Download / JSON | Open downloaded file | Valid JSON array, anomalous values visible | — | |
| D3 | Download / CSV | Generate CSV, click `↓ Download CSV` | File downloads: `forgeme_seed42_100rows.csv` | — | |
| D4 | Download / CSV | Open downloaded file | Valid CSV with headers, comma-separated | — | |
| D5 | Download / SQL | Generate SQL, click `↓ Download SQL` | File downloads: `forgeme_seed42_100rows.sql` | — | |
| D6 | Download / SQL | Open downloaded file | Valid `INSERT INTO sensor_data (...)` statements | — | |
| D7 | Download | Generate with seed 123, download | Filename contains `seed123` | — | |

---

## 6. Schema Match mode

| ID | Area | Action | Expected result | Dataset | Status |
|---|---|---|---|---|---|
| SM1 | Toggle | Click `Schema match` | Toggle highlights, SchemaSection appears above form | — | |
| SM2 | Toggle | Click `Raw generator` | Returns to raw mode, SchemaSection hidden | — | |
| SM3 | Paste / valid | Paste DS6 sample (order_id, customer_name...) | Detected schema shows 5 fields with correct types | DS6 | |
| SM4 | Paste / types | Check field type inference | `order_id` → int, `purchase_date` → timestamp, `amount` → float, `customer_name` → string | DS6 | |
| SM5 | Paste / IoT | Paste DS7 sample | 5 fields detected with correct types | DS7 | |
| SM6 | Upload / comma | Upload DS1 (comma CSV) | Schema detected: correct field names and types | DS1 | |
| SM7 | Upload / semicolon | Upload DS3 (semicolon CSV) | Schema detected correctly — semicolons normalized | DS3 | |
| SM8 | Upload / Google Sheets | Upload file exported from Google Sheets | Schema detected correctly — escaped `\r\n` normalized | DS1 | |
| SM9 | Upload / large | Upload DS4 (1000 rows) | Schema detected from first 3 rows only, correct fields | DS4 | |
| SM10 | Privacy badge | Check UI | Green dot + "stays in your browser — never leaves this tab" visible before upload | — | |
| SM11 | Generate | Upload DS6 schema, click Generate | Dataset columns match schema: order_id, customer_name, purchase_date, amount, status | DS6 | |
| SM12 | Generate | Check table columns | User's column names in headers, not sensor_id/temperature | DS6 | |
| SM13 | Generate / timestamp | Check purchase_date column | Shows human-readable date, not Unix ms | DS6 | |
| SM14 | Download | Generate with schema, download JSON | File contains user's column names | DS6 | |
| SM15 | Tab switch | Click `Upload file` tab | Upload zone appears | — | |
| SM16 | Tab switch | Click `Paste sample` tab | Textarea appears | — | |

---

## 7. Table behavior

| ID | Area | Action | Expected result | Dataset | Status |
|---|---|---|---|---|---|
| T1 | Table | Generate 100 rows JSON | Table renders all 100 rows | — | |
| T2 | Table | Scroll table vertically | Header row stays sticky at top | — | |
| T3 | Table | Check anomaly row highlight | Anomalous rows have amber background tint | — | |
| T4 | Table | Check normal rows | Alternating background: transparent / slight muted | — | |
| T5 | Table | Check NULL display | Red monospace `NULL` in cell | — | |
| T6 | Table | Check TYPE column | Last column shows colored badge for each anomaly type | — | |
| T7 | Table | Generate with wide schema (7+ columns) | Table fills full available width | — | |

---

## 8. Edge cases & error handling

| ID | Area | Action | Expected result | Dataset | Status |
|---|---|---|---|---|---|
| E1 | Backend down | Stop backend, click Generate | Error message appears in UI | — | |
| E2 | Min rows | Set rows to 10, Generate | Works — 10 rows generated | — | |
| E3 | Max rows | Set rows to 10000, Generate | Works — 10000 rows generated (may take a moment) | — | |
| E4 | Min rate | Set anomaly rate to 0.01, Generate | At least 1 anomaly injected | — | |
| E5 | Max rate | Set anomaly rate to 0.5, Generate | ~50% anomalous rows | — | |
| E6 | Schema / empty paste | Clear textarea in Schema match | Detected schema disappears | — | |
| E7 | Schema / 1 row | Paste only headers, no data row | Fields detected as `string` type (no sample to infer from) | — | |

---

## Summary

**Total test cases:** 89
**Test datasets needed:** 7 (DS1–DS7)

### Recommended testing order
1. Navigation (N1–N10) — confirm shell works
2. Sidebar (S1–S14) — confirm anomaly selection
3. Raw generator JSON (G1–G16) — core happy path
4. Download (D1–D7) — confirm all formats downloadable
5. Schema match (SM1–SM16) — second major flow
6. Table behavior (T1–T7) — visual checks
7. Raw generator CSV/SQL (G17–G18) — placeholders
8. Edge cases (E1–E7) — stress test

---

*ForgeMe QA session — May 2026*