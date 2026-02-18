"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  type UnderwritingResults,
  type UWRecommendation,
  type PropertyInputs,
  formatCurrency,
  formatPercent,
  formatMultiple,
} from "@/lib/underwriting";

interface ModelRecord {
  id: string;
  investment_type: string;
  inputs: PropertyInputs;
  results: UnderwritingResults;
  recommendation: UWRecommendation;
  created_at: string;
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? "bg-teal text-cream" : "bg-cream/50"}`}>
      <p className={`text-xs uppercase ${highlight ? "text-cream/70" : "text-teal/50"}`}>{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-greenery" : "text-teal"}`}>{value}</p>
    </div>
  );
}

export default function UnderwritingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ModelRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/underwrite/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Model not found");
        return r.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-4 w-48 bg-beige/30 rounded animate-pulse mb-4" />
        <div className="h-8 w-72 bg-beige/50 rounded animate-pulse mb-2" />
        <div className="h-4 w-56 bg-beige/30 rounded animate-pulse mb-8" />
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="h-5 w-40 bg-beige/40 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-beige/20 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Underwriting", href: "/tools/underwriting" },
          { label: "Not Found" },
        ]} />
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-red-600 mb-4">{error || "Model not found"}</p>
          <Link href="/tools/underwriting" className="text-teal font-medium hover:underline">
            Back to Underwriting
          </Link>
        </div>
      </div>
    );
  }

  const { results, recommendation, inputs } = data;
  const investmentType = data.investment_type;
  const address = inputs.streetAddress
    ? `${inputs.streetAddress}${inputs.city ? `, ${inputs.city}` : ""}${inputs.state ? `, ${inputs.state}` : ""}`
    : "Untitled Model";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Underwriting", href: "/tools/underwriting" },
        { label: `Model #${id.slice(0, 8)}` },
      ]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal">{address}</h1>
        <p className="text-teal/60 mt-1">
          {investmentType} &middot; Created {new Date(data.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        {/* Recommendation Banner */}
        <div className={`rounded-xl p-6 ${
          recommendation.action === "Buy" ? "bg-green-50 border border-green-200" :
          recommendation.action === "Hold" ? "bg-yellow-50 border border-yellow-200" :
          "bg-red-50 border border-red-200"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-teal">Recommendation</h2>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${
                recommendation.action === "Buy" ? "text-green-700" :
                recommendation.action === "Hold" ? "text-yellow-700" :
                "text-red-700"
              }`}>
                {recommendation.action}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                recommendation.confidence === "High" ? "bg-green-200 text-green-800" :
                recommendation.confidence === "Medium" ? "bg-yellow-200 text-yellow-800" :
                "bg-red-200 text-red-800"
              }`}>
                {recommendation.confidence} Confidence
              </span>
            </div>
          </div>
          <p className="text-teal/80 text-sm mb-3">{recommendation.summary}</p>
          <div className="space-y-1">
            {recommendation.factors.map((f, i) => (
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
                <MetricCard label="Flip Profit" value={formatCurrency(results.flipProfit ?? 0)} highlight />
                <MetricCard label="Flip ROI" value={formatPercent(results.flipROI ?? 0)} highlight />
                <MetricCard label="Annualized ROI" value={formatPercent(results.flipAnnualizedROI ?? 0)} />
                <MetricCard label="Total Project Cost" value={formatCurrency(results.totalProjectCost)} />
                <MetricCard label="Equity Required" value={formatCurrency(results.totalEquityRequired)} />
              </>
            ) : (
              <>
                <MetricCard label="IRR" value={formatPercent(results.irr)} highlight />
                <MetricCard label="Cap Rate" value={formatPercent(results.capRate)} highlight />
                <MetricCard label="Cash-on-Cash" value={formatPercent(results.cashOnCash)} />
                <MetricCard label="DSCR" value={`${results.dscr.toFixed(2)}x`} />
                <MetricCard label="Equity Multiple" value={formatMultiple(results.equityMultiple)} />
              </>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-teal uppercase tracking-wide">Sources & Uses</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-teal/60">Total Project Cost</span><span className="text-teal font-medium">{formatCurrency(results.totalProjectCost)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Loan Amount</span><span className="text-teal font-medium">{formatCurrency(inputs.loanAmount)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Equity Required</span><span className="text-teal font-medium">{formatCurrency(results.totalEquityRequired)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">LTV</span><span className="text-teal font-medium">{formatPercent(results.loanToValue)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">LTC</span><span className="text-teal font-medium">{formatPercent(results.loanToCost)}</span></div>
            </div>

            <h3 className="text-sm font-semibold text-teal uppercase tracking-wide pt-2">Income & NOI</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-teal/60">Gross Scheduled Income</span><span className="text-teal font-medium">{formatCurrency(results.grossScheduledIncome)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Vacancy Loss</span><span className="text-red-600 font-medium">({formatCurrency(results.vacancyLoss)})</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Effective Gross Income</span><span className="text-teal font-medium">{formatCurrency(results.effectiveGrossIncome)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Operating Expenses</span><span className="text-red-600 font-medium">({formatCurrency(results.totalOperatingExpenses)})</span></div>
              <div className="flex justify-between border-t border-beige pt-1"><span className="text-teal font-semibold">NOI</span><span className="text-teal font-bold">{formatCurrency(results.noi)}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-teal uppercase tracking-wide">Cash Flow</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-teal/60">Annual Debt Service</span><span className="text-red-600 font-medium">({formatCurrency(results.annualDebtService)})</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Monthly Debt Service</span><span className="text-teal font-medium">{formatCurrency(results.monthlyDebtService)}</span></div>
              <div className="flex justify-between border-t border-beige pt-1"><span className="text-teal font-semibold">Annual Cash Flow</span><span className={`font-bold ${results.cashFlowAfterDebt >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(results.cashFlowAfterDebt)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Monthly Cash Flow</span><span className={`font-medium ${results.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(results.monthlyCashFlow)}</span></div>
            </div>

            <h3 className="text-sm font-semibold text-teal uppercase tracking-wide pt-2">Disposition</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-teal/60">Projected Sale Price</span><span className="text-teal font-medium">{formatCurrency(results.projectedSalePrice)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Remaining Loan Balance</span><span className="text-teal font-medium">{formatCurrency(results.loanBalance)}</span></div>
              <div className="flex justify-between"><span className="text-teal/60">Net Sale Proceeds</span><span className="text-teal font-medium">{formatCurrency(results.netSaleProceeds)}</span></div>
              <div className="flex justify-between border-t border-beige pt-1"><span className="text-teal font-semibold">Total Profit</span><span className={`font-bold ${results.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(results.totalProfit)}</span></div>
            </div>
          </div>
        </div>

        {/* Year-by-Year Projections */}
        {results.yearlyProjections.length > 0 && (
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
                  {results.yearlyProjections.map((yr, i) => (
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

        {/* Back Button */}
        <div className="flex justify-center">
          <Link
            href="/tools/underwriting"
            className="bg-white text-teal border border-beige px-6 py-2.5 rounded-lg font-medium hover:bg-cream transition-colors"
          >
            Create Another Model
          </Link>
        </div>
      </div>
    </div>
  );
}
