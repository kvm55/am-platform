"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { formatCurrency, formatNumber, gradeColorClass } from "@/lib/format";
import type { Tier1Report } from "@/lib/pipeline/types";
import type { PropertyScore } from "@/lib/scoring";

interface AnalysisRecord {
  id: string;
  address: string;
  report_json: Tier1Report;
  score_data: PropertyScore;
  created_at: string;
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

export default function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/analyze/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Analysis not found");
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="h-5 w-40 bg-beige/40 rounded animate-pulse mb-4" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 w-full bg-beige/20 rounded animate-pulse mb-2" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Comp Analysis", href: "/tools/comp-analysis" },
          { label: "Not Found" },
        ]} />
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-red-600 mb-4">{error || "Analysis not found"}</p>
          <Link href="/tools/comp-analysis" className="text-teal font-medium hover:underline">
            Back to Comp Analysis
          </Link>
        </div>
      </div>
    );
  }

  const report = data.report_json;
  const score = data.score_data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Comp Analysis", href: "/tools/comp-analysis" },
        { label: `Analysis #${id.slice(0, 8)}` },
      ]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal">{data.address}</h1>
        <p className="text-teal/60 mt-1">
          Analyzed {new Date(data.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        {/* Subject Property */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-teal mb-4">Subject Property</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-teal/50 uppercase tracking-wide">Address</span>
              <p className="text-teal font-medium">{report.subject.address}</p>
              <p className="text-sm text-teal/60">{report.subject.city}, {report.subject.state} {report.subject.zipCode}</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase tracking-wide">Bed / Bath</span>
              <p className="text-teal font-medium">{report.subject.bedrooms} bd / {report.subject.bathrooms} ba</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase tracking-wide">SQFT</span>
              <p className="text-teal font-medium">{report.subject.sqft.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase tracking-wide">Year Built</span>
              <p className="text-teal font-medium">{report.subject.yearBuilt || "N/A"}</p>
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
                  score.grade === "A" ? "text-green-600" :
                  score.grade === "B" ? "text-teal" :
                  score.grade === "C" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {score.totalScore}
                </div>
                <div className={`text-sm font-semibold px-2 py-0.5 rounded ${gradeColorClass(score.grade)}`}>
                  Grade {score.grade}
                </div>
                <p className="text-xs text-teal/50 mt-1">&plusmn;{score.confidenceBand} pts</p>
              </div>
            </div>

            <div className="space-y-3">
              <ScoreBar label="Rent Positioning" score={score.rentPositioningScore} />
              <ScoreBar label="Market Health" score={score.marketHealthScore} />
              <ScoreBar label="Competitiveness" score={score.competitivenessScore} />
              <ScoreBar label="Vacancy Risk" score={score.vacancyRiskScore} />
            </div>

            {score.strengths.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Strengths</h4>
                {score.strengths.map((s, i) => (
                  <p key={i} className="text-sm text-teal/80">+ {s}</p>
                ))}
              </div>
            )}
            {score.watchItems.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1">Watch</h4>
                {score.watchItems.map((w, i) => (
                  <p key={i} className="text-sm text-teal/80">~ {w}</p>
                ))}
              </div>
            )}
            {score.redFlags.length > 0 && (
              <div className="mt-2">
                <h4 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Red Flags</h4>
                {score.redFlags.map((f, i) => (
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
                {formatCurrency(report.rentRecommendation.recommendedRent)}
              </p>
              <p className="text-cream/60 text-xs mt-1">PPSQFT Method (${formatNumber(report.rentRecommendation.avgPpsqft, 3)}/sqft)</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-teal/60">PPSQFT Method</span>
                <span className="text-teal font-medium">{formatCurrency(report.rentRecommendation.ppsqftMethod)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal/60">Direct Comp Average</span>
                <span className="text-teal font-medium">{formatCurrency(report.rentRecommendation.directAverage)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal/60">RentCast AVM</span>
                <span className="text-teal font-medium">{formatCurrency(report.rentRecommendation.rentcastAvm)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal/60">Rentometer Median</span>
                <span className="text-teal font-medium">{formatCurrency(report.rentRecommendation.rentometerMedian)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparable Properties Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-teal">Comparable Properties</h2>
            <span className="text-xs text-teal/50 bg-cream px-2 py-1 rounded">
              Expansion Level {report.compResult.expansionLevel}
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
                {report.compResult.comps.map((comp, i) => (
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
                  <td className="px-3 py-2 text-right text-teal">{formatCurrency(report.compResult.avgRent)}</td>
                  <td className="px-3 py-2 text-right text-teal">${formatNumber(report.compResult.avgPpsqft, 3)}</td>
                  <td className="px-3 py-2 text-right text-teal">
                    {report.compResult.avgDom !== null ? Math.round(report.compResult.avgDom) : "—"}
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
              <p className="text-lg font-bold text-teal">{formatCurrency(report.vacancy.dailyRevenue)}</p>
            </div>
            <div className="bg-cream/50 rounded-lg p-3 text-center">
              <p className="text-xs text-teal/50 uppercase">Monthly Spread</p>
              <p className="text-lg font-bold text-teal">{formatCurrency(report.vacancy.monthlySpread)}</p>
            </div>
            <div className="bg-cream/50 rounded-lg p-3 text-center">
              <p className="text-xs text-teal/50 uppercase">Breakeven Days</p>
              <p className="text-lg font-bold text-teal">{formatNumber(report.vacancy.breakevenDays, 1)}</p>
            </div>
            <div className="bg-cream/50 rounded-lg p-3 text-center">
              <p className="text-xs text-teal/50 uppercase">Market Rate</p>
              <p className="text-lg font-bold text-teal">{formatCurrency(report.vacancy.marketRate)}</p>
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
                {report.vacancy.scenarios.map((s, i) => (
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
            {Object.entries(report.vacancy.lossTable).map(([days, loss]) => (
              <div key={days} className="bg-cream/50 rounded-lg p-2 text-center">
                <p className="text-xs text-teal/50">{days} days</p>
                <p className="text-sm font-medium text-red-600">-{formatCurrency(loss)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rentometer Data */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-teal mb-4">Rentometer Market Data</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <span className="text-xs text-teal/50 uppercase">Median</span>
              <p className="text-lg font-bold text-teal">{formatCurrency(report.rentometer.median)}</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase">Mean</span>
              <p className="text-lg font-bold text-teal">{formatCurrency(report.rentometer.mean)}</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase">Sample Size</span>
              <p className="text-lg font-bold text-teal">{report.rentometer.sampleCount}</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase">Radius</span>
              <p className="text-lg font-bold text-teal">{report.rentometer.radiusMiles} mi</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-teal/50 uppercase">25th Percentile</span>
              <p className="text-teal font-medium">{formatCurrency(report.rentometer.percentile25)}</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase">75th Percentile</span>
              <p className="text-teal font-medium">{formatCurrency(report.rentometer.percentile75)}</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase">Min</span>
              <p className="text-teal font-medium">{formatCurrency(report.rentometer.minRent)}</p>
            </div>
            <div>
              <span className="text-xs text-teal/50 uppercase">Max</span>
              <p className="text-teal font-medium">{formatCurrency(report.rentometer.maxRent)}</p>
            </div>
          </div>

          {report.rentometer.nearbyComps.length > 0 && (
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
                    {report.rentometer.nearbyComps.map((comp, i) => (
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

        {/* Back Button */}
        <div className="flex justify-center">
          <Link
            href="/tools/comp-analysis"
            className="bg-white text-teal border border-beige px-6 py-2.5 rounded-lg font-medium hover:bg-cream transition-colors"
          >
            Run Another Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
