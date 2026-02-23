# Propwell AMP Platform — Status

## Current State
**Phase:** Demo-ready. Test user provisioned. Handoff brief delivered. Awaiting API subscription approvals.
**Last updated:** 2026-02-23

### What's Built
- Next.js 16 web app with Supabase auth, Tailwind 4, TypeScript
- **Comp Analysis Tool** — address input, automated analysis via RentCast + Rentometer APIs, full results display (subject, comps table, rent rec, vacancy scenarios, rentometer data, property scoring)
- **Portfolio Summary** — aggregated metrics, sortable table with SVG sort icons, CSV export, manual refresh button
- **Underwriting Models** — Long Term Hold / Fix & Flip / Short Term Rental, full input forms, IRR/Cap Rate/DSCR/equity multiple calculations, year-by-year projections, buy/hold/sell recommendations
- **Dashboard** — tool cards, recent analyses + models with links to detail views
- **Auth** — Supabase OAuth (sign in / sign up / callback), two users provisioned (kris@test.com, jgravelle@propwell.co)
- **Shared format utils** (`src/lib/format.ts`) — canonical formatCurrency, formatPercent, formatNumber, gradeColorClass
- **Breadcrumbs** on all tool pages (Dashboard > Tool)
- **Analysis detail view** (`/tools/comp-analysis/[id]`) — full read-only view of saved analyses
- **Underwriting detail view** (`/tools/underwriting/[id]`) — full read-only view of saved models
- **Global error boundary** (`error.tsx`) — branded error state with Try Again / Go Home
- **Custom 404** (`not-found.tsx`) — branded page-not-found
- **Stale data refresh** — router.refresh() after submissions, manual refresh on portfolio
- **Propwell AMP branding** — bolt icon, inverted teal/greenery colors, header/footer/favicon
- **Deployed** to Vercel at https://am-platform.vercel.app

### Deliverables
| File | Description |
|------|-------------|
| `src/lib/format.ts` | Shared formatting utilities (currency, percent, number, grade colors) |
| `src/app/error.tsx` | Global error boundary |
| `src/app/not-found.tsx` | Custom 404 page |
| `src/components/Breadcrumbs.tsx` | Reusable breadcrumb navigation component |
| `src/components/AmpBoltIcon.tsx` | Brand bolt icon component |
| `src/app/tools/comp-analysis/[id]/page.tsx` | Analysis detail view |
| `src/app/tools/underwriting/[id]/page.tsx` | Underwriting model detail view |
| `src/app/dashboard/page.tsx` | Dashboard with linked recent items |
| `src/app/tools/comp-analysis/page.tsx` | Comp analysis with breadcrumbs + stale refresh |
| `src/app/tools/portfolio/page.tsx` | Portfolio with SVG sort icons, refresh button, clickable rows |
| `src/app/tools/underwriting/page.tsx` | Underwriting with breadcrumbs + stale refresh |
| `HANDOFF_JEFF.md` | Full handoff doc for Jeff Gravelle |
| `scripts/generate_weekly_brief.py` | Branded PDF generator for weekly briefs |

## Last Session (2026-02-23)

### Jeff Gravelle Handoff + Budget Review
- **Created test user** for Jeff Gravelle (jgravelle@propwell.co) in Supabase auth with identity record
- **Reviewed AM_Pipeline_Financial_Model.xlsx** (6 tabs) — all formulas verified, scenarios modeled, breakeven Month 1
- **Reviewed propwell_AM budget model_021326.xlsx** — flagged stale HC pricing ($20/mo should be $165.83/mo) and empty data cost rows (74-87)
- **Created HANDOFF_JEFF.md** — full handoff document with test credentials, API cost breakdown, production cost comparison, action items
- **Generated branded PDF** (`Propwell_AMP_Weekly_Brief_02.23.26.pdf`) — 5-page weekly brief in Propwell teal/greenery/cream branding saved to Downloads
- **Corrected cost framing** — $75/$150 are internal manual production costs, not revenue. Platform automates production at ~$1.32/report (HC + Rentometer). RentCast evaluated separately as optional third provider.

**Key decisions documented:**
- HC + Rentometer = $182.41/mo fixed (the ask). Non-overlapping, both required.
- RentCast = $74/mo (evaluate separately). Overlaps with HC/Rentometer on property details and rent comps. Cost-justified only at 30+ Tier 2 reports/mo where cheaper AVMs ($0.074 vs $2.50) offset the subscription.
- Production cost savings: ~$19.50/report (T1), ~$33.68/report (T2). At scale: $55,440/yr saved, 0.63 FTE freed.

### Prior Session (2026-02-21) — Rebrand to Propwell AMP
- Renamed AM → AMP across all pages
- Inverted brand colors: "Propwell" in beige/cream, "AMP" in greenery on teal pill
- New AmpBoltIcon component, updated favicon
- Header nav visible for all visitors, greenery Sign In pill
- Home page redesign: hero + Platform Tools section with 3 tool cards
- 3 commits pushed to main, auto-deployed to Vercel

### Prior Session (2026-02-18) — P2 Polish — All 8 Tasks Complete
- Extracted shared format utilities, SVG sort icons, error boundary, 404 page
- Stale data refresh, breadcrumbs, analysis + underwriting detail views
- Dashboard + portfolio linked to detail views
- Build clean, deployed to production

## Next Session — Start Here
1. **Wait for Jeff's feedback** from platform testing — address any issues he reports
2. **Wait for API approvals** — HC Teams ($165.83/mo) + Rentometer Pro ($16.58/mo)
3. **Post-approval: wire up live APIs** — add keys to .env.local, flip USE_MOCK=false
4. **Calibrate scoring model** against 10 real Propwell reports
5. **Update budget model** — fix HC pricing from $20/mo → $165.83/mo, fill in data cost rows, separate HC+Rentometer baseline from RentCast-optional scenario
6. **Dashboard tool cards** — consider updating to match home page centered icon+title layout
7. **Link portfolio rows to underwriting models** — currently only links to comp analysis

## Blockers
| Blocker | Owner | Impact |
|---------|-------|--------|
| HouseCanary Teams subscription | Jeff (approval) | Blocks live market health scoring (12 metrics at MSA + ZIP) |
| Rentometer Pro subscription | Jeff (approval) | Blocks live rent benchmarking (percentiles, comps) |
| RentCast evaluation decision | Jeff | Blocks/defers third data provider integration |

## Open Questions
- Jeff's feedback from platform testing — any UX issues or feature requests?
- RentCast: add now or evaluate after go-live with HC + Rentometer?
- Budget model update: who owns syncing the AM budget model with the financial model?
- Post go-live: what's the priority? (More tool features vs. Aspen Grove integration vs. Tier 2 pipeline)

## Users
| Email | Name | Created | Role |
|-------|------|---------|------|
| kris@test.com | Kris | 2026-02-17 | Admin / Dev |
| jgravelle@propwell.co | Jeff Gravelle | 2026-02-23 | Test / Stakeholder |

## ClickUp Links
- (None yet — pending project setup)
