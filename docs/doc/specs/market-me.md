# MarketMe — Feature Spec

> Scope: the marketplace page where users discover and activate tools.
> Route: `/market-me` · File: `apps/hub/src/pages/MarketMe.tsx`

---

## What it does

MarketMe is the page where users see all available tools in StackMe and add them to their sidebar. It is the only place where module activation happens.

---

## Data model

```
Table: user_modules
─────────────────────────────────────────
id            INTEGER   primary key
user_id       STRING    Clerk `sub` field (e.g. "user_3Cs28L1...")
module_id     STRING    manifest id (e.g. "forge-me")
activated_at  DATETIME  UTC timestamp
─────────────────────────────────────────
Unique constraint: (user_id, module_id)
```

**Important:** the DB stores only `user_id + module_id`. All module metadata (name, description, route, component) lives in the frontend registry, never in the DB.

---

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/me/modules` | Required | Returns list of active module IDs for current user |
| `POST` | `/api/modules/activate` | Required | Activates a module. Body: `{ module_id: string }` |
| `DELETE` | `/api/modules/{module_id}` | Required | Deactivates a module |

Response format for `GET /api/me/modules`:
```json
{ "modules": ["forge-me", "analyze-me"] }
```

Response format for `POST /api/modules/activate`:
```json
{ "status": "activated", "module_id": "forge-me" }
// or if already active:
{ "status": "already_active", "module_id": "forge-me" }
```

---

## Access rules

- **Guest (not signed in)**: can view MarketMe, sees all modules listed, button shows "Sign in to add" which opens Clerk modal
- **Signed in**: can activate and deactivate modules
- **ForgeMe**: has `defaultForNewUsers: true` in manifest — auto-activated on first login (handled by registration flow, not by MarketMe)

---

## Frontend state

```typescript
type ModuleState = {
  [moduleId: string]: 'active' | 'loading' | 'inactive'
}
```

- On mount: if signed in → fetch `/api/me/modules` → populate `moduleStates`
- On mount: if guest → skip fetch, all modules show as `inactive`
- Activation/deactivation: optimistic UI — set `loading` immediately, revert on error

---

## UI behaviour

- Module card shows: category badge, name, description, action button
- Button states: `Add` (inactive + signed in) · `Sign in to add` (inactive + guest) · `Remove` (active) · `...` (loading)
- Active card: highlighted border (`border-primary/30`) and background (`bg-primary/5`)
- Sign-in banner shown at top for guests

---

## i18n keys used

```
marketplace.title
marketplace.subtitle
marketplace.add
marketplace.remove
marketplace.signInToAdd
marketplace.signInBanner
marketplace.signInLink
```

---

## What MarketMe does NOT do

- Does not store module metadata (name, icon, description) in DB
- Does not handle routing — routes are built from `MODULE_REGISTRY` in `App.tsx`
- Does not auto-activate modules — that is handled at registration time via `defaultForNewUsers`
- Does not handle billing or access tiers (future feature)

---

## Future considerations

- Filter modules by category
- Module ratings and reviews
- Paid/free tier distinction
- "New" badge for recently added modules

---

*Created: April 2026. Update when MarketMe behaviour changes.*