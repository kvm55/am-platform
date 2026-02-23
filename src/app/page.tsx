import Link from "next/link";

const tools = [
  {
    title: "Comp Analysis",
    description:
      "Run automated rental comp analysis on any SFR property. Get comps, rent recommendations, vacancy scenarios, and property scores.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "bg-teal",
  },
  {
    title: "Portfolio Summary",
    description:
      "View aggregated metrics across all your analyzed properties. Track rent performance, scores, and export portfolio data.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: "bg-teal-light",
  },
  {
    title: "Underwriting",
    description:
      "Build full underwriting models for Long Term Hold, Fix & Flip, or Short Term Rental investments. Get IRR, cap rate, DSCR, and recommendations.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-teal-dark",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold text-teal mb-4">
            <span className="text-teal">Propwell</span>{" "}
            <span className="bg-teal text-greenery px-3 py-1 rounded-lg">AMP</span>
          </h1>
          <p className="text-xl text-teal/80 mb-8">
            Asset management tools for single-family rental portfolios.
            Comp analysis, portfolio insights, and underwriting — all in one platform.
          </p>
          <div className="flex justify-center">
            <Link
              href="/signin"
              className="bg-teal text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-light transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Tools */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="border-t border-beige/50 pt-12">
          <h2 className="text-sm font-semibold text-teal/50 uppercase tracking-wider mb-8 text-center">
            Platform Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.title}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div
                    className={`${tool.color} text-greenery w-12 h-12 rounded-lg flex items-center justify-center shrink-0`}
                  >
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-teal">{tool.title}</h3>
                </div>
                <p className="text-sm text-teal/60 leading-relaxed text-center">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
