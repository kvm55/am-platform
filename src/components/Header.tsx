"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import AmpBoltIcon from "@/components/AmpBoltIcon";

export default function Header() {
  const { user, signOut } = useAuth();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toolsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [toolsOpen]);

  return (
    <header className="bg-teal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
            <AmpBoltIcon size={28} />
            <span className="text-beige font-bold text-xl tracking-tight">Propwell</span>
            <span className="text-greenery text-sm font-medium">AMP</span>
          </Link>

          <>
            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href={user ? "/dashboard" : "/signin"} className="text-cream hover:text-greenery transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setToolsOpen(!toolsOpen)}
                  className="text-cream hover:text-greenery transition-colors text-sm font-medium flex items-center gap-1"
                >
                  Tools
                  <svg className={`w-4 h-4 transition-transform ${toolsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {toolsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link href={user ? "/tools/comp-analysis" : "/signin"} className="block px-4 py-2 text-teal hover:bg-cream text-sm" onClick={() => setToolsOpen(false)}>
                      Comp Analysis
                    </Link>
                    <Link href={user ? "/tools/portfolio" : "/signin"} className="block px-4 py-2 text-teal hover:bg-cream text-sm" onClick={() => setToolsOpen(false)}>
                      Portfolio Summary
                    </Link>
                    <Link href={user ? "/tools/underwriting" : "/signin"} className="block px-4 py-2 text-teal hover:bg-cream text-sm" onClick={() => setToolsOpen(false)}>
                      Underwriting
                    </Link>
                  </div>
                )}
              </div>
              {user ? (
                <button onClick={signOut} className="text-cream hover:text-greenery transition-colors text-sm font-medium">
                  Sign Out
                </button>
              ) : (
                <Link href="/signin" className="bg-greenery text-teal px-4 py-1.5 rounded-md text-sm font-medium hover:bg-greenery-dark transition-colors">
                  Sign In
                </Link>
              )}
            </nav>

            {/* Mobile hamburger */}
            <button className="md:hidden text-cream" onClick={() => setMobileOpen(!mobileOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href={user ? "/dashboard" : "/signin"} className="block text-cream hover:text-greenery py-1 text-sm" onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
            <Link href={user ? "/tools/comp-analysis" : "/signin"} className="block text-cream hover:text-greenery py-1 text-sm" onClick={() => setMobileOpen(false)}>
              Comp Analysis
            </Link>
            <Link href={user ? "/tools/portfolio" : "/signin"} className="block text-cream hover:text-greenery py-1 text-sm" onClick={() => setMobileOpen(false)}>
              Portfolio Summary
            </Link>
            <Link href={user ? "/tools/underwriting" : "/signin"} className="block text-cream hover:text-greenery py-1 text-sm" onClick={() => setMobileOpen(false)}>
              Underwriting
            </Link>
            {user ? (
              <button onClick={signOut} className="block text-cream hover:text-greenery py-1 text-sm">
                Sign Out
              </button>
            ) : (
              <Link href="/signin" className="block text-greenery font-medium py-1 text-sm" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
