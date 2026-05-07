# Environment Variables Reference

> All environment variables used in StackMe.
> Never commit .env files — they are in .gitignore.

---

## Frontend — apps/hub/.env

| Variable | Required | Example | Description |
|---|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ Yes | `pk_test_abc123...` | Clerk publishable key for frontend auth |
| `VITE_API_URL` | ⏳ Prod only | `https://stackme-api.railway.app` | Backend URL (defaults to localhost:8000 in dev) |

File location: `apps/hub/.env`

---

## Backend — backend/.env

| Variable | Required | Example | Description |
|---|---|---|---|
| `CLERK_SECRET_KEY` | ✅ Yes | `sk_test_abc123...` | Clerk secret key for JWT verification |
| `DATABASE_URL` | ⚠️ Optional | `postgresql://user:pass@host/db` | If not set, falls back to SQLite (`stackme.db`) |

File location: `backend/.env`

---

## Railway (Production)

Set these in Railway dashboard → your service → Variables:

**Backend service:**
- `CLERK_SECRET_KEY` — copy from Clerk dashboard
- `DATABASE_URL` — auto-set by Railway when PostgreSQL is attached

**PostgreSQL service:**
- Auto-configured by Railway, `DATABASE_URL` injected into backend

---

## Vercel (Production)

Set these in Vercel dashboard → your project → Settings → Environment Variables:

- `VITE_CLERK_PUBLISHABLE_KEY` — copy from Clerk dashboard
- `VITE_API_URL` — your Railway backend URL

---

## Clerk dashboard

Find your keys at: `https://dashboard.clerk.com` → your app → API Keys

- **Publishable key** (`pk_test_...`) → frontend
- **Secret key** (`sk_test_...`) → backend only, never expose to frontend

---

## Notes

- `DATABASE_URL` from Railway may start with `postgres://` — `config.py` automatically replaces it with `postgresql://` for SQLAlchemy compatibility
- All `VITE_` prefixed variables are exposed to the browser bundle — never put secrets there
- `.env` files are gitignored in both `apps/hub/` and `backend/`

---

*Last updated: April 2026*
