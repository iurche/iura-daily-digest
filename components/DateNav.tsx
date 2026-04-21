"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type DateNavProps = {
  currentDate: string;
  prevDate: string | null;
  nextDate: string | null;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DateNav({
  currentDate,
  prevDate,
  nextDate,
}: DateNavProps) {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "[" && prevDate) router.push(`/${prevDate}`);
      if (e.key === "]" && nextDate) router.push(`/${nextDate}`);
    },
    [prevDate, nextDate, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val) router.push(`/${val}`);
  }

  return (
    <nav
      className="flex items-center justify-between border-t border-b border-gray-200 py-4 font-sans"
      aria-label="Date navigation"
    >
      {/* Previous */}
      <div className="w-28">
        {prevDate ? (
          <Link
            href={`/${prevDate}`}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
            aria-label={`Previous issue: ${prevDate}`}
          >
            <span className="text-base group-hover:-translate-x-1 transition-transform">
              &larr;
            </span>
            <span className="hidden sm:inline">{formatDate(prevDate)}</span>
            <span className="sm:hidden">Prev</span>
          </Link>
        ) : (
          <span className="text-sm text-gray-500/40">&larr; Older</span>
        )}
      </div>

      {/* Current date + date picker */}
      <div className="flex flex-col items-center gap-1">
        <span
          className="text-xs text-gray-500"
          style={{ letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          {formatDate(currentDate)}
        </span>
        <input
          type="date"
          defaultValue={currentDate}
          onChange={handleDateChange}
          className="text-xs text-gray-500 bg-transparent border-b border-gray-200 focus:outline-none focus:border-ink cursor-pointer"
          aria-label="Jump to date"
          style={{ letterSpacing: "0.05em" }}
        />
        <span className="text-xs text-gray-500/50" style={{ fontSize: "0.65rem" }}>
          [ prev &nbsp; ] next
        </span>
      </div>

      {/* Next */}
      <div className="w-28 flex justify-end">
        {nextDate ? (
          <Link
            href={`/${nextDate}`}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
            aria-label={`Next issue: ${nextDate}`}
          >
            <span className="hidden sm:inline">{formatDate(nextDate)}</span>
            <span className="sm:hidden">Next</span>
            <span className="text-base group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </Link>
        ) : (
          <span className="text-sm text-gray-500/40">Newer &rarr;</span>
        )}
      </div>
    </nav>
  );
}
