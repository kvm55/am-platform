# AM Platform — UX/UI Audit

**Date:** 2026-02-17
**Goal:** Polish roadmap for Feb 24 demo
**Production:** https://am-platform.vercel.app

---

## 1. User Flows

### Flow A: Sign In → Dashboard
```
Landing (/) → Sign In (/signin) → Dashboard (/dashboard)
                                  ├── Tool Cards → Comp Analysis / Portfolio / Underwriting
                                  ├── Recent Analyses list → (no click-through)
                                  └── Recent Models list → (no click-through)
```

### Flow B: Comp Analysis
```
Dashboard → Comp Analysis (/tools/comp-analysis)
            ├── Input: address (required), premium rent, comments
            ├── Submit → POST /api/analyze
            └── Results (inline, same page):
                ├── Subject Property card
                ├── Score Card (bar charts) + Rent Recommendation (side by side)
                ├── Comparable Properties table
                ├── Vacancy Loss Analysis (metrics + scenarios table + loss grid)
                └── Rentometer Market Data (stats + nearby comps table)
```

### Flow C: Portfolio Summary
```
Dashboard → Portfolio (/tools/portfolio)
            ├── Auto-loads GET /api/portfolio
            ├── Metrics bar (4 cards)
            ├── Sortable table (address, rent, score, grade, $/sqft, comps, date)
            └── CSV Export button → GET /api/portfolio/export
```

### Flow D: Underwriting
```
Dashboard → Underwriting (/tools/underwriting)
            ├── Investment type toggle (LTH / F&F / STR) — resets form
            ├── Multi-section form (Property, Acquisition, Debt, Income, Expenses, Disposition)
            ├── Submit → POST /api/underwrite
            └── Results (inline, same page):
                ├── Recommendation banner (Buy/Hold/Sell + confidence + factors)
                ├── Key Metrics grid (IRR, cap rate, DSCR, cash-on-cash, equity multiple)
                ├── Financial Summary (Sources & Uses, Income & NOI, Cash Flow, Disposition)
                └── Year-by-year projections table (9 columns)
```

### Flow E: Sign Up
```
Landing → Sign Up (/signup) → "Check your email" success state → Sign In
```

---

## 2. Component Structure

```
layout.tsx
├── AuthProvider (context/AuthContext.tsx)
├── Header.tsx
│   ├── Logo link (→ dashboard if auth, → landing if not)
│   ├── Desktop nav: Dashboard, Tools dropdown (3 links), Sign Out
│   └── Mobile nav: hamburger → flat list of all links
├── <main> (route content)
│   ├── page.tsx — Landing (unauthenticated)
│   ├── signin/page.tsx — Sign In form (Suspense wrapper)
│   ├── signup/page.tsx — Sign Up form + success state
│   ├── dashboard/page.tsx — Tool cards + recent activity
│   ├── tools/comp-analysis/page.tsx — Form + inline results
│   │   └── ScoreBar (local component)
│   ├── tools/portfolio/page.tsx — Auto-load + metrics + table
│   └── tools/underwriting/page.tsx — Type toggle + form + results
│       ├── InputField (local component)
│       ├── Section (local component)
│       └── MetricCard (local component)
└── Footer.tsx
```

### API Routes (9 total)
| Route | Methods | Auth | Mock Mode |
|---|---|---|---|
| `/api/analyze` | POST | Yes | Yes |
| `/api/analyze/[id]` | GET | Yes | Yes |
| `/api/analyses` | GET | Yes | Yes |
| `/api/portfolio` | GET | Yes | Yes |
| `/api/portfolio/export` | GET | Yes | Yes |
| `/api/underwrite` | GET, POST | Yes | Yes |
| `/api/underwrite/[id]` | GET, PUT, DELETE | Yes | Yes |
| `/api/properties` | GET, POST | Yes | Yes |
| `/api/properties/[id]` | GET, PUT, DELETE | Yes | Yes |

---

## 3. Gap Analysis

### 3A. Loading States

| Location | Current | Issue | Priority |
|---|---|---|---|
| Dashboard | `animate-pulse "Loading..."` text only | No skeleton cards for tool grid or activity lists | Medium |
| Portfolio | `animate-pulse "Loading portfolio..."` text only | No skeleton for metrics bar or table | Medium |
| Comp Analysis submit | Spinner on button + "Running Analysis..." | Good — button disables, shows spinner | Done |
| Underwriting submit | Spinner on button + "Running Model..." | Good — button disables, shows spinner | Done |
| Sign In submit | Button text changes to "Signing in..." | No spinner icon, inconsistent with tools | Low |
| Sign Up submit | Button text changes to "Creating account..." | No spinner icon, inconsistent with tools | Low |
| Header auth check | None — renders nothing until auth resolves | Brief flash of no-nav on page load | Low |

### 3B. Empty States

| Location | Current | Issue | Priority |
|---|---|---|---|
| Dashboard (no analyses) | "No analyses yet" + link to comp analysis | Good | Done |
| Dashboard (no models) | "No underwriting models yet" + link to UW | Good | Done |
| Portfolio (no data) | "No analyses yet" + descriptive text | Good but no CTA link to comp analysis | Low |
| Comp Analysis (before submit) | Just the form | Could benefit from a sample/demo prompt | Low |
| Underwriting (before submit) | Just the form with defaults | Good — form pre-populated with defaults | Done |

### 3C. Error Handling

| Location | Current | Issue | Priority |
|---|---|---|---|
| Comp Analysis | Red text in red-50 bg box | Good | Done |
| Underwriting | Red text in red-50 bg box | Good | Done |
| Portfolio | Red text in red-50 bg box | Good | Done |
| Sign In | Red text in red-50 bg | Good | Done |
| Sign Up | Red text in red-50 bg + password validation | Good | Done |
| Dashboard fetch failures | Silent `.catch(() => {})` | Fails silently — no error shown if API is down | **High** |
| Portfolio export | Silent failure `if (!resp.ok) return` | No user feedback if export fails | Medium |
| Network errors (global) | None | No global error boundary or offline detection | Low |

### 3D. Mobile Responsive

| Location | Current | Issue | Priority |
|---|---|---|---|
| Header | Hamburger menu at `md:` breakpoint | Good | Done |
| Landing page | Centered, `px-4` padding | Good | Done |
| Dashboard tool cards | `grid-cols-1 md:grid-cols-3` | Good | Done |
| Dashboard activity | `grid-cols-1 lg:grid-cols-2` | Good | Done |
| Comp Analysis form | `grid-cols-1 md:grid-cols-2` | Good | Done |
| Comp results tables | `overflow-x-auto` on all tables | Good — horizontal scroll | Done |
| Score + Rent side-by-side | `grid-cols-1 lg:grid-cols-2` | Good | Done |
| Vacancy metrics | `grid-cols-2 md:grid-cols-4` | Good | Done |
| Vacancy loss grid | `grid-cols-3 md:grid-cols-6` | Good | Done |
| Portfolio metrics | `grid-cols-2 md:grid-cols-4` | Good | Done |
| Portfolio table | `overflow-x-auto` | Good | Done |
| UW form sections | `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` | Good | Done |
| UW key metrics | `grid-cols-2 md:grid-cols-4 lg:grid-cols-5` | Good | Done |
| UW financial summary | `grid-cols-1 lg:grid-cols-2` | Good | Done |
| UW year-by-year table | `overflow-x-auto` | Scroll works but 9 columns cramped on mobile | Medium |
| Auth pages | `max-w-md` centered | Good | Done |
| Footer | `flex-col sm:flex-row` | Good | Done |
| **Touch targets** | Default link/button sizes | Some text links small; 44px min recommended | Medium |
| **Sort indicators** | ASCII `^` and `v` in table headers | Tiny on mobile, use proper chevron icons | Low |

### 3E. Navigation & Flow Gaps

| Gap | Description | Priority |
|---|---|---|
| No analysis detail view | Dashboard "Recent Analyses" items aren't clickable. No `/tools/comp-analysis/[id]` route exists to view saved results. | **High** |
| No UW model detail view | Dashboard "Recent Models" items aren't clickable. No way to reload a saved model. | **High** |
| No "back to results" after analysis | After running comp analysis, scrolling back up is the only navigation. No anchor links or "New Analysis" button at bottom. | Medium |
| No breadcrumbs | Tool pages don't show where you are: `Dashboard > Tools > Comp Analysis` | Low |
| No "Run Another" reset | After comp analysis results display, user must manually clear the form to run a new one | Medium |
| Portfolio → analysis deep link | Portfolio table rows aren't clickable. No way to drill into a specific analysis from portfolio view. | **High** |
| Tools dropdown doesn't close on outside click | Only closes on `onMouseLeave`. Click outside leaves it open. | Medium |
| Landing page shows header with no nav when unauthenticated | Header renders logo only — looks intentional but slightly bare | Low |
| No 404 page | Missing custom 404 for bad routes | Low |

### 3F. Visual Polish

| Item | Description | Priority |
|---|---|---|
| No favicon | Browser tab shows default Next.js icon | **High** |
| No web fonts loaded | `Plus Jakarta Sans` / `Source Sans Pro` declared in CSS but never imported via `<link>` or `@font-face`. Falls back to system-ui. | **High** |
| Loading skeleton | Text-only loading states look unfinished. Skeleton cards/rows would look polished. | Medium |
| Sort indicator icons | Portfolio table uses `^` and `v` text. Use proper chevron SVGs. | Low |
| Page transitions | Hard page swaps. Could add subtle fade/slide. | Low |
| Scroll to results | After comp analysis or UW submit, page doesn't auto-scroll to results. User must scroll manually. | Medium |
| Table header styling | Comps table headers use `rounded-tl-lg`/`rounded-tr-lg` but middle columns don't connect smoothly if table wraps | Low |
| Footer sticks | `mt-auto` on footer works, but on short pages the footer may float mid-screen if content is minimal | Low |
| Dashboard welcome | Shows raw email `kris@test.com`. Could show a name or just "Welcome back" | Low |
| Input focus rings | Consistent `focus:ring-2 focus:ring-teal` across all inputs | Done |

### 3G. Data & API Integration

| Item | Description | Priority |
|---|---|---|
| Dashboard fetches aren't auth-gated | Dashboard renders even during auth loading, fetches fire immediately — may 401 before session hydrates | Medium |
| Dashboard `useEffect` has no deps on user | Fetches fire once on mount, not when user is confirmed authenticated | Medium |
| Portfolio export has no loading state | Button has no disabled/spinner while CSV generates | Low |
| Comp analysis doesn't link to saved analysis | API returns `analysisId` but UI doesn't use it for navigation | Medium |
| UW model doesn't link to saved model | API returns `modelId` but UI doesn't use it for navigation | Medium |
| `formatCurrency` duplicated | Defined locally in 3 files (dashboard, comp-analysis, portfolio). Should be shared util. | Low |
| No data refresh | Dashboard/portfolio show stale data after running a new analysis unless page is reloaded | Medium |

---

## 4. Task Breakdown — UI Polish for Feb 24 Demo

### P0 — Must Ship (Demo Blockers)

| # | Task | File(s) | Effort |
|---|---|---|---|
| 1 | **Add web fonts** — Import Plus Jakarta Sans + Source Sans Pro via Google Fonts `<link>` in layout.tsx `<head>` or globals.css `@import` | `src/app/layout.tsx` | 15 min |
| 2 | **Add favicon** — Create or source Propwell favicon (P or Propwell mark), add to `/app/favicon.ico` and `/app/icon.png` | `src/app/favicon.ico`, `src/app/icon.png` | 15 min |
| 3 | **Dashboard fetch timing** — Gate API fetches on `user` being non-null. Add `user` to useEffect deps. | `src/app/dashboard/page.tsx:73-83` | 15 min |
| 4 | **Dashboard silent error** — Show error state if analyses or models fetch fails instead of swallowing with `.catch(() => {})` | `src/app/dashboard/page.tsx:73-83` | 20 min |
| 5 | **Seed 3-5 demo properties** — Run comp analysis for 3-5 addresses so dashboard and portfolio have data for the demo | Manual via production UI | 30 min |

### P1 — Should Ship (Demo Quality)

| # | Task | File(s) | Effort |
|---|---|---|---|
| 6 | **Scroll to results** — After comp analysis or UW submit, `scrollIntoView` the results section | `src/app/tools/comp-analysis/page.tsx:73`, `src/app/tools/underwriting/page.tsx:129` | 15 min |
| 7 | **"Run Another" button** — Add button at bottom of comp analysis results to reset form + clear results | `src/app/tools/comp-analysis/page.tsx` (bottom of results div) | 15 min |
| 8 | **Tools dropdown close on outside click** — Add click-away listener or use a proper dropdown pattern | `src/components/Header.tsx:28-54` | 20 min |
| 9 | **Portfolio empty state CTA** — Add "Run a comp analysis" link to portfolio empty state | `src/app/tools/portfolio/page.tsx:150-153` | 5 min |
| 10 | **Portfolio export error feedback** — Show toast or inline error if CSV export fails | `src/app/tools/portfolio/page.tsx:55-65` | 15 min |
| 11 | **Loading skeletons** — Replace text-only loading with skeleton card components on Dashboard and Portfolio | `src/app/dashboard/page.tsx:85-91`, `src/app/tools/portfolio/page.tsx:87-93` | 30 min |
| 12 | **Auth spinner on sign in/up** — Add spinner icon to Sign In and Sign Up buttons to match tool submit patterns | `src/app/signin/page.tsx:78-83`, `src/app/signup/page.tsx:118-123` | 10 min |

### P2 — Nice to Have (Post-Demo)

| # | Task | File(s) | Effort |
|---|---|---|---|
| 13 | **Analysis detail route** — Create `/tools/comp-analysis/[id]/page.tsx` that loads saved analysis from `GET /api/analyze/[id]`. Make dashboard + portfolio items clickable. | New file + `dashboard/page.tsx`, `portfolio/page.tsx` | 2 hr |
| 14 | **UW model detail route** — Create `/tools/underwriting/[id]/page.tsx` that loads saved model. Make dashboard items clickable. | New file + `dashboard/page.tsx` | 2 hr |
| 15 | **Extract shared utilities** — Move `formatCurrency`, `formatNumber`, `formatPercent` to `src/lib/format.ts` | New file, update 3 page files | 20 min |
| 16 | **Sort indicator icons** — Replace `^`/`v` text with proper SVG chevrons in portfolio table | `src/app/tools/portfolio/page.tsx:163-184` | 15 min |
| 17 | **Breadcrumbs component** — Add `Dashboard > Tools > Comp Analysis` trail to tool pages | New `Breadcrumbs.tsx`, update 3 tool pages | 30 min |
| 18 | **Custom 404** — Add `not-found.tsx` with branded message | New `src/app/not-found.tsx` | 15 min |
| 19 | **Data refresh after action** — After running an analysis, dashboard/portfolio refetch or use router.refresh() | Dashboard, portfolio pages | 30 min |
| 20 | **Global error boundary** — Add `error.tsx` at app level with branded error message | New `src/app/error.tsx` | 20 min |
| 21 | **Stale data on portfolio** — Portfolio should refetch when navigating back after creating new analysis | `src/app/tools/portfolio/page.tsx` | 20 min |

---

## 5. Recommended Demo Flow (Feb 24)

1. **Sign in** at https://am-platform.vercel.app/signin with `kris@test.com` / `test1234`
2. **Dashboard** — show 3 tool cards + recent activity (pre-seeded)
3. **Comp Analysis** — live demo: enter an address, wait for results, walk through score card, rent recommendation, comps table, vacancy analysis
4. **Portfolio** — show aggregated view of all analyzed properties, sort by score, click export
5. **Underwriting** — run a Long Term Hold model, show recommendation banner + key metrics + year-by-year projections
6. **Toggle to Fix & Flip** — show how form adapts to different investment types

### Pre-Demo Checklist
- [ ] Tasks 1-5 (P0) completed and deployed
- [ ] 3-5 demo properties seeded
- [ ] Test full flow on mobile (phone)
- [ ] Test in Chrome + Safari
- [ ] Verify Vercel deployment is current (`git push` triggers auto-deploy)

---

## 6. Summary

**What's solid:**
- All 3 tools functional end-to-end (form → API → results)
- Mobile responsive grid system is thorough
- Brand tokens (colors, fonts declared) applied consistently
- Auth flow works (sign in, sign up, sign out, protected routes)
- Error display patterns consistent across all tools
- Submit buttons have loading spinners (comp analysis + UW)
- Empty states on dashboard with CTAs

**Critical fixes for demo (P0):**
1. Web fonts not loading (falling back to system-ui)
2. No favicon
3. Dashboard fetch race condition with auth
4. Dashboard silently swallows API errors
5. Need demo data seeded

**Estimated effort:** P0 = ~1.5 hours, P1 = ~2 hours, P2 = ~7 hours
