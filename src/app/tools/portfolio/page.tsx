"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { formatCurrency, gradeColorClass } from "@/lib/format";

interface AnalysisSummary {
  id: string;
  address: string;
  recommended_rent: number;
  score_data: { totalScore: number; grade: string } | null;
  comps_data: { avgPpsqft: number; comps: unknown[] } | null;
  created_at: string;
}

interface PortfolioData {
  propertyCount: number;
  totalRecommendedRent: number;
  avgScore: number;
  avgPpsqft: number;
  analyses: AnalysisSummary[];
}

function SortIcon({ field, activeField, dir }: { field: string; activeField: string; dir: "asc" | "desc" }) {
  if (field !== activeField) return null;
  return dir === "asc" ? (
    <svg className="w-3.5 h-3.5 inline-block ml-1 text-greenery" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 inline-block ml-1 text-greenery" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<"address" | "rent" | "score" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [exportError, setExportError] = useState("");

  const fetchPortfolio = useCallback(async () => {
    try {
      const resp = await fetch("/api/portfolio");
      if (!resp.ok) throw new Error("Failed to load portfolio");
      const data = await resp.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleExport = async () => {
    setExportError("");
    try {
      const resp = await fetch("/api/portfolio/export");
      if (!resp.ok) throw new Error("Export failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portfolio_export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Failed to export CSV. Please try again.");
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortedAnalyses = data?.analyses ? [...data.analyses].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortField) {
      case "address": return a.address.localeCompare(b.address) * dir;
      case "rent": return ((a.recommended_rent || 0) - (b.recommended_rent || 0)) * dir;
      case "score": return ((a.score_data?.totalScore || 0) - (b.score_data?.totalScore || 0)) * dir;
      case "date": return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      default: return 0;
    }
  }) : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-56 bg-beige/50 rounded animate-pulse" />
            <div className="h-4 w-72 bg-beige/30 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5">
              <div className="h-3 w-20 bg-beige/30 rounded animate-pulse mb-2" />
              <div className="h-8 w-24 bg-beige/40 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="h-5 w-44 bg-beige/40 rounded animate-pulse mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between py-3 border-b border-beige/20">
              <div className="h-4 w-56 bg-beige/30 rounded animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-beige/30 rounded animate-pulse" />
                <div className="h-4 w-10 bg-beige/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Portfolio" },
      ]} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-teal">Portfolio Summary</h1>
          <p className="text-teal/60 mt-1">Aggregated metrics across all analyzed properties</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setLoading(true); fetchPortfolio(); }}
            className="bg-white text-teal border border-beige p-2 rounded-lg hover:bg-cream transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {data && data.analyses.length > 0 && (
            <button
              onClick={handleExport}
              className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-light transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-6">{error}</p>
      )}
      {exportError && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-6">{exportError}</p>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs text-teal/50 uppercase tracking-wide">Properties</p>
          <p className="text-3xl font-bold text-teal">{data?.propertyCount || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs text-teal/50 uppercase tracking-wide">Total Recommended Rent</p>
          <p className="text-3xl font-bold text-teal">
            {formatCurrency(data?.totalRecommendedRent || 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs text-teal/50 uppercase tracking-wide">Avg Score</p>
          <p className="text-3xl font-bold text-teal">
            {data?.avgScore ? data.avgScore.toFixed(0) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-xs text-teal/50 uppercase tracking-wide">Avg $/SQFT</p>
          <p className="text-3xl font-bold text-teal">
            {data?.avgPpsqft ? `$${data.avgPpsqft.toFixed(2)}` : "—"}
          </p>
        </div>
      </div>

      {/* Property Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-teal mb-4">Analyzed Properties</h2>

        {sortedAnalyses.length === 0 ? (
          <div className="text-center py-12 text-teal/50">
            <p className="text-lg mb-2">No analyses yet</p>
            <p className="text-sm mb-3">Run a comp analysis to start building your portfolio view.</p>
            <Link href="/tools/comp-analysis" className="text-teal font-medium hover:underline">
              Run a Comp Analysis
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal text-cream">
                  <th
                    className="px-3 py-2 text-left font-medium cursor-pointer rounded-tl-lg hover:bg-teal-light"
                    onClick={() => handleSort("address")}
                  >
                    Address<SortIcon field="address" activeField={sortField} dir={sortDir} />
                  </th>
                  <th
                    className="px-3 py-2 text-right font-medium cursor-pointer hover:bg-teal-light"
                    onClick={() => handleSort("rent")}
                  >
                    Rec. Rent<SortIcon field="rent" activeField={sortField} dir={sortDir} />
                  </th>
                  <th
                    className="px-3 py-2 text-center font-medium cursor-pointer hover:bg-teal-light"
                    onClick={() => handleSort("score")}
                  >
                    Score<SortIcon field="score" activeField={sortField} dir={sortDir} />
                  </th>
                  <th className="px-3 py-2 text-center font-medium">Grade</th>
                  <th className="px-3 py-2 text-right font-medium">$/SQFT</th>
                  <th className="px-3 py-2 text-center font-medium">Comps</th>
                  <th
                    className="px-3 py-2 text-right font-medium cursor-pointer rounded-tr-lg hover:bg-teal-light"
                    onClick={() => handleSort("date")}
                  >
                    Date<SortIcon field="date" activeField={sortField} dir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAnalyses.map((analysis, i) => (
                  <tr key={analysis.id} className={`${i % 2 === 1 ? "bg-cream/50" : ""} hover:bg-cream/70 cursor-pointer transition-colors`} onClick={() => window.location.href = `/tools/comp-analysis/${analysis.id}`}>
                    <td className="px-3 py-2 text-teal font-medium">{analysis.address}</td>
                    <td className="px-3 py-2 text-right text-teal">
                      {analysis.recommended_rent ? formatCurrency(analysis.recommended_rent) : "—"}
                    </td>
                    <td className="px-3 py-2 text-center text-teal font-medium">
                      {analysis.score_data?.totalScore ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {analysis.score_data?.grade ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${gradeColorClass(analysis.score_data.grade)}`}>
                          {analysis.score_data.grade}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-teal/70">
                      {analysis.comps_data?.avgPpsqft ? `$${analysis.comps_data.avgPpsqft.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-center text-teal/70">
                      {Array.isArray(analysis.comps_data?.comps) ? analysis.comps_data.comps.length : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-teal/70">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
