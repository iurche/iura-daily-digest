"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const [theme, setTheme] = useState("dark");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("dd-theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dd-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-250 ${
        scrolled ? "h-13 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border)]" : "h-16 bg-transparent border-transparent"
      }`}
      style={{
        height: scrolled ? 52 : 64,
        background: scrolled ? "var(--nav-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderColor: scrolled ? "var(--border)" : "transparent",
      }}
    >
      <div className="flex items-center justify-between h-full px-5 md:px-[5vw] lg:px-20">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand)] flex items-center justify-center">
            <span className="text-xs font-extrabold text-white tracking-tight">DD</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-[var(--text-strong)]">
            Daily Digest
          </span>
          {!scrolled && (
            <span className="text-xs text-[var(--text-muted)] ml-1">
              Apr 22, 2026
            </span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/shelf"
            className={`flex items-center gap-1.5 border rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-150 ${
              pathname === "/shelf"
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-[var(--border)] text-[var(--text-med)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            }`}
            style={{
              borderColor: pathname === "/shelf" ? "var(--brand)" : "var(--border)",
              color: pathname === "/shelf" ? "var(--brand)" : "var(--text-med)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Shelf
          </Link>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:border-[var(--border-med)] hover:text-[var(--text-strong)] transition-all duration-150"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}