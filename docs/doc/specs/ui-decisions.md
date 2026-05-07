# UI Decisions

> Design system choices and rules for StackMe frontend.
> All new UI must follow these decisions.

---

## Design style

- **Visual style**: minimalist and clean (Linear, Vercel aesthetic)
- **Theme**: dark/light with toggle — dark is default
- **Density**: compact, no excessive padding
- **Typography**: system font stack via Tailwind defaults

---

## Tech stack

| Tool | Version | Notes |
|---|---|---|
| Tailwind CSS | v4 | Via `@tailwindcss/vite` plugin |
| Shadcn/ui | Latest | Nova preset, Radix primitives |
| Lucide React | Latest | Icon library |
| i18next | Latest | With `react-i18next` and browser language detector |

---

## Theme system

Implemented via `apps/hub/src/hooks/useTheme.ts`

- Reads from `localStorage` on init, falls back to OS preference
- Applies `dark` or `light` class to `document.documentElement`
- Tailwind dark mode via `@custom-variant dark (&:is(.dark *))`
- Toggle button in AppShell sidebar (Sun/Moon icon)

**Always use CSS variables, never hardcode colors:**
```tsx
// ✅ Correct
className="bg-background text-foreground border-border"
className="text-muted-foreground"
className="bg-primary text-primary-foreground"

// ❌ Wrong
style={{ background: '#fff', color: '#111' }}
className="bg-white text-black"
```

---

## Sidebar (AppShell)

Width: `220px` fixed  
Structure (top to bottom):
1. Logo "StackMe" — `text-sm font-medium`
2. `+ MarketMe` link
3. Separator `h-px bg-border`
4. Module links (from `MODULE_REGISTRY`)
5. `mt-auto` spacer pushes bottom section down
6. Language dropdown (Globe icon + current lang code)
7. Theme toggle (Sun/Moon icon + label)
8. User email (if signed in) or Sign in button

Active nav item style:
```tsx
'bg-background border border-border font-medium text-foreground'
```

Inactive nav item style:
```tsx
'text-muted-foreground hover:text-foreground hover:bg-muted'
```

---

## Language switcher

- Trigger: Globe icon + current language code (EN / ES / UK)
- Dropdown: `DropdownMenu` from Shadcn, `side="right"`
- Options: `EN — English`, `ES — Español`, `UK — Українська`
- Detection order: `localStorage` → browser navigator
- Saves to `localStorage` on change

---

## i18n rules

- All text through `t('namespace.key')` — no hardcoded strings in JSX
- Namespace: `common` (single namespace for now)
- Key structure: `{page}.{element}` e.g. `forge.generate`, `marketplace.add`
- Translation files: `apps/hub/src/i18n/locales/{en|es|uk}/common.json`
- Default language: `en`
- Supported: `en`, `es`, `uk`

---

## Component patterns

### Form inputs
```tsx
className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
```

### Primary button
```tsx
className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
```

### Secondary/outline button
```tsx
className="px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
```

### Error message
```tsx
className="px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20"
```

### Info/stats bar
```tsx
className="flex gap-4 px-4 py-3 rounded-lg bg-muted/50 border border-border text-sm"
```

### Card/panel
```tsx
className="rounded-xl border border-border bg-background p-5"
```

### Active card (e.g. activated module)
```tsx
className="border-primary/30 bg-primary/5"
```

---

## Anomaly highlighting (AnomalyTable)

| Element | Style |
|---|---|
| Anomalous row | `bg-amber-50 dark:bg-amber-950/20` |
| Anomalous cell | `text-amber-700 dark:text-amber-400 font-medium` + amber background |
| NULL value | `text-destructive font-medium text-xs` displays as "NULL" |
| Even rows | `bg-background` |
| Odd rows | `bg-muted/20` |

---

## Category badges (MarketMe)

```typescript
const categoryColors = {
  generation: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  analytics:  'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  testing:    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
}
```

---

## Path aliases

`@/` maps to `apps/hub/src/` — use for Shadcn component imports:
```tsx
import { Button } from '@/components/ui/button'
```

Use relative imports for module-internal files:
```tsx
import { AnomalyTable } from './AnomalyTable'
import apiClient from '../../api/client'
```

---

## What we do NOT use

- Inline `style={{}}` — use Tailwind classes only
- Hardcoded color values — use CSS variables via Tailwind
- Separate CSS files per component — Tailwind utility classes only
- `px` font sizes — use Tailwind text size classes (`text-sm`, `text-xs`, etc.)

---

*Last updated: April 2026. Update when design decisions change.*
