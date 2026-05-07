# Auth — Feature Spec

> Scope: authentication and authorization across StackMe.
> Provider: Clerk (Google OAuth + email)

---

## Access model

| Page / Feature | Guest | Signed in |
|---|---|---|
| ForgeMe — generate | ✅ Open | ✅ Open |
| ForgeMe — analyze | ✅ Open | ✅ Open |
| MarketMe — view | ✅ Open | ✅ Open |
| MarketMe — activate module | ❌ Opens sign-in modal | ✅ Allowed |
| GET /api/me | ❌ 401 | ✅ Returns user data |
| GET /api/me/modules | ❌ 401 | ✅ Returns active modules |
| POST /api/modules/activate | ❌ 401 | ✅ Activates module |

**Rule: ForgeMe is fully open. Auth is only required for personalization (module activation, saved workspaces).**

---

## Clerk setup

- Provider: Google OAuth + email/password
- Mode: modal (not redirect) — `SignInButton mode="modal"`
- Session lifetime: 7 days (Hobby plan limit)
- Publishable key: `VITE_CLERK_PUBLISHABLE_KEY` (frontend)
- Secret key: `CLERK_SECRET_KEY` (backend)

---

## Frontend auth flow

```
User clicks "Sign in" in sidebar
  → Clerk modal opens
  → User authenticates (Google or email)
  → Modal closes, sidebar updates to show email + "Sign out"
  → MarketMe activation buttons become active
```

Components used:
- `<SignInButton mode="modal">` — opens modal
- `<SignOutButton>` — signs out
- `useUser()` — `{ isSignedIn, user }`
- `useClerk()` — `{ openSignIn }`

Getting JWT token in frontend:
```typescript
const token = await window.Clerk.session.getToken()
// Use in Authorization header: `Bearer ${token}`
```

---

## Backend JWT verification

Located in `backend/core/auth.py`

Flow:
1. Extract Bearer token from `Authorization` header
2. Fetch JWKS from `https://api.clerk.com/v1/jwks` (cached in memory)
3. Match `kid` from token header to JWKS key
4. Decode and verify JWT using `python-jose` with `RS256`
5. Return payload (`sub` = Clerk user ID)

Two dependency functions:
- `get_current_user` — raises 401 if not authenticated
- `get_optional_user` — returns `None` if not authenticated (for optional auth)

User ID in payload: `payload.get("sub")` → format: `user_3Cs28L1miimxO1ZV0ztyIqYzdJr`

Note: email and first_name are `null` in JWT payload by default — Clerk does not include them unless configured in dashboard.

---

## Default module activation

Modules with `defaultForNewUsers: true` in their manifest should be auto-activated on first login.

Current status: **not yet implemented** — ForgeMe has `defaultForNewUsers: true` in manifest but auto-activation logic is not wired up yet.

When implemented:
```python
# On first login / registration webhook from Clerk:
defaults = [m for m in MODULE_REGISTRY if m.defaultForNewUsers]
for module in defaults:
    activate_module(user_id, module.id)
```

---

## Environment variables

| Variable | Location | Value |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | `apps/hub/.env` + Vercel | `pk_test_...` |
| `CLERK_SECRET_KEY` | `backend/.env` + Railway | `sk_test_...` |

---

## What auth does NOT handle

- Role-based access control (future)
- Billing / subscription tiers (future)
- Organization / team accounts (future)

---

*Created: April 2026. Update when auth behaviour changes.*
