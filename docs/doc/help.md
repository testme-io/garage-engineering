## Push to git: ##
```
doskey gp=git add . ^& git commit -m "update" ^& git push
```
then enter gp

```
git add . && git commit -m "update" && git push
```
---
## RUN SEVER: ##
### Backend ###
```
cd backend
uv run uvicorn core.main:app --reload
```
Swagger
```
http://localhost:8000/docs
```

### Frontend ###
```
cd apps/hub
npm run dev
```

---

## RUN TESTS: ##

### ForgeMe ###
```
cd "D:\My projects\StackMe\backend\services\forge_me"
uv run pytest tests/ -v
```

## AnalyzeMe ##

```

```

