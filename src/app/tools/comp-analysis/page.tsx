"use client";

import { useState, useRef } from "react";
import type { Tier1Report } from "@/lib/pipeline/types";
import type { PropertyScore } from "@/lib/scoring";

type AnalysisResult = {
  report: Tier1Report;
  score: PropertyScore;
  analysisId?: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-teal w-40 shrink-0">{label}</span>
      <div className="flex-1 bg-cream rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-teal rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-medium text-teal w-16 text-right">{score} / {max}</span>
    </div>
  );
}

export default function CompAnalysisPage() {
  const [address, setAddress] = useState("");
  const [premiumRent, setPremiumRent] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const body: Record<string, unknown> = { address };
      if (premiumRent) body.premiumRent = parseFloat(premiumRent);
      if (comments) body.comments = comments;

      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${resp.status})`);
      }

      const data = await resp.json();
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal">Comp Analysis</h1>
        <p className="text-teal/60 mt-1">
          Run automated rental comp analysis on any SFR property
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-teal mb-1">
              Property Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="732 W Concord St, Orlando, FL 32805"
              className="w-full px-4 py-2.5 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-cream/30 text-teal placeholder:text-teal/40"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-teal mb-1">
              Premium Rent (optional)
            </label>
            <input
              type="number"
              value={premiumRent}
              onChange={(e) => setPremiumRent(e.target.value)}
              placeholder="3000"
              className="w-full px-4 py-2.5 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-cream/30 text-teal placeholder:text-teal/40"
            />
            <p className="text-xs text-teal/50 mt-1">
              Client&apos;s asking rent if above market. Used for vacancy analysis.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-teal mb-1">
              Comments (optional)
            </label>
            <input
              type="text"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. pond front property"
              className="w-full px-4 py-2.5 border border-beige rounded-lg focus:outline-none focus:ring-2 focus:ring-teal bg-cream/30 text-teal placeholder:text-teal/40"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-teal text-white px-8 py-2.5 rounded-lg font-medium hover:bg-teal-light transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running Analysis...
            </>
          ) : (
            "Run Analysis"
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="space-y-6">
          {/* Subject Property */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-teal mb-4">Subject Property</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-teal/50 uppercase tracking-wide">Address</span>
                <p className="text-teal font-medium">{result.report.subject.address}</p>
                <p className="text-sm text-teal/60">{result.report.subject.city}, {result.report.subject.state} {result.report.subject.zipCode}</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase tracking-wide">Bed / Bath</span>
                <p className="text-teal font-medium">{result.report.subject.bedrooms} bd / {result.report.subject.bathrooms} ba</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase tracking-wide">SQFT</span>
                <p className="text-teal font-medium">{result.report.subject.sqft.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase tracking-wide">Year Built</span>
                <p className="text-teal font-medium">{result.report.subject.yearBuilt || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Score Card + Rent Recommendation side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Score */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-teal">Property Score</h2>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    result.score.grade === "A" ? "text-green-600" :
                    result.score.grade === "B" ? "text-teal" :
                    result.score.grade === "C" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {result.score.totalScore}
                  </div>
                  <div className={`text-sm font-semibold px-2 py-0.5 rounded ${
                    result.score.grade === "A" ? "bg-green-100 text-green-700" :
                    result.score.grade === "B" ? "bg-teal/10 text-teal" :
                    result.score.grade === "C" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    Grade {result.score.grade}
                  </div>
                  <p className="text-xs text-teal/50 mt-1">&plusmn;{result.score.confidenceBand} pts</p>
                </div>
              </div>

              <div className="space-y-3">
                <ScoreBar label="Rent Positioning" score={result.score.rentPositioningScore} />
                <ScoreBar label="Market Health" score={result.score.marketHealthScore} />
                <ScoreBar label="Competitiveness" score={result.score.competitivenessScore} />
                <ScoreBar label="Vacancy Risk" score={result.score.vacancyRiskScore} />
              </div>

              {result.score.strengths.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Strengths</h4>
                  {result.score.strengths.map((s, i) => (
                    <p key={i} className="text-sm text-teal/80">+ {s}</p>
                  ))}
                </div>
              )}
              {result.score.watchItems.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">Watch</h4>
                  {result.score.watchItems.map((w, i) => (
                    <p key={i} className="text-sm text-teal/80">~ {w}</p>
                  ))}
                </div>
              )}
              {result.score.redFlags.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Red Flags</h4>
                  {result.score.redFlags.map((f, i) => (
                    <p key={i} className="text-sm text-red-700">! {f}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Rent Recommendation */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-teal mb-4">Rent Recommendation</h2>
              <div className="bg-teal rounded-lg p-4 mb-4 text-center">
                <p className="text-cream/80 text-sm">Recommended Rent</p>
                <p className="text-greenery text-3xl font-bold">
                  {formatCurrency(result.report.rentRecommendation.recommendedRent)}
                </p>
                <p className="text-cream/60 text-xs mt-1">PPSQFT Method (${formatNumber(result.report.rentRecommendation.avgPpsqft, 3)}/sqft)</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-teal/60">PPSQFT Method</span>
                  <span className="text-teal font-medium">{formatCurrency(result.report.rentRecommendation.ppsqftMethod)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-teal/60">Direct Comp Average</span>
                  <span className="text-teal font-medium">{formatCurrency(result.report.rentRecommendation.directAverage)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-teal/60">RentCast AVM</span>
                  <span className="text-teal font-medium">{formatCurrency(result.report.rentRecommendation.rentcastAvm)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-teal/60">Rentometer Median</span>
                  <span className="text-teal font-medium">{formatCurrency(result.report.rentRecommendation.rentometerMedian)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparable Properties Table */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-teal">Comparable Properties</h2>
              <span className="text-xs text-teal/50 bg-cream px-2 py-1 rounded">
                Expansion Level {result.report.compResult.expansionLevel}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal text-cream">
                    <th className="px-3 py-2 text-left font-medium rounded-tl-lg">Address</th>
                    <th className="px-3 py-2 text-left font-medium">City</th>
                    <th className="px-3 py-2 text-center font-medium">Bed/Bath</th>
                    <th className="px-3 py-2 text-right font-medium">SQFT</th>
                    <th className="px-3 py-2 text-right font-medium">Rent</th>
                    <th className="px-3 py-2 text-right font-medium">$/SQFT</th>
                    <th className="px-3 py-2 text-right font-medium">DOM</th>
                    <th className="px-3 py-2 text-left font-medium rounded-tr-lg">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {result.report.compResult.comps.map((comp, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-cream/50" : ""}>
                      <td className="px-3 py-2 text-teal font-medium">{comp.address}</td>
                      <td className="px-3 py-2 text-teal/70">{comp.city}</td>
                      <td className="px-3 py-2 text-center text-teal/70">{comp.bedrooms}/{comp.bathrooms}</td>
                      <td className="px-3 py-2 text-right text-teal/70">{comp.sqft.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-teal font-medium">{formatCurrency(comp.rent)}</td>
                      <td className="px-3 py-2 text-right text-teal/70">${formatNumber(comp.ppsqft, 2)}</td>
                      <td className="px-3 py-2 text-right text-teal/70">{comp.dom ?? "—"}</td>
                      <td className="px-3 py-2 text-teal/60 text-xs">{comp.comments || "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-teal/20 font-medium">
                    <td className="px-3 py-2 text-teal" colSpan={4}>Averages</td>
                    <td className="px-3 py-2 text-right text-teal">{formatCurrency(result.report.compResult.avgRent)}</td>
                    <td className="px-3 py-2 text-right text-teal">${formatNumber(result.report.compResult.avgPpsqft, 3)}</td>
                    <td className="px-3 py-2 text-right text-teal">
                      {result.report.compResult.avgDom !== null ? Math.round(result.report.compResult.avgDom) : "—"}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Vacancy Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-teal mb-4">Vacancy Loss Analysis</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-cream/50 rounded-lg p-3 text-center">
                <p className="text-xs text-teal/50 uppercase">Daily Revenue</p>
                <p className="text-lg font-bold text-teal">{formatCurrency(result.report.vacancy.dailyRevenue)}</p>
              </div>
              <div className="bg-cream/50 rounded-lg p-3 text-center">
                <p className="text-xs text-teal/50 uppercase">Monthly Spread</p>
                <p className="text-lg font-bold text-teal">{formatCurrency(result.report.vacancy.monthlySpread)}</p>
              </div>
              <div className="bg-cream/50 rounded-lg p-3 text-center">
                <p className="text-xs text-teal/50 uppercase">Breakeven Days</p>
                <p className="text-lg font-bold text-teal">{formatNumber(result.report.vacancy.breakevenDays, 1)}</p>
              </div>
              <div className="bg-cream/50 rounded-lg p-3 text-center">
                <p className="text-xs text-teal/50 uppercase">Market Rate</p>
                <p className="text-lg font-bold text-teal">{formatCurrency(result.report.vacancy.marketRate)}</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-teal mb-2">Scenarios</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-teal text-cream">
                    <th className="px-3 py-2 text-left font-medium rounded-tl-lg">Scenario</th>
                    <th className="px-3 py-2 text-right font-medium">Rent</th>
                    <th className="px-3 py-2 text-right font-medium">Days Vacant</th>
                    <th className="px-3 py-2 text-right font-medium">Annual Revenue</th>
                    <th className="px-3 py-2 text-right font-medium">Net Revenue</th>
                    <th className="px-3 py-2 text-right font-medium rounded-tr-lg">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.report.vacancy.scenarios.map((s, i) => (
                    <tr key={i} className={i % 2 === 1 ? "bg-cream/50" : ""}>
                      <td className="px-3 py-2 text-teal font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-right text-teal">{formatCurrency(s.rent)}</td>
                      <td className="px-3 py-2 text-right text-teal/70">{s.daysVacant}</td>
                      <td className="px-3 py-2 text-right text-teal">{formatCurrency(s.annualRevenue)}</td>
                      <td className="px-3 py-2 text-right text-teal font-medium">{formatCurrency(s.netRevenue)}</td>
                      <td className={`px-3 py-2 text-right font-medium ${s.variance < 0 ? "text-red-600" : s.variance > 0 ? "text-green-600" : "text-teal/50"}`}>
                        {s.variance === 0 ? "Baseline" : formatCurrency(s.variance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Loss Table */}
            <h3 className="text-sm font-semibold text-teal mt-6 mb-2">Vacancy Loss by Duration</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(result.report.vacancy.lossTable).map(([days, loss]) => (
                <div key={days} className="bg-cream/50 rounded-lg p-2 text-center">
                  <p className="text-xs text-teal/50">{days} days</p>
                  <p className="text-sm font-medium text-red-600">-{formatCurrency(loss)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Run Another */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setResult(null);
                setAddress("");
                setPremiumRent("");
                setComments("");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="bg-white text-teal border border-beige px-6 py-2.5 rounded-lg font-medium hover:bg-cream transition-colors"
            >
              Run Another Analysis
            </button>
          </div>

          {/* Rentometer Data */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-teal mb-4">Rentometer Market Data</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <span className="text-xs text-teal/50 uppercase">Median</span>
                <p className="text-lg font-bold text-teal">{formatCurrency(result.report.rentometer.median)}</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase">Mean</span>
                <p className="text-lg font-bold text-teal">{formatCurrency(result.report.rentometer.mean)}</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase">Sample Size</span>
                <p className="text-lg font-bold text-teal">{result.report.rentometer.sampleCount}</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase">Radius</span>
                <p className="text-lg font-bold text-teal">{result.report.rentometer.radiusMiles} mi</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-teal/50 uppercase">25th Percentile</span>
                <p className="text-teal font-medium">{formatCurrency(result.report.rentometer.percentile25)}</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase">75th Percentile</span>
                <p className="text-teal font-medium">{formatCurrency(result.report.rentometer.percentile75)}</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase">Min</span>
                <p className="text-teal font-medium">{formatCurrency(result.report.rentometer.minRent)}</p>
              </div>
              <div>
                <span className="text-xs text-teal/50 uppercase">Max</span>
                <p className="text-teal font-medium">{formatCurrency(result.report.rentometer.maxRent)}</p>
              </div>
            </div>

            {result.report.rentometer.nearbyComps.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-teal mt-6 mb-2">Nearby Comps</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-teal text-cream">
                        <th className="px-3 py-2 text-left font-medium rounded-tl-lg">Address</th>
                        <th className="px-3 py-2 text-right font-medium">Rent</th>
                        <th className="px-3 py-2 text-center font-medium">Bed/Bath</th>
                        <th className="px-3 py-2 text-right font-medium">SQFT</th>
                        <th className="px-3 py-2 text-right font-medium">$/SQFT</th>
                        <th className="px-3 py-2 text-right font-medium rounded-tr-lg">Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.report.rentometer.nearbyComps.map((comp, i) => (
                        <tr key={i} className={i % 2 === 1 ? "bg-cream/50" : ""}>
                          <td className="px-3 py-2 text-teal font-medium">{comp.address}</td>
                          <td className="px-3 py-2 text-right text-teal">{formatCurrency(comp.price)}</td>
                          <td className="px-3 py-2 text-center text-teal/70">{comp.bedrooms}/{comp.baths}</td>
                          <td className="px-3 py-2 text-right text-teal/70">{comp.sqft.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right text-teal/70">${formatNumber(comp.dollarSqft, 2)}</td>
                          <td className="px-3 py-2 text-right text-teal/70">{formatNumber(comp.distance, 2)} mi</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
