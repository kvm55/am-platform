# Propwell AM Platform

Asset management platform for single-family rental (SFR) portfolios. Three integrated tools for property analysis, portfolio tracking, and investment underwriting.

## Tools

**Comp Analysis** — Automated rental comp analysis. Enter an address and get comparable rentals, a rent recommendation (PPSQFT + AVM + Rentometer validation), vacancy loss scenarios, and a 0-100 property score with letter grade.

**Portfolio Summary** — Aggregated metrics across all analyzed properties. Sortable table with scores, grades, and rent data. CSV export for offline use.

**Underwriting** — Full investment underwriting models for Long Term Hold, Fix and Flip, and Short Term Rental strategies. Calculates IRR, cap rate, DSCR, cash-on-cash, equity multiple, and year-by-year projections. Generates a Buy/Hold/Sell/Pass recommendation with confidence level.

## Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Auth & Database:** Supabase (auth + Postgres with RLS)
- **Deployment:** Vercel

## Quick Start

```bash
# Clone
git clone https://github.com/kvm55/am-platform.git
cd am-platform

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local

# Run (mock mode — no API keys needed)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully in mock mode by default with embedded sample data (732 W Concord St, Orlando, FL).

## Project Structure

```
src/
  app/
    api/
      analyze/          POST: run comp analysis, GET by ID
      analyses/         GET: list all analyses
      portfolio/        GET: aggregated metrics
      portfolio/export/ GET: CSV download
      underwrite/       POST: run UW model, GET: list models
      properties/       GET/POST: CRUD properties
    dashboard/          Dashboard with tool cards + recent activity
    tools/
      comp-analysis/    Comp analysis form + results
      portfolio/        Portfolio summary table + metrics
      underwriting/     UW form + results + projections
    signin/             Sign in page
    signup/             Sign up page
  components/           Header, Footer
  context/              AuthContext (Supabase auth state)
  lib/
    pipeline/           TypeScript port of comp analysis pipeline
      comps.ts          5-level expansion comp engine
      enrichment.ts     Property enrichment (RentCast)
      geocode.ts        Address parsing + geocoding
      rent-calc.ts      Rent recommendation calculator
      rentometer.ts     Rentometer API integration
      vacancy.ts        4-scenario vacancy loss calculator
      types.ts          Shared interfaces
      config.ts         API keys + mock mode flag
      index.ts          Pipeline orchestrator
    scoring.ts          Property scoring engine (0-100 scale)
    underwriting.ts     UW engine + recommendation logic
    api-auth.ts         Auth helper for API routes
    supabase/           Supabase client (browser, server, middleware)
supabase/
  migrations/           SQL migrations (run after Supabase project setup)
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/persistence | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/persistence | Supabase anon key |
| `USE_MOCK` | No (default: `true`) | `true` for mock data, `false` for real APIs |
| `RENTCAST_API_KEY` | When `USE_MOCK=false` | RentCast API key |
| `RENTOMETER_API_KEY` | When `USE_MOCK=false` | Rentometer API key |

## Database Setup

When connecting a Supabase project, run the migration to create tables with RLS:

```bash
# Via Supabase dashboard: SQL Editor → paste contents of:
supabase/migrations/001_create_tables.sql
```

Creates three tables: `properties`, `analyses`, `underwriting_models` — all with row-level security (users can only access their own data).

## Mock Mode

With `USE_MOCK=true` (default), all tools work without external API keys or a Supabase database:

- **Comp Analysis** returns 3 mock comps for Orlando, FL with full rent recommendation, vacancy scenarios, and Rentometer data
- **Underwriting** runs all calculations client-side with no database dependency
- **Portfolio** and **Dashboard** return empty lists (populated when Supabase is connected)

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/analyze` | POST | Run comp analysis pipeline |
| `/api/analyze/[id]` | GET | Fetch saved analysis |
| `/api/analyses` | GET | List all user analyses |
| `/api/portfolio` | GET | Aggregated portfolio metrics |
| `/api/portfolio/export` | GET | CSV download |
| `/api/underwrite` | GET, POST | List models / run UW model |
| `/api/underwrite/[id]` | GET, PUT, DELETE | CRUD single UW model |
| `/api/properties` | GET, POST | List / create properties |
| `/api/properties/[id]` | GET, PUT, DELETE | CRUD single property |

## License

Proprietary — The Umbrella Group (TUG).
