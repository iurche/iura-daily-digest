import type { Metadata } from "next";
import Link from "next/link";
import { getAllDates } from "@/lib/digests";

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse all past issues of Iura's Daily Digest.",
};

function groupByMonth(dates: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const date of dates) {
    const [year, month] = date.split("-");
    const key = `${year}-${month}`;
    const existing = map.get(key) ?? [];
    map.set(key, [...existing, date]);
  }
  return map;
}

function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" }
  );
}

function formatDay(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
  });
}

export default function ArchivePage() {
  const allDates = getAllDates();
  const grouped = groupByMonth(allDates);
  const dateSet = new Set(allDates);

  return (
    <div>
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="font-serif text-4xl text-gray-900">Archive</h1>
        <p className="text-gray-500 text-sm font-sans mt-2">
          {allDates.length} {allDates.length === 1 ? "issue" : "issues"}{" "}
          published
        </p>
      </div>

      {allDates.length === 0 && (
        <p className="text-gray-500 font-sans text-base">
          No issues published yet. Run{" "}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
            pnpm build-digest
          </code>{" "}
          to generate the first one.
        </p>
      )}

      <div className="space-y-12">
        {Array.from(grouped.entries()).map(([yearMonth, dates]) => (
          <div key={yearMonth}>
            <h2 className="font-sans text-xs uppercase tracking-widest text-gray-500 mb-4">
              {formatMonth(yearMonth)}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
              {dates.map((date) => {
                const exists = dateSet.has(date);
                return (
                  <Link
                    key={date}
                    href={`/${date}`}
                    className={`block border rounded p-3 text-center transition-all ${
                      exists
                        ? "border-gray-200 hover:border-gray-300 hover:bg-gray-100 cursor-pointer"
                        : "border-gray-200/40 opacity-40 pointer-events-none"
                    }`}
                  >
                    <span className="block font-sans text-xs text-gray-500 mb-1">
                      {formatDay(date)}
                    </span>
                    <span className="block font-serif text-sm text-gray-900">
                      {date.split("-")[2]}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
