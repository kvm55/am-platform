# Propwell AMP — Handoff for Jeff Gravelle

**Prepared:** February 23, 2026
**Platform:** https://am-platform.vercel.app

---

## 1. Your Test Account

| Field | Value |
|-------|-------|
| URL | https://am-platform.vercel.app/signin |
| Email | jgravelle@propwell.co |
| Password | PropwellAMP2026! |

Sign in and you'll land on the **Dashboard**. From there you can access all three tools:
- **Comp Analysis** — Enter any address, get automated rental comp analysis
- **Portfolio Summary** — View all analyzed properties, export to CSV
- **Underwriting** — Run Long Term Hold / Fix & Flip / Short Term Rental models

> **Note:** The platform is currently running in **mock data mode**. You'll see realistic sample data for every analysis. Live API data requires the upgrades described below.

---

## 2. What to Test

1. **Sign in** at the URL above with your credentials
2. **Run a Comp Analysis** — Dashboard → Comp Analysis → enter any address (e.g., "732 W Concord St, Orlando, FL 32805") → Submit
3. **Review results** — Subject property details, rental comps table, rent recommendation, vacancy scenarios, Rentometer data, property score
4. **Check Portfolio** — Visit Portfolio Summary to see aggregated view. Try sorting columns and CSV export.
5. **Run an Underwriting Model** — Underwriting → select a property → choose LTH, F&F, or STR → fill inputs → Submit
6. **Check detail views** — Click any analysis or model from Dashboard to see full read-only detail pages
7. **Test mobile** — Resize browser or use phone. Responsive design throughout.

---

## 3. API Access Request — HouseCanary & Rentometer

To move from mock data to **live market data**, we need upgraded access to two data providers. These are non-overlapping — each delivers unique data the other cannot.

### 3a. HouseCanary — Market Analytics (No Alternative)

HouseCanary is the only provider with MSA and ZIP-level market health scoring. This powers the 12-metric market analysis and property scoring engine in AMP. No other API offers this combination.

| Item | Detail |
|------|--------|
| **Plan Required** | Teams (Annual) |
| **Annual cost** | $1,990/yr |
| **Monthly effective** | $165.83/mo |
| **What it unlocks** | 40 reports/mo + full API access |
| **Per-call cost** | $0.30 (Basic endpoints) |

**What it provides per property run:**

| Endpoint | Cost/Call | Data Delivered |
|----------|-----------|----------------|
| Property Details | $0.30 | Bed/bath/sqft verification, property type |
| HPI Forecast (1yr) | $0.30 | Home price index forecast |
| RPI Forecast (1yr) | $0.30 | Rental price index forecast |
| Market Grade | $0.30 | A-F grade for market health |
| Risk of Decline | $0.30 | Probability of price decline |
| Sale-to-List / DOM / Supply | $0.30 | Demand and absorption metrics |
| Population Growth / Yield | $0.30 | Growth and gross yield at ZIP |

**HC cost per Tier 1 property: $1.20** (4 calls × $0.30 for MSA + ZIP stats)

---

### 3b. Rentometer — Rent Benchmarking (No Alternative)

Rentometer provides statistical rent distribution data — percentiles, standard deviation, sample counts, and individual nearby comp listings. This is the rent intelligence layer no other single provider replicates at this depth.

| Item | Detail |
|------|--------|
| **Plan Required** | Pro (Annual) |
| **Annual cost** | $199/yr |
| **Monthly effective** | $16.58/mo |
| **What it unlocks** | 500 reports/yr (~42/mo), ~5,000 credits |
| **Per-credit cost** | $0.06–0.10 |

**Rentometer cost per property: $0.12–0.20** (2 credits: summary + nearby comps)

---

### 3c. Combined Ask — HC + Rentometer

| Provider | Monthly | Annual |
|----------|---------|--------|
| HouseCanary Teams | $165.83 | $1,990 |
| Rentometer Pro | $16.58 | $199 |
| **TOTAL (Fixed)** | **$182.41/mo** | **$2,189/yr** |

**Variable cost per Tier 1 property run (HC + Rentometer only): ~$1.32–1.40**

---

## 4. RentCast — Evaluate as Third Provider

RentCast is a third data provider currently in the pipeline design. Unlike HC and Rentometer, RentCast has **significant overlap** with what the other two already provide. The question is whether the overlap justifies the additional $74/mo.

| Item | Detail |
|------|--------|
| **Plan** | Foundation |
| **Monthly cost** | $74/mo ($888/yr) |
| **Included** | 1,000 calls/mo |
| **Per-call cost** | $0.074 effective |

**Where RentCast overlaps vs. adds value:**

| Data Point | RentCast | Already Covered By | Additive? |
|-----------|----------|-------------------|-----------|
| Property details (bed/bath/sqft) | $0.074/call | HC Property Details ($0.30) | Cheaper, not unique |
| Rental AVM (rent estimate) | $0.074/call | HC Rental AVM ($2.50 premium) | Much cheaper for Tier 2 |
| Rental comps (3-5 listings) | $0.074/call | Rentometer nearby comps | Overlaps |
| Property value estimate | $0.074/call | HC Value Forecast ($2.50) | Much cheaper for Tier 2 |
| Sale history / tax data | $0.074/call | HC Property Details | Overlaps |

**Cost comparison — with vs. without RentCast:**

| | HC + Rentometer Only | HC + Rentometer + RentCast |
|-|---------------------|---------------------------|
| Fixed monthly | $182.41 | $256.41 |
| Tier 1 data cost / property | ~$1.32 | ~$1.47 |
| Tier 2 data cost / property | ~$3.82 (HC premium AVM) | ~$1.55 (RentCast AVM) |
| Best for | Tier 1 focus, lower fixed cost | Heavy Tier 2 usage, cheaper AVMs |

> **Recommendation:** Start with HC + Rentometer ($182/mo). Evaluate RentCast after live data is running. RentCast becomes cost-justified if Tier 2 volume exceeds ~30 reports/mo, where the cheaper AVM calls ($0.074 vs $2.50) offset the $74/mo subscription.

---

## 5. Production Cost — Manual vs. Automated

The $75 (Tier 1) and $150 (Tier 2) figures represent **internal production cost** to produce each report manually — analyst time at $50/hr. AMP replaces this manual production with automated API calls + brief review.

| | Manual Production | AMP Automated | Savings / Report |
|-|-------------------|---------------|------------------|
| **Tier 1 — Comp Analysis** | $25 (30 min @ $50/hr) | ~$1.32 data + 5 min review | ~$19.50 / report |
| **Tier 2 — Investment Model** | $50 (60 min @ $50/hr) | ~$3.82 data + 15 min review | ~$33.68 / report |

**At scale (200 leads/mo — 150 T1 + 50 T2):**

| Metric | Manual | Automated (AMP) |
|--------|--------|-----------------|
| Tier 1 production time | 30 min / report | 5 min review |
| Tier 2 production time | 60 min / report | 15 min review |
| Monthly production cost | $6,250 labor | $380 data + $1,250 review = $1,630 |
| Monthly analyst hours | 125 hrs (0.78 FTE) | 25 hrs (0.16 FTE) |
| Monthly savings | — | $4,620 |
| Annual savings | — | $55,440 |
| FTE capacity freed | — | 0.63 FTE |

> **Key takeaway:** At $182/mo in fixed API costs, the platform pays for itself after **10 Tier 1 reports** per month in labor savings alone. Every report beyond that is net capacity freed.

---

## 6. Action Items

### For Jeff (Approvals)
- [ ] **Test the platform** using credentials above — report any issues
- [ ] **Approve HouseCanary Teams upgrade** — $1,990/yr ($165.83/mo)
- [ ] **Approve Rentometer Pro subscription** — $199/yr ($16.58/mo)
- [ ] **Decide on RentCast** — add now ($74/mo) or evaluate after go-live
- [ ] **Total ask without RentCast: $182.41/mo fixed + ~$1.32 per property**

### For Kris (Post-Approval)
- [ ] Activate HouseCanary Teams account, add API key to platform
- [ ] Set up Rentometer Pro account, add API key
- [ ] Switch platform from mock → live data
- [ ] Calibrate scoring model against 10 real Propwell reports
- [ ] Deploy live-data version to production
- [ ] If RentCast approved: complete account creation and integrate

---

## 7. Budget File Review Notes

The **AM_Pipeline_Financial_Model.xlsx** (6 tabs) is well-built — all formulas verified, three sensitivity scenarios modeled, breakeven in Month 1. However, the model bundles all three providers together. Should be updated to reflect HC + Rentometer as baseline.

**Issues flagged in propwell_AM budget model_021326.xlsx:**
- Row 73 shows "HC Basic Access" at $20/mo flat — needs update to **HouseCanary Teams at $165.83/mo**
- Rows 74–87 (Rentometer + RentCast data costs) are empty — need to be populated
- Financial model should separate HC + Rentometer baseline from RentCast-optional scenario
- Per-property cost formulas need to reflect correct provider mix

---

## Architecture Reference

| Component | Location |
|-----------|----------|
| Web App | Next.js 16 + Supabase + Tailwind 4 |
| Production URL | https://am-platform.vercel.app |
| Database | Supabase (lwloldgummcrprpscbzq) |
| Backend Pipeline | Python (tug-ops/propwell/am-pipeline) |
| Financial Model | tug-ops/propwell/am-pipeline/financial-model/ |
| Source Code | am-platform/ (GitHub → Vercel auto-deploy) |
