### Push to git ###
```
doskey gp=git add . ^& git commit -m "update" ^& git push
```
then enter gp

---

### Backend ###
```
cd backend
uv run uvicorn core.main:app --reload
```

### Frontend ###
```
cd apps/hub
npm run dev
```

OR
```
npx turbo dev
```
```
uv run uvicorn core.main:app --reload
```

---

run tests:
```
uv run pytest -v
```

