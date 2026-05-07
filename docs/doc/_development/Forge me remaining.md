# ForgeMe — Remaining Work

> Что осталось сделать по ForgeMe после завершения итераций 1-6 и редизайна Д1-Д3.
> Все задачи ниже — финальный этап перед деплоем и передачей в production.

---

## Статусы
- Done
- In Progress
- Not Started

---

## Итерация D4 — Редизайн UI под новую концепцию

| Итерация | Задача | Цель | Ожидаемый результат | Статус |
|---|---|---|---|--------|
| D4.1 | Перенести `AnalyzeSection.tsx` из `modules/forge-me/` в `modules/analyze-me/`. Убрать импорт и рендер из ForgeMe `index.tsx`. | ForgeMe — только генератор. Никаких хвостов. | ForgeMe работает без AnalyzeSection. Бэкенд `/forge-me/analyze` пока остаётся. | Done   |
| D4.2 | Добавить skeleton AnalyzeMe: манифест в `registry/analyze-me.ts`, stub `index.tsx`, регистрация в `registry/index.ts`. | Модуль существует в системе, роут работает, карточка видна в MarketMe. | `/analyze-me` открывает заглушку. Модуль виден в MarketMe. | Done   |
| D4.3 | Переписать `modules/forge-me/index.tsx`: двухколоночный layout, коллапсируемый сайдбар, state для выбранных аномалий, пресеты, history, seed, footer. | Новый UI согласно согласованному дизайну. | Страница ForgeMe имеет сайдбар с чекбоксами аномалий, пресеты Starter/Full chaos, историю генераций. | Done   |
| D4.4 | Переписать `GenerateSection.tsx`: убрать prompt/textarea, принять props (selectedAnomalies, seed, ratePreview, onGenerated). Добавить rate preview теги над Generate. | GenerateSection получает данные от index.tsx через props, не управляет своим состоянием аномалий. | Форма работает с выбранными аномалиями из сайдбара. Rate preview показывает распределение до генерации. | Done   |
| D4.5 | Обновить `AnomalyTable.tsx`: добавить колонку TYPE с бейджем (outlier/null/dup), скорректировать цвета под тёмную тему, улучшить отображение NULL. | Таблица информативнее — тип аномалии виден сразу в отдельной колонке. | Колонка TYPE с цветными бейджами. NULL отображается красным моноширинным текстом. | Done   |
| D4.6 | Добавить `types.ts` новые типы: `AnomalyType`, `ViewMode`, `PresetMode`, `HistoryEntry`. | Типизация для новых компонентов. | TypeScript не ругается, все новые интерфейсы описаны. | Done   |

---

## Итерация D5 — Schema Match (Raw / Schema переключатель)

| Итерация | Задача | Цель | Ожидаемый результат | Статус |
|---|---|---|---|--------|
| D5.1 | Добавить переключатель Raw Generator / Schema Match в `index.tsx`. State `viewMode`. | Два режима работы ForgeMe доступны пользователю. | Переключатель отображается, переключение меняет контент главной области. | Done   |
| D5.2 | Schema Match — UI: textarea "paste your sample" + кнопка "upload file" + плашка "stays in your browser". Парсинг схемы из вставленного текста, отображение распознанных полей с типами. | Пользователь описывает свою схему — мы показываем что поняли до генерации. | Вставил 2-3 строки CSV — появились теги с именами колонок и типами. | Done   |
| D5.3 | Schema Match — бэкенд: передавать распознанную схему в `/forge-me/generate`. Генерировать данные с именами колонок пользователя вместо sensor_data. | Данные в Schema Match режиме используют терминологию пользователя. | Сгенерированный датасет содержит колонки из схемы пользователя, не стандартные sensor/temperature/etc. | Done   |

Итерация D5 завершена. Что сделано:

Raw / Schema match переключатель
Парсинг схемы из paste и upload
Поддержка Google Sheets CRLF и точки с запятой
Схема передаётся в бэкенд
Бэкенд генерирует данные с колонками пользователя
Timestamp колонки отображаются корректно

---
# ForgeMe — Iteration D6: Anomaly Engine Improvements

> Goal: implement all anomaly types shown in the UI, replace crude outlier injection with subtle statistical method.

| Iteration | Task | Goal | Expected result | Status      |
|---|---|---|---|-------------|
| D6.1 | Add `inject_subtle_outlier()` to `anomaly_engine.py`. Replace `temperature × 10` with a random shift of ±3σ from the column mean. Use `numpy.random.default_rng(seed)` for reproducibility. | Outliers look plausible to the human eye but still trigger IQR detection. | Generated outlier values are within believable range visually but outside `Q3 + 1.5×IQR`. Unit test: outlier is detected by `detect_anomalies()`. | Done        |
| D6.2 | Add `inject_type_mismatch()` to `anomaly_engine.py`. Insert string value `"N/A"` into a randomly selected numeric column. Convert column to `object` dtype before injection. | Pipeline receives a string where it expects a number — common real-world failure case. | Selected rows contain `"N/A"` in a numeric column. Anomaly record created with `anomaly_type="type_mismatch"`, column name, row index. Unit test included. | Done        |
| D6.3 | Add `inject_stale_timestamp()` to `anomaly_engine.py`. Shift timestamp value of selected rows backward by a random number of days (7–30 days). | Stale timestamps break time-windowed aggregations and late-data handling logic. | Selected rows have timestamps significantly older than surrounding rows. Anomaly record with `anomaly_type="stale_timestamp"`. Unit test included. | Done        |
| D6.4 | Add `inject_out_of_order()` to `anomaly_engine.py`. Take a small block of consecutive rows (2–4) and shuffle their order by swapping timestamps between them. | Out-of-order events break stream processing pipelines that assume chronological order. | Selected rows have timestamps that violate the ascending order of surrounding rows. Anomaly record with `anomaly_type="out_of_order"`. Unit test included. | Done        |
| D6.5 | Add `inject_late_arrival()` to `anomaly_engine.py`. Move selected rows to the end of the dataset and assign them a timestamp that is 7–30 days older than the last row's timestamp. | Late arrivals simulate events that happened in the past but arrived in the stream much later. | Selected rows appear at the end of the dataset with stale timestamps. Anomaly record with `anomaly_type="late_arrival"`. Unit test included. | Done        |
| D6.6 | Update `inject_anomalies()` in `anomaly_engine.py` to route selected anomaly types from the request. Currently splits rows into fixed thirds (outlier/missing/duplicate). Refactor to distribute rows across all requested types from `prompt` field or new `anomaly_types[]` field in `GenerateRequest`. | Anomaly types selected in the UI are actually injected — not ignored. | Request with `["nulls", "out_of_order", "type_mismatches"]` produces only those three types in the dataset. No unselected types appear. | Done        |
| D6.7 | Update `schemas.py`: add `anomaly_types: list[str]` field to `GenerateRequest`. Update `router.py` to pass `anomaly_types` to the engine. Update frontend `GenerateSection.tsx` to send `selectedAnomalies` as `anomaly_types` array instead of as a `prompt` string. | Clean contract between frontend and backend for anomaly type selection. | Backend receives explicit list of types, not a freeform string. `prompt` field can be removed or kept as optional. | Done        |
| D6.8 | Add `AnomalyType` enum values for new types in `schemas.py`: `type_mismatch`, `stale_timestamp`, `out_of_order`, `late_arrival`. Update `AnomalyTable.tsx` badge styles to cover new types. | New anomaly types are properly typed end-to-end and visually distinct in the results table. | New badge styles for each type. No TypeScript errors. | Not Started |
| D6.9 | Mark `Schema drift` as disabled in the UI sidebar in `forge-me/index.tsx`. Add `coming soon` label next to it. Remove it from the active anomaly selection logic. | Honest UI — user sees schema drift is planned but not yet available. | Checkbox is greyed out and non-clickable. "coming soon" label visible next to it. Not included in `selectedAnomalies` state. | Done        |
| D6.10 | Run full test suite after all engine changes. Verify all existing 15 tests still pass. Add new unit tests for each injector: subtle outlier, type mismatch, stale timestamp, out-of-order, late arrival. Target: 25+ tests total. | Regression safety — existing behavior unchanged, new behavior covered. | `uv run pytest -v` passes all tests from `backend/`. | Done        |

Что сделано в D6:

Тонкие аномалии ±3σ вместо ×10
Новые типы: type_mismatch, stale_timestamp, out_of_order, late_arrival
injectors.py выделен отдельно
anomaly_types передаётся с фронта на бэкенд явным списком
Цветные бейджи для всех типов
Schema drift в UI заблокирован с пометкой "soon"
24 теста


---

## Итерация 7 — Деплой

| Итерация | Задача | Цель | Ожидаемый результат | Статус |
|---|---|---|---|---|
| 7.1 | Деплой бэкенда на Railway. Настройка ENV переменных: `CLERK_SECRET_KEY`, `DATABASE_URL`. | Бэкенд доступен в облаке. | Railway деплой успешен, `/forge-me/health` отвечает в продакшне. | Not Started |
| 7.2 | Деплой фронтенда на Vercel. `VITE_CLERK_PUBLISHABLE_KEY` в ENV. Проверить связь с продакшн-бэкендом. | Фронтенд доступен по публичному URL. | Vercel деплой успешен, ForgeMe открывается, Generate работает против продакшн-бэкенда. | Not Started |
| 7.3 | Smoke-тесты в облаке: логин через Clerk, Generate датасета, отображение таблицы, активация модуля в MarketMe. | Убедиться что всё работает end-to-end в продакшне. | Все сценарии проходят без ошибок в облаке. | Not Started |
| 7.4 | Финальная полировка: loading states, обработка сетевых ошибок, пустые состояния, финальный UI cleanup. | Production-ready качество перед публичным запуском. | Нет необработанных ошибок, все loading states на месте, UI выглядит чисто. | Not Started |

---

## Известные технические долги (перенесено из iteration-log)

- `uv run` использует `backend/.venv`, `python` использует root `.venv` — всегда использовать `uv run` из `backend/`
- Clerk JWT не включает email/first_name по умолчанию — надёжен только `sub` (user ID)
- `defaultForNewUsers: true` в манифесте ForgeMe — логика авто-активации не реализована
- Browser extension (Exploratory Tester) вызывает `message channel closed` в консоли — безвредно, не наш код
- DuckDB timestamp приходит как Unix миллисекунды — делить на 1 (не на 1000) при `new Date()`

---

*Обновлено: май 2026.*