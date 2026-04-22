import Link from "next/link";
import { getAllDates } from "@/lib/digests";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getIssueNumber(dates: string[]): number {
  return dates.length > 0 ? 204 + (dates.length - 1) : 204;
}

export default function Footer() {
  const dates = getAllDates();
  const today = new Date();
  const formattedDate = formatDate(today);
  const issueNumber = getIssueNumber(dates);

  return (
    <footer className="border-t border-[var(--border)] px-5 md:px-[5vw] lg:px-20 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-[var(--brand)] flex items-center justify-center">
          <span className="text-[8px] font-extrabold text-white">DD</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          Daily Digest · {formattedDate} · Issue #{issueNumber}
        </span>
      </div>
      <span className="text-xs text-[var(--text-muted)] hidden sm:block">
        Curated intelligence for product designers building in the AI era
      </span>
    </footer>
  );
}