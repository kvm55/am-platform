"use client";

import { useState } from "react";
import {
  type InvestmentType,
  type PropertyInputs,
  type UnderwritingResults,
  type UWRecommendation,
  getDefaultInputs,
  formatCurrency,
  formatPercent,
  formatMultiple,
} from "@/lib/underwriting";

type UWResult = {
  results: UnderwritingResults;
  recommendation: UWRecommendation;
  modelId?: string;
};

function InputField({
  label,
  value,
  onChange,
  type = "number",
  suffix,
  prefix,
  help,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
  prefix?: string;
  help?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-teal mb-1">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal/50 text-sm">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-2 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-cream/30 text-teal text-sm ${prefix ? "pl-7 pr-3" : suffix ? "pl-3 pr-8" : "px-3"}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal/50 text-sm">{suffix}</span>}
      </div>
      {help && <p className="text-xs text-teal/40 mt-0.5">{help}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-beige pt-4 mt-4 first:border-0 first:pt-0 first:mt-0">
      <h3 className="text-sm font-semibold text-teal uppercase tracking-wide mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? "bg-teal text-cream" : "bg-cream/50"}`}>
      <p className={`text-xs uppercase ${highlight ? "text-cream/70" : "text-teal/50"}`}>{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-greenery" : "text-teal"}`}>{value}</p>
    </div>
  );
}

export default function UnderwritingPage() {
  const [investmentType, setInvestmentType] = useState<InvestmentType>("Long Term Hold");
  const [inputs, setInputs] = useState<PropertyInputs>(getDefaultInputs("Long Term Hold"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UWResult | null>(null);

  const handleTypeChange = (type: InvestmentType) => {
    setInvestmentType(type);
    setInputs(getDefaultInputs(type));
    setResult(null);
  };

  const updateInput = (field: keyof PropertyInputs, value: string) => {
    const numericFields: (keyof PropertyInputs)[] = [
      "bedrooms", "bathrooms", "squareFeet", "units",
      "purchasePrice", "closingCosts", "renovations", "reserves",
      "loanAmount", "interestRate", "loanTermYears", "amortizationYears",
      "grossMonthlyRent", "otherMonthlyIncome", "vacancyRate",
      "propertyTaxes", "insurance", "maintenance", "management", "utilities", "otherExpenses",
      "holdPeriodYears", "annualAppreciation", "annualRentGrowth", "sellingCosts", "exitCapRate",
      "afterRepairValue", "monthsToComplete", "holdingCostsMonthly",
      "avgNightlyRate", "occupancyRate", "cleaningFeePerStay", "avgStayDuration", "strPlatformFee", "strManagement",
    ];

    if (numericFields.includes(field)) {
      setInputs({ ...inputs, [field]: value === "" ? 0 : parseFloat(value) });
    } else if (field === "interestOnly") {
      setInputs({ ...inputs, interestOnly: value === "true" });
    } else {
      setInputs({ ...inputs, [field]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const resp = await fetch("/api/underwrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${resp.status})`);
      }

      const data = await resp.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Underwriting failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal">Underwriting</h1>
        <p className="text-teal/60 mt-1">Build full underwriting models with buy/hold/sell recommendations</p>
      </div>

      {/* Investment Type Toggle */}
      <div className="flex gap-2 mb-6">
        {(["Long Term Hold", "Fix and Flip", "Short Term Rental"] as InvestmentType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              investmentType === type
                ? "bg-teal text-greenery"
                : "bg-white text-teal border border-beige hover:bg-cream"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <Section title="Property Information">
          <InputField label="Street Address" value={inputs.streetAddress} onChange={(v) => updateInput("streetAddress", v)} type="text" />
          <InputField label="City" value={inputs.city} onChange={(v) => updateInput("city", v)} type="text" />
          <InputField label="State" value={inputs.state} onChange={(v) => updateInput("state", v)} type="text" />
          <InputField label="ZIP" value={inputs.zip} onChange={(v) => updateInput("zip", v)} type="text" />
          <InputField label="Bedrooms" value={inputs.bedrooms} onChange={(v) => updateInput("bedrooms", v)} />
          <InputField label="Bathrooms" value={inputs.bathrooms} onChange={(v) => updateInput("bathrooms", v)} />
          <InputField label="Square Feet" value={inputs.squareFeet} onChange={(v) => updateInput("squareFeet", v)} />
          <InputField label="Units" value={inputs.units} onChange={(v) => updateInput("units", v)} />
        </Section>

        <Section title="Acquisition">
          <InputField label="Purchase Price" value={inputs.purchasePrice} onChange={(v) => updateInput("purchasePrice", v)} prefix="$" />
          <InputField label="Closing Costs" value={inputs.closingCosts} onChange={(v) => updateInput("closingCosts", v)} prefix="$" />
          <InputField label="Renovations" value={inputs.renovations} onChange={(v) => updateInput("renovations", v)} prefix="$" />
          <InputField label="Reserves" value={inputs.reserves} onChange={(v) => updateInput("reserves", v)} prefix="$" />
        </Section>

        <Section title="Debt Terms">
          <InputField label="Loan Amount" value={inputs.loanAmount} onChange={(v) => updateInput("loanAmount", v)} prefix="$" />
          <InputField label="Interest Rate" value={inputs.interestRate} onChange={(v) => updateInput("interestRate", v)} suffix="%" />
          <InputField label="Loan Term (years)" value={inputs.loanTermYears} onChange={(v) => updateInput("loanTermYears", v)} />
          <InputField label="Amortization (years)" value={inputs.amortizationYears} onChange={(v) => updateInput("amortizationYears", v)} />
          <div>
            <label className="block text-xs font-medium text-teal mb-1">Interest Only</label>
            <select
              value={inputs.interestOnly ? "true" : "false"}
              onChange={(e) => updateInput("interestOnly", e.target.value)}
              className="w-full py-2 px-3 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-cream/30 text-teal text-sm"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </Section>

        <Section title="Income">
          {investmentType === "Short Term Rental" ? (
            <>
              <InputField label="Avg Nightly Rate" value={inputs.avgNightlyRate} onChange={(v) => updateInput("avgNightlyRate", v)} prefix="$" />
              <InputField label="Occupancy Rate" value={inputs.occupancyRate} onChange={(v) => updateInput("occupancyRate", v)} suffix="%" />
              <InputField label="Cleaning Fee / Stay" value={inputs.cleaningFeePerStay} onChange={(v) => updateInput("cleaningFeePerStay", v)} prefix="$" />
              <InputField label="Avg Stay Duration (nights)" value={inputs.avgStayDuration} onChange={(v) => updateInput("avgStayDuration", v)} />
            </>
          ) : (
            <>
              <InputField label="Gross Monthly Rent" value={inputs.grossMonthlyRent} onChange={(v) => updateInput("grossMonthlyRent", v)} prefix="$" />
              <InputField label="Other Monthly Income" value={inputs.otherMonthlyIncome} onChange={(v) => updateInput("otherMonthlyIncome", v)} prefix="$" />
              <InputField label="Vacancy Rate" value={inputs.vacancyRate} onChange={(v) => updateInput("vacancyRate", v)} suffix="%" />
            </>
          )}
        </Section>

        <Section title="Expenses (Annual)">
          <InputField label="Property Taxes" value={inputs.propertyTaxes} onChange={(v) => updateInput("propertyTaxes", v)} prefix="$" />
          <InputField label="Insurance" value={inputs.insurance} onChange={(v) => updateInput("insurance", v)} prefix="$" />
          <InputField label="Maintenance" value={inputs.maintenance} onChange={(v) => updateInput("maintenance", v)} prefix="$" />
          {investmentType === "Short Term Rental" ? (
            <>
              <InputField label="Platform Fee" value={inputs.strPlatformFee} onChange={(v) => updateInput("strPlatformFee", v)} suffix="%" />
              <InputField label="STR Management" value={inputs.strManagement} onChange={(v) => updateInput("strManagement", v)} suffix="%" />
            </>
          ) : (
            <InputField label="Management" value={inputs.management} onChange={(v) => updateInput("management", v)} prefix="$" />
          )}
          <InputField label="Utilities" value={inputs.utilities} onChange={(v) => updateInput("utilities", v)} prefix="$" />
          <InputField label="Other Expenses" value={inputs.otherExpenses} onChange={(v) => updateInput("otherExpenses", v)} prefix="$" />
        </Section>

        {investmentType === "Fix and Flip" ? (
          <Section title="Flip Details">
            <InputField label="After Repair Value" value={inputs.afterRepairValue} onChange={(v) => updateInput("afterRepairValue", v)} prefix="$" />
            <InputField label="Months to Complete" value={inputs.monthsToComplete} onChange={(v) => updateInput("monthsToComplete", v)} />
            <InputField label="Holding Costs / Month" value={inputs.holdingCostsMonthly} onChange={(v) => updateInput("holdingCostsMonthly", v)} prefix="$" />
            <InputField label="Selling Costs" value={inputs.sellingCosts} onChange={(v) => updateInput("sellingCosts", v)} suffix="%" />
          </Section>
        ) : (
          <Section title="Disposition">
            <InputField label="Hold Period (years)" value={inputs.holdPeriodYears} onChange={(v) => updateInput("holdPeriodYears", v)} />
            <InputField label="Annual Appreciation" value={inputs.annualAppreciation} onChange={(v) => updateInput("annualAppreciation", v)} suffix="%" />
            <InputField label="Annual Rent Growth" value={inputs.annualRentGrowth} onChange={(v) => updateInput("annualRentGrowth", v)} suffix="%" />
            <InputField label="Selling Costs" value={inputs.sellingCosts} onChange={(v) => updateInput("sellingCosts", v)} suffix="%" />
            <InputField label="Exit Cap Rate" value={inputs.exitCapRate} onChange={(v) => updateInput("exitCapRate", v)} suffix="%" />
          </Section>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-teal text-white px-8 py-2.5 rounded-lg font-medium hover:bg-teal-light transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running Model...
            </>
          ) : (
            "Run Underwriting"
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Recommendation Banner */}
          <div className={`rounded-xl p-6 ${
            result.recommendation.action === "Buy" ? "bg-green-50 border border-green-200" :
            result.recommendation.action === "Hold" ? "bg-yellow-50 border border-yellow-200" :
            "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-teal">Recommendation</h2>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${
                  result.recommendation.action === "Buy" ? "text-green-700" :
                  result.recommendation.action === "Hold" ? "text-yellow-700" :
                  "text-red-700"
                }`}>
                  {result.recommendation.action}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  result.recommendation.confidence === "High" ? "bg-green-200 text-green-800" :
                  result.recommendation.confidence === "Medium" ? "bg-yellow-200 text-yellow-800" :
                  "bg-red-200 text-red-800"
                }`}>
                  {result.recommendation.confidence} Confidence
                </span>
              </div>
            </div>
            <p className="text-teal/80 text-sm mb-3">{result.recommendation.summary}</p>
            <div className="space-y-1">
              {result.recommendation.factors.map((f, i) => (
                <p key={i} className="text-sm text-teal/70">&bull; {f}</p>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-teal mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {investmentType === "Fix and Flip" ? (
                <>
                  <MetricCard label="Flip Profit" value={formatCurrency(result.results.flipProfit ?? 0)} highlight />
                  <MetricCard label="Flip ROI" value={formatPercent(result.results.flipROI ?? 0)} highlight />
                  <MetricCard label="Annualized ROI" value={formatPercent(result.results.flipAnnualizedROI ?? 0)} />
                  <MetricCard label="Total Project Cost" value={formatCurrency(result.results.totalProjectCost)} />
                  <MetricCard label="Equity Required" value={formatCurrency(result.results.totalEquityRequired)} />
                </>
              ) : (
                <>
                  <MetricCard label="IRR" value={formatPercent(result.results.irr)} highlight />
                  <MetricCard label="Cap Rate" value={formatPercent(result.results.capRate)} highlight />
                  <MetricCard label="Cash-on-Cash" value={formatPercent(result.results.cashOnCash)} />
                  <MetricCard label="DSCR" value={`${result.results.dscr.toFixed(2)}x`} />
                  <MetricCard label="Equity Multiple" value={formatMultiple(result.results.equityMultiple)} />
                </>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sources & Uses + Income */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-teal uppercase tracking-wide">Sources & Uses</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-teal/60">Total Project Cost</span><span className="text-teal font-medium">{formatCurrency(result.results.totalProjectCost)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Loan Amount</span><span className="text-teal font-medium">{formatCurrency(inputs.loanAmount)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Equity Required</span><span className="text-teal font-medium">{formatCurrency(result.results.totalEquityRequired)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">LTV</span><span className="text-teal font-medium">{formatPercent(result.results.loanToValue)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">LTC</span><span className="text-teal font-medium">{formatPercent(result.results.loanToCost)}</span></div>
              </div>

              <h3 className="text-sm font-semibold text-teal uppercase tracking-wide pt-2">Income & NOI</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-teal/60">Gross Scheduled Income</span><span className="text-teal font-medium">{formatCurrency(result.results.grossScheduledIncome)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Vacancy Loss</span><span className="text-red-600 font-medium">({formatCurrency(result.results.vacancyLoss)})</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Effective Gross Income</span><span className="text-teal font-medium">{formatCurrency(result.results.effectiveGrossIncome)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Operating Expenses</span><span className="text-red-600 font-medium">({formatCurrency(result.results.totalOperatingExpenses)})</span></div>
                <div className="flex justify-between border-t border-beige pt-1"><span className="text-teal font-semibold">NOI</span><span className="text-teal font-bold">{formatCurrency(result.results.noi)}</span></div>
              </div>
            </div>

            {/* Cash Flow + Returns */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-semibold text-teal uppercase tracking-wide">Cash Flow</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-teal/60">Annual Debt Service</span><span className="text-red-600 font-medium">({formatCurrency(result.results.annualDebtService)})</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Monthly Debt Service</span><span className="text-teal font-medium">{formatCurrency(result.results.monthlyDebtService)}</span></div>
                <div className="flex justify-between border-t border-beige pt-1"><span className="text-teal font-semibold">Annual Cash Flow</span><span className={`font-bold ${result.results.cashFlowAfterDebt >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(result.results.cashFlowAfterDebt)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Monthly Cash Flow</span><span className={`font-medium ${result.results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(result.results.monthlyCashFlow)}</span></div>
              </div>

              <h3 className="text-sm font-semibold text-teal uppercase tracking-wide pt-2">Disposition</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-teal/60">Projected Sale Price</span><span className="text-teal font-medium">{formatCurrency(result.results.projectedSalePrice)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Remaining Loan Balance</span><span className="text-teal font-medium">{formatCurrency(result.results.loanBalance)}</span></div>
                <div className="flex justify-between"><span className="text-teal/60">Net Sale Proceeds</span><span className="text-teal font-medium">{formatCurrency(result.results.netSaleProceeds)}</span></div>
                <div className="flex justify-between border-t border-beige pt-1"><span className="text-teal font-semibold">Total Profit</span><span className={`font-bold ${result.results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(result.results.totalProfit)}</span></div>
              </div>
            </div>
          </div>

          {/* Year-by-Year Projections */}
          {result.results.yearlyProjections.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-teal mb-4">Year-by-Year Projections</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-teal text-cream">
                      <th className="px-3 py-2 text-left font-medium rounded-tl-lg">Year</th>
                      <th className="px-3 py-2 text-right font-medium">Income</th>
                      <th className="px-3 py-2 text-right font-medium">Expenses</th>
                      <th className="px-3 py-2 text-right font-medium">NOI</th>
                      <th className="px-3 py-2 text-right font-medium">Debt Service</th>
                      <th className="px-3 py-2 text-right font-medium">Cash Flow</th>
                      <th className="px-3 py-2 text-right font-medium">Property Value</th>
                      <th className="px-3 py-2 text-right font-medium">Equity</th>
                      <th className="px-3 py-2 text-right font-medium rounded-tr-lg">Cumulative CF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.yearlyProjections.map((yr, i) => (
                      <tr key={yr.year} className={i % 2 === 1 ? "bg-cream/50" : ""}>
                        <td className="px-3 py-2 text-teal font-medium">{yr.year}</td>
                        <td className="px-3 py-2 text-right text-teal">{formatCurrency(yr.grossIncome)}</td>
                        <td className="px-3 py-2 text-right text-teal/70">{formatCurrency(yr.operatingExpenses)}</td>
                        <td className="px-3 py-2 text-right text-teal font-medium">{formatCurrency(yr.noi)}</td>
                        <td className="px-3 py-2 text-right text-teal/70">{formatCurrency(yr.debtService)}</td>
                        <td className={`px-3 py-2 text-right font-medium ${yr.cashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(yr.cashFlow)}</td>
                        <td className="px-3 py-2 text-right text-teal">{formatCurrency(yr.propertyValue)}</td>
                        <td className="px-3 py-2 text-right text-teal">{formatCurrency(yr.equity)}</td>
                        <td className={`px-3 py-2 text-right font-medium ${yr.cumulativeCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(yr.cumulativeCashFlow)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
