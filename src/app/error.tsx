"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-teal rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-greenery" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-teal mb-2">Something went wrong</h1>
        <p className="text-teal/60 mb-8">
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-teal text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-light transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="bg-white text-teal border border-beige px-6 py-2.5 rounded-lg font-medium hover:bg-cream transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
