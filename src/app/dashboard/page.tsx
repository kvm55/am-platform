"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const tools = [
  {
    title: "Comp Analysis",
    description: "Run automated rental comp analysis on any SFR property. Get comps, rent recommendations, vacancy scenarios, and property scores.",
    href: "/tools/comp-analysis",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "bg-teal",
  },
  {
    title: "Portfolio Summary",
    description: "View aggregated metrics across all your analyzed properties. Track rent performance, scores, and export portfolio data.",
    href: "/tools/portfolio",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "bg-teal-light",
  },
  {
    title: "Underwriting",
    description: "Build full underwriting models for Long Term Hold, Fix & Flip, or Short Term Rental investments. Get IRR, cap rate, DSCR, and recommendations.",
    href: "/tools/underwriting",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-teal-dark",
  },
];

interface RecentAnalysis {
  id: string;
  address: string;
  recommended_rent: number | null;
  score_data: { totalScore: number; grade: string } | null;
  created_at: string;
}

interface RecentModel {
  id: string;
  investment_type: string;
  inputs: { streetAddress?: string; city?: string; state?: string } | null;
  recommendation: { action: string; confidence: string } | null;
  created_at: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [analyses, setAnalyses] = useState<RecentAnalysis[]>([]);
  const [models, setModels] = useState<RecentModel[]>([]);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!user) return;

    setFetchError("");

    fetch("/api/analyses")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAnalyses(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => setFetchError("Failed to load recent data."));

    fetch("/api/underwrite")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setModels(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => setFetchError("Failed to load recent data."));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-teal/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal">Dashboard</h1>
        <p className="text-teal/60 mt-1">
          Welcome back{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      {fetchError && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-6">{fetchError}</p>
      )}

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {tools.map((tool) => (
          <Link
            key={tool.title}
            href={tool.href}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 group"
          >
            <div className={`${tool.color} text-greenery w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
              {tool.icon}
            </div>
            <h3 className="text-lg font-semibold text-teal mb-2">{tool.title}</h3>
            <p className="text-sm text-teal/60 leading-relaxed">{tool.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-teal">Recent Analyses</h2>
            {analyses.length > 0 && (
              <Link href="/tools/portfolio" className="text-xs text-teal/50 hover:text-teal">
                View all
              </Link>
            )}
          </div>
          {analyses.length === 0 ? (
            <div className="text-sm text-teal/50 py-8 text-center">
              <p className="mb-2">No analyses yet.</p>
              <Link href="/tools/comp-analysis" className="text-teal font-medium hover:underline">
                Run a comp analysis
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-beige/50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-teal truncate">{a.address}</p>
                    <p className="text-xs text-teal/50">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {a.recommended_rent && (
                      <span className="text-sm text-teal font-medium">{formatCurrency(a.recommended_rent)}</span>
                    )}
                    {a.score_data?.grade && (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        a.score_data.grade === "A" ? "bg-green-100 text-green-700" :
                        a.score_data.grade === "B" ? "bg-teal/10 text-teal" :
                        a.score_data.grade === "C" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {a.score_data.grade}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Models */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-teal">Recent Models</h2>
            {models.length > 0 && (
              <Link href="/tools/underwriting" className="text-xs text-teal/50 hover:text-teal">
                View all
              </Link>
            )}
          </div>
          {models.length === 0 ? (
            <div className="text-sm text-teal/50 py-8 text-center">
              <p className="mb-2">No underwriting models yet.</p>
              <Link href="/tools/underwriting" className="text-teal font-medium hover:underline">
                Create a model
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {models.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b border-beige/50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-teal truncate">
                      {m.inputs?.streetAddress
                        ? `${m.inputs.streetAddress}${m.inputs.city ? `, ${m.inputs.city}` : ""}`
                        : "Untitled Model"}
                    </p>
                    <p className="text-xs text-teal/50">
                      {m.investment_type} &middot; {new Date(m.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0 ml-3">
                    {m.recommendation?.action && (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        m.recommendation.action === "Buy" ? "bg-green-100 text-green-700" :
                        m.recommendation.action === "Hold" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {m.recommendation.action}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
