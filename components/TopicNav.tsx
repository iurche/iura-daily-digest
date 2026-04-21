"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOPIC_LABELS } from "@/lib/topic-labels";

type TopicNavProps = {
  activeTopic?: string;
};

const TOPICS = Object.keys(TOPIC_LABELS);

export default function TopicNav({ activeTopic }: TopicNavProps) {
  const pathname = usePathname();

  // Determine active topic from pathname or prop
  const currentTopic =
    activeTopic ??
    (pathname.startsWith("/topic/") ? pathname.split("/topic/")[1] : null);

  return (
    <nav
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2"
      aria-label="Topic navigation"
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
        <Link
          href="/"
          className={`flex-shrink-0 px-3 py-1.5 font-sans text-xs transition-colors rounded-full ${
            pathname === "/"
              ? "bg-ink text-cream"
              : "text-muted hover:text-ink hover:bg-rule"
          }`}
          style={{ letterSpacing: "0.05em", whiteSpace: "nowrap" }}
        >
          Today
        </Link>

        <div className="w-px h-4 bg-rule mx-1 flex-shrink-0" />

        {TOPICS.map((topic) => (
          <Link
            key={topic}
            href={`/topic/${topic}`}
            className={`flex-shrink-0 px-3 py-1.5 font-sans text-xs transition-colors rounded-full ${
              currentTopic === topic
                ? "bg-red text-cream"
                : "text-muted hover:text-ink hover:bg-rule"
            }`}
            style={{ letterSpacing: "0.03em", whiteSpace: "nowrap" }}
          >
            {TOPIC_LABELS[topic]}
          </Link>
        ))}

        <div className="w-px h-4 bg-rule mx-1 flex-shrink-0" />

        <Link
          href="/archive"
          className={`flex-shrink-0 px-3 py-1.5 font-sans text-xs transition-colors rounded-full ${
            pathname === "/archive"
              ? "bg-ink text-cream"
              : "text-muted hover:text-ink hover:bg-rule"
          }`}
          style={{ letterSpacing: "0.03em", whiteSpace: "nowrap" }}
        >
          Archive
        </Link>

        <Link
          href="/shelf"
          className={`flex-shrink-0 px-3 py-1.5 font-sans text-xs transition-colors rounded-full ${
            pathname === "/shelf"
              ? "bg-ink text-cream"
              : "text-muted hover:text-ink hover:bg-rule"
          }`}
          style={{ letterSpacing: "0.03em", whiteSpace: "nowrap" }}
        >
          Shelf
        </Link>
      </div>
    </nav>
  );
}
