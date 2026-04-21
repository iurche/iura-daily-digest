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
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3"
      aria-label="Topic navigation"
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href="/"
          className={`flex-shrink-0 px-2 py-1 font-sans text-xs transition-colors ${
            pathname === "/"
              ? "text-gray-900 font-medium border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
          style={{ whiteSpace: "nowrap" }}
        >
          Today
        </Link>

        <span className="text-gray-300">|</span>

        {TOPICS.map((topic) => (
          <Link
            key={topic}
            href={`/topic/${topic}`}
            className={`flex-shrink-0 px-2 py-1 font-sans text-xs transition-colors ${
              currentTopic === topic
                ? "text-gray-900 font-medium border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
            style={{ whiteSpace: "nowrap" }}
          >
            {TOPIC_LABELS[topic]}
          </Link>
        ))}

        <span className="text-gray-300">|</span>

        <Link
          href="/archive"
          className={`flex-shrink-0 px-2 py-1 font-sans text-xs transition-colors ${
            pathname === "/archive"
              ? "text-gray-900 font-medium border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
          style={{ whiteSpace: "nowrap" }}
        >
          Archive
        </Link>

        <Link
          href="/shelf"
          className={`flex-shrink-0 px-2 py-1 font-sans text-xs transition-colors ${
            pathname === "/shelf"
              ? "text-gray-900 font-medium border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
          style={{ whiteSpace: "nowrap" }}
        >
          Shelf
        </Link>
      </div>
    </nav>
  );
}
