# Exploration: perfeccion-pwa

## Executive Summary

carta-miranda is a Next.js 16.2.4 + React 19 + TailwindCSS v4 private letter-writing app for two people (Leandro and Miranda). It stores letters in local JSON with optional Supabase backup.

**Current state after working-tree changes (22 modified files):** A massive refactor is mid-flight — the codebase has been converted from a dark glassmorphism theme to a warm paper/ink/wine design system. The build PASSES. The auth system works. The feed with infinite scroll works. **But there are data migration gaps, testing is broken, and PWA infrastructure is zero.**

**Key finding: The `exploration.md` from the prior session has several incorrect claims** that I validate below.

---

## Architecture Overview

### Stack
| Component | Version | Notes |
|---|---|---|
| Next.js | 16.2.4 | App Router |
| React | 19.2.4 | Server components by default |
| TailwindCSS | v4 | `@tailwindcss/postcss` v4 — no v3 compatibility layer |
| Supabase | ^2.104.0 | Optional, not configured in .env |
| TypeScript | ^5 | strict mode |
| Testing | node:test | No `"type": "module"` in package.json → tests FAIL at runtime |

### File Structure
```
src/
├── app/
│   ├── globals.css          ← Design tokens + paper/control/button CSS classes
│   ├── layout.tsx           ← Root layout (Piazzolla + Chivo fonts)
│   ├── page.tsx             ← Home: login OR feed (default) OR legacy dashboard
│   ├── loading.tsx          ← Skeleton loader (NEW — untracked)
│   ├── error.tsx            ← Error boundary with retry (NEW — untracked)
│   ├── [username]/
│   │   ├── page.tsx         ← Profile page (metadata per page now included)
│   │   └── write/page.tsx   ← Write form page
│   ├── letter/[id]/
│   │   ├── page.tsx         ← Letter detail with Spotify embed
│   │   └── edit/page.tsx    ← Letter edit (alias)
│   └── api/
│       ├── auth/{login,logout,me}/route.ts
│       ├── drafts/route.ts + [id]/{route,publish,update}
│       ├── feed/route.ts + route.test.ts
│       ├── letters/route.ts + [id]/{route,update,publish}  ← ALL DEPRECATED
│       ├── notifications/route.ts + [notificationId]/read/route.ts
│       └── internal/agent/{draft,send}/route.ts
├── components/
│   ├── dashboard.tsx              ← Refactored from glassmorphism to paper theme
│   ├── editorial-frame.tsx        ← NEW — layout wrapper
│   ├── home-sidebar.tsx           ← NEW — stats/notifications sidebar
│   ├── letter-editor.tsx          ← Full editor with history sidebar
│   ├── letter-history.tsx         ← Version history
│   ├── login-panel.tsx            ← Refactored to paper theme
│   ├── paper-sheet.tsx            ← NEW — paper container component
│   ├── spotify-embed.tsx          ← EXISTS and works (contrary to prior claim)
│   ├── write-form.tsx             ← Write form with preview
│   └── feed/ (8 files)           ← Full feed system
└── lib/
    ├── types.ts               ← All TypeScript types
    ├── constants.ts           ← Fixed accounts, seed data, config
    ├── store.ts               ← JSON file store + CRUD with write queue
    ├── store.test.ts          ← Cursor tests (fails to resolve)
    ├── auth.ts                ← HMAC-signed session cookies
    ├── supabase.ts            ← Optional Supabase client
    └── automation/
        ├── service.ts         ← Agent letter drafting
        └── providers.ts       ← Local/Noop providers
```

### Auth Flow
1. User hits `/` → `getCurrentUser()` checks cookie `carta-miranda-session`
2. No cookie → renders `<LoginPanel />` with account selector (Leandro/Miranda)
3. Login form POSTs to `/api/auth/login` → validates credentials → creates HMAC-signed cookie
4. Cookie is `${base64(payload)}.${hmac}` — verified with timing-safe compare
5. Sessions expire after 30 days

### Data Flow
```
readStore() → .data/carta-miranda.json (or Supabase fallback)
     ↓
mutateStore(mutator) → write queue → read → mutate → write
     ↓
Components receive data via server components or API routes
```

**Important:** The data file's `accounts` array is never read for local auth — `getAccountById()` uses `ACCOUNT_LOOKUP` from constants. Data file accounts only matter for Supabase persistence.

---

## Validation of Prior exploration.md Claims

### ✅ CORRECT CLAIMS

| Claim | Status | Evidence |
|---|---|---|
| Tailwind v3 accent classes broken | ✅ CONFIRMED | Committed constants had `accent: "from-rose-400 to-amber-300"` — Tailwind v4 doesn't support these |
| Duplicated API surface (`/api/letters` vs `/api/drafts`) | ✅ CONFIRMED | `/api/letters` routes all have DEPRECATED comments |
| Console.log in login route | ✅ CONFIRMED (fixed in working tree) | 4 console.log statements were committed, now removed |
| No PWA manifest/service worker | ✅ CONFIRMED | Zero PWA infrastructure exists |
| Dead CSS (`.paper-sheet__edge`, `.paper-inset-border`) | ✅ CONFIRMED | Not in current globals.css but mentioned in prior version |
| Paper-edge SVGs unreferenced | ✅ CONFIRMED | `public/paper-edge-*.svg` are untracked files, never imported |
| Missing `"type": "module"` | ✅ CONFIRMED | package.json lacks this, breaking node:test |
| Loading/error boundaries missing | ✅ CONFIRMED (now added) | Untracked `loading.tsx` and `error.tsx` exist in working tree |
| Auth is HMAC-signed cookies | ✅ CONFIRMED | Correct implementation with timingSafeEqual |
| Feed uses cursor-based pagination | ✅ CONFIRMED | Base64 cursor with `createdAt:id` format |

### ❌ INCORRECT OR OUTDATED CLAIMS

| Claim | Reality | Explanation |
|---|---|---|
| "Data file has `id: \"leo\"`" | ❌ FALSE — data file has `"leandro"` | The `.data/` directory is gitignored. Current working copy was likely regenerated from seed. Migration script exists as safety net. |
| "Spotify integration shows as plain text with ZERO value" | ❌ FALSE — `SpotifyEmbed` component EXISTS | `src/components/spotify-embed.tsx` parses track IDs and renders an `<iframe>`. It's used in `letter/[id]/page.tsx`. |
| "Credentials are plaintext in constants.ts" | ✅ TRUE but also applies to the data file | Both `constants.ts` and data file store passwords in plaintext — intentional for fixed accounts |
| "The visual is dark glassmorphism" | ❌ OUTDATED — working tree converts to paper/ink/wine | Committed version was dark/glass, but 22 modified files have refactored to the new design system |
| "No error.tsx or loading.tsx" | ❌ OUTDATED | Both exist as untracked files in working tree |

---

## Bug Inventory

### P0 — CRASHES ON EXISTING DATA

None found in the current state. The build compiles, pages render. The data file has correct account IDs.

**However**, the app CAN enter a broken state if:
- **Existing data file has `"leo"` IDs** (e.g., from a pre-migration backup restored manually). The migration script is prepared but NOT auto-run on startup.
- **Supabase data has `"leo"` IDs** — the migration script only handles local JSON, not Supabase.

### P1 — FUNCTIONAL BUT BROKEN

**B1: Duplicated API surface (3 dead endpoints)**
- Files: `src/app/api/letters/route.ts`, `src/app/api/letters/[id]/update/route.ts`, `src/app/api/letters/[id]/publish/route.ts`
- All marked DEPRECATED but still active and importable
- Creates confusion: dashboard originally posted to `/api/letters` (fixed to `/api/drafts` in working tree)
- **Fix:** Delete the 3 files, verify no imports reference them

**B2: Test infrastructure broken**
- `package.json` lacks `"type": "module"` → `node:test` tests fail with `ERR_MODULE_NOT_FOUND`
- Both test files (`store.test.ts`, `feed/route.test.ts`) are untracked but non-functional
- Also missing a `"test"` script in package.json
- **Fix:** Add `"type": "module"` to package.json + test script

**B3: Data file has stale values that diverge from constants**
- `.data/carta-miranda.json` accounts have old accent values: `"from-rose-400 to-amber-300"` (should be `"var(--wine)"`)
- Miranda's password is still `"luna"` in data file but constants changed to `"chigga"`
- **Impact:** If Supabase is enabled, the synced store will have wrong accent values and wrong password
- **Fix:** Add data migration to normalize accounts on first read to match constants

**B4: Immersive composer uses `btoa()` instead of `Buffer` for cursor encoding**
- File: `src/components/feed/immersive-composer-sheet.tsx` line 10-11
- `btoa(raw)` works in browsers but can fail with non-Latin1 characters
- The server-side `encodeFeedCursor` uses `Buffer.from(...).toString("base64")` which is correct
- **Fix:** Import and use the shared `encodeFeedCursor` from store.ts instead

### P2 — CODE QUALITY

**B5: Notification read route has inconsistent param name**
- Route file: `[notificationId]` (kebab-case with lowercase n)
- Should use consistent pattern — either all `[id]` or all descriptive. Creates confusion.

**B6: `"use client"` arguably unnecessary on some feed components**
- `feed-card-letter.tsx` has `"use client"` but only uses `confirm()` dialog — could be done with a form action
- `feed-card-activity.tsx` has `"use client"` but only for `fetch()` + `window.location.reload()` — debatable

**B7: No error handling for `generateMetadata` crashes**
- `src/app/[username]/page.tsx` `generateMetadata` calls `getProfileData()` — if it throws, metadata generation fails silently
- `src/app/letter/[id]/page.tsx` `generateMetadata` calls `getLetterDetail()` — same risk

**B8: No feed route test for cursor edge cases**
- `route.test.ts` only tests cursor parsing and error identification — missing tests for actual feed page loading

### P3 — POLISH

**B9: Spanish string inconsistencies**
- `"Credenciales invalidas"` → should be `"Credenciales inválidas"` (accent)
- `"Sin titulo"` → should be `"Sin título"` (accent)
- Mix of `"podes"` vs `"podés"` in Spanish UI strings
- `"tenés"` is correct (voseo) but some strings use tú forms

**B10: Feed timeout does not trigger retry**
- If feed load fails, the error shows "reintentar" but the retry mechanism only runs once per error
- After dismissing, no retry state is maintained

---

## PWA Gap Analysis

### What Exists: NOTHING

| Asset | Status | Notes |
|---|---|---|
| `manifest.json` | ❌ MISSING | Not in `public/` or generated by Next.js config |
| Service Worker | ❌ MISSING | No `sw.js`, no `next-pwa`, no custom SW |
| PWA icons | ❌ MISSING | Only `favicon.ico` exists, plus generic SVGs |
| `next.config.ts` PWA config | ❌ NOT CONFIGURED | NextConfig is empty — no `withPWA` or similar |
| Safari meta tags | ❌ MISSING | No `apple-mobile-web-app-capable`, no `apple-touch-icon` |
| iOS splash screens | ❌ MISSING | None |

### What's Needed for Baseline PWA

#### 1. Web App Manifest (`public/manifest.json`)
```json
{
  "name": "Carta Miranda",
  "short_name": "Carta M",
  "description": "Cartas privadas entre Leandro y Miranda",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f5efe6",
  "theme_color": "#722f37",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### 2. Service Worker (`public/sw.js` or generated)
- Cache static assets on install
- Network-first strategy for API routes
- Cache-first for letters and assets
- Handle push notification events

#### 3. iOS/Safari Support
- `<meta name="apple-mobile-web-app-capable" content="yes">` in layout.tsx
- `<link rel="apple-touch-icon" href="/icon-192.png">`
- `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`

#### 4. Next.js Config
- Can use `next-pwa` package (v5 for Next.js 16) or custom SW via `public/` directory
- OR: Use `serwist` (active fork of `next-pwa` for Next.js 16)

#### 5. PWA Icons
- Generate 192x192 and 512x512 PNG icons
- Use the wine accent color as theme

### Approach Comparison

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| **Custom SW in public/** | Zero dependencies, full control, no build config | Manual cache management, no precaching of Next.js chunks | Medium |
| **serwist** | Hooks into Next.js build, handles precaching, actively maintained | Dependency, config overhead | Low |
| **next-pwa (v5)** | Simple API, well-known | Abandoned? Last update uncertain | Low-Med |
| **PWA Asset Generator** | Auto-generates icons + manifest | Need SW separately | Low |

**Recommendation:** `serwist` — it's the most actively maintained PWA solution for modern Next.js (16.x), handles precaching of Next.js build output, and supports custom SW logic for push notifications.

---

## Push Notification Requirements

### Architecture Options

#### Option A: Web Push API (VAPID) — Native, No Third-Party
- **How:** Browser Push API + VAPID keys (generate via `web-push` npm package)
- **SW listens for `push` event** → shows notification
- **Server sends push** when a letter is published/updated
- **Requires:** VAPID key pair, permission request on client, subscription storage per user
- **iOS Support:** Safari 16+ on iOS 16.4+ supports Web Push for PWAs installed to homescreen. This is key for this project.
- **Cost:** Free (self-managed)
- **Effort:** Medium

```
Client: navigator.serviceWorker.register() 
     → PushManager.subscribe({userVisibleOnly: true, applicationServerKey: vapidPublicKey})
     → POST subscription to server

Server: webpush.sendNotification(subscription, payload)
     → POST /api/push/send triggers on publish/update
```

#### Option B: OneSignal — Managed Service
- **Pros:** No VAPID management, analytics, automatic fallback to email/SMS
- **Cons:** Third-party dependency, rate limits on free tier, privacy concerns
- **Cost:** Free tier (10k subscribers)
- **Effort:** Low

#### Option C: Firebase Cloud Messaging — Google Managed
- **Pros:** Reliable, well-documented
- **Cons:** Requires Firebase project, Google dependency, Play Services on Android
- **iOS:** Works via APNs proxy
- **Effort:** Medium

### Recommendation: Option A — Web Push API with VAPID

For an intimate two-person app, a third-party push service is overkill. The Web Push API with VAPID is:
- **Free** — no per-message costs
- **Self-contained** — no external dependencies beyond `web-push` npm package
- **iOS 16.4+ compatible** — Safari on iOS supports Web Push for installed PWAs
- **Simple** — only 2 users, 2 subscriptions to manage

### What's Needed

1. **Generate VAPID keys** — `npx web-push generate-vapid-keys`
2. **Service worker** with push event listener
3. **API: `POST /api/push/subscribe`** — save subscription
4. **API: `POST /api/push/unsubscribe`** — remove subscription
5. **Integration:** Call push on publish/update in `store.ts`
6. **Permission UI:** Request notification permission on first login or first publish
7. **Subscription storage:** Add to AppStore schema (pushSubscriptions array)
8. **Push data:** Title, body, icon, badge, letter URL

### Critical iOS Consideration

iOS Safari only supports Web Push for PWAs INSTALLED TO HOMESCREEN (not in-browser Safari). The app MUST have a valid manifest.json and be installable. This means:

1. Manifest must be complete and correct
2. Service worker must register successfully
3. User must "Add to Home Screen" before push works
4. Detect iOS: use `navigator.standalone` to show install prompt

---

## Code Quality Issues

### Dead Code to Remove
| File | Reason | Action |
|---|---|---|
| `src/app/api/letters/route.ts` | Duplicate of drafts | DELETE |
| `src/app/api/letters/[id]/update/route.ts` | Duplicate of drafts/[id]/update | DELETE |
| `src/app/api/letters/[id]/publish/route.ts` | Duplicate of drafts/[id]/publish | DELETE |
| `src/app/api/letters/[id]/route.ts` | Duplicate of drafts/[id] | DELETE |
| `src/app/api/internal/automation/route.ts` | Just re-exports agent/draft | DELETE |
| `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Default Next.js boilerplate | DELETE |
| `public/paper-edge-bottom.svg`, `public/paper-edge-top.svg` | Unreferenced | DELETE |

### Slop Patterns
- `rounded-[1.35rem]` in 7+ places — arbitrary LLM-generated value. Replace with `rounded-sm` or `0`.
- `bg-white/45`, `bg-white/40` in legacy components (already mostly removed in working tree, but let's verify nothing remains)
- `backdrop-blur-[2px]` — glassmorphism artifact in composer overlay
- `border-color: ${accent}55` in write-form (uses hex + opacity which creates inconsistent look)

### Inconsistencies
- **Letter links:** New components use `/letter/${id}` but old `/letters/` (plural) still exists in some references — need audit
- **Route param naming:** `[notificationId]` vs `[id]` — inconsistent across API routes
- **Date formatting:** `Intl.DateTimeFormat("es-AR")` is used everywhere — good consistency
- **UI labels:** Mixed `"volver"`/`"salir"`/`"entrar"` — all in Spanish, consistent

### Console.log Audit
✅ **FIXED** — The committed login route had 4 console.log statements. Working tree removes them.

---

## Build & Test Status

### Build: ✅ PASSES
```
✓ Compiled successfully in 1411ms
✓ TypeScript check passed
✓ All 13 pages generated (3 static, 10 dynamic)
✓ No TypeScript errors
```

**Warning (non-blocking):** Turbopack warns about dynamic `path.join` in `store.ts` — expected for a file-based store.

### Test: ❌ BROKEN
```
2 tests — 0 pass, 2 fail
```
Both test files fail with `ERR_MODULE_NOT_FOUND` because:
1. `package.json` has NO `"type": "module"` field
2. No `"test"` script configured
3. `node:test` cannot resolve the bare imports (`./store`, `./route`)

**Fix:**
```json
// package.json
{
  "type": "module",
  "scripts": {
    "test": "node --test src/**/*.test.ts"
  }
}
```

---

## Recommended Change Scope for "perfeccion-pwa"

### Phase 1: Fix & Clean (foundation) — ~2-3 hours
| Task | Effort | Priority |
|---|---|---|
| Delete dead API routes (/api/letters/*) | 5min | P1 |
| Add `"type": "module"` + test script | 5min | P1 |
| Normalize data file on first read (accent + password migration) | 15min | P1 |
| Replace `rounded-[1.35rem]` with proper values across all components | 10min | P2 |
| Replace `bg-white/*` glassmorphism remnants with paper tokens | 10min | P2 |
| Remove `backdrop-blur-[2px]` from composer overlay | 2min | P2 |
| Fix `btoa()` in immersive composer (use shared `encodeFeedCursor`) | 2min | P2 |
| Delete dead SVG files from public/ | 2min | P2 |
| Normalize Spanish strings (accents, vos/tú consistency) | 15min | P2 |
| Fix param naming consistency (`[notificationId]` → `[id]`) | 2min | P3 |
| Delete `internal/automation/route.ts` (dead re-export) | 1min | P2 |

### Phase 2: PWA Infrastructure — ~4-5 hours
| Task | Effort | Notes |
|---|---|---|
| Generate PWA icons (192x192, 512x512) | 15min | Use wine color |
| Create `public/manifest.json` | 15min | With theme_color matching wine |
| Install serwist and configure in next.config.ts | 30min | Active PWA solution for Next.js 16 |
| Register service worker with precaching | 30min | Handles offline for static assets |
| Add iOS/Safari meta tags to layout.tsx | 10min | apple-mobile-web-app-capable etc. |
| Add PWA install prompt for iOS (navigator.standalone detection) | 20min | Show instructions for "Add to Home Screen" |
| Generate VAPID keys and add to .env.example | 5min | |
| Create push subscription API routes | 30min | POST subscribe/unsubscribe |
| Add `pushSubscriptions` to AppStore schema and types | 15min | Store per-user subscriptions |
| Implement push on publish/update in store.ts | 20min | Call web-push after mutation |
| Create push notification service worker listener | 15min | Handle `push` event, show notification |
| Add notification permission request UI | 20min | On first interaction or publish |

### Phase 3: Polish & Edge Cases — ~1-2 hours
| Task | Effort | Notes |
|---|---|---|
| Add delete draft button to all relevant views | 10min | Card already has it, verify all |
| Add notification badge to feed header | ✅ Already done in social-feed-shell.tsx | |
| Mark-notifications-read in feed activity | ✅ Already implemented | |
| Verify all letter links use `/letter/` (not `/letters/`) | 10min | Audit all hrefs |
| Add confirm dialog for publish | 15min | Currently no confirmation |
| Test full push flow on iOS Safari | 30min | Requires physical device or simulator |

### What to EXCLUDE from this change
- **Supabase schema normalization** (breaking into real tables) — future improvement
- **Email notifications** — out of scope for "intimate channel" vision
- **Search across letters** — nice to have, not blocking
- **Account switching UI** — not requested, adds complexity
- **Offline letter editing** — beyond PWA baseline, could be future

### Total Estimated Effort: **~8-10 hours**
- Phase 1 (fix): 2-3 hours
- Phase 2 (PWA): 4-5 hours
- Phase 3 (polish): 1-2 hours

---

## Risks

1. **iOS Push limitations:** Safari on iOS only supports Web Push from installed PWAs (home screen). If the user doesn't install to home screen, push won't work. This MUST be documented and handled in the UI.
2. **VAPID key management:** If keys are lost, all subscriptions become invalid. Keys must be in .env and backed up.
3. **Service worker + Next.js 16 compatibility:** Next.js 16's Turbopack may have edge cases with SW. Test thoroughly.
4. **Data loss:** The migration script exists but is NOT auto-run. If a pre-migration Supabase backup is restored, "leo" IDs reappear.
5. **No staging environment:** Changes to push notifications require testing on production URL (HTTPS required for Push API).
6. **Offline UX:** Once PWA is enabled, the SW will cache pages. If the app is opened offline, the cached page will show stale data. Need to handle this gracefully.

---

## Ready for Proposal

**Yes.** The codebase is well-structured and the build passes. The migration to the paper design system is already mid-flight in the working tree. The two pillars (fix bugs + PWA) are clearly separable.

The proposal should:
1. **Phase 1:** Data migration + dead code removal + test fix (foundation)
2. **Phase 2:** PWA manifest + service worker + iOS support
3. **Phase 3:** Push notification infrastructure (Web Push API with VAPID)
4. **Phase 4:** Polish (Spanish strings, edge cases, final QA)
