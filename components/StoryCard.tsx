"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SaveButton from "./SaveButton";
import { TOPIC_LABELS, TOPIC_COLORS } from "@/lib/topics";

type Story = {
  id: string;
  topic: string;
  headline: string;
  dek: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
};

type StoryCardProps = {
  story: Story;
  size?: "md" | "lg";
  delay?: number;
};

export default function StoryCard({ story, size = "md", delay = 0 }: StoryCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const topicColor = TOPIC_COLORS[story.topic] || "var(--text-muted)";

  return (
    <article
      className="fade-up bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden transition-all duration-200 hover:border-[var(--border-med)] hover:shadow-elevated flex flex-col"
      style={{
        animationDelay: `${delay}ms`,
        boxShadow: "var(--card-shadow)",
        borderRadius: 16,
      }}
    >
      <Link
        href={story.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-video overflow-hidden flex-shrink-0"
      >
        {!imgErr && story.imageUrl ? (
          <Image
            src={story.imageUrl}
            alt={story.headline}
            fill
            className="object-cover transition-transform duration-400 hover:scale-105"
            onError={() => setImgErr(true)}
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        ) : (
          <div className="w-full h-full bg-[var(--surface-2)] flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border"
            style={{
              background: "var(--bg)",
              backdropFilter: "blur(8px)",
              borderColor: "var(--border)",
              color: topicColor,
            }}
          >
            {TOPIC_LABELS[story.topic] || story.topic}
          </span>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <Link
          href={story.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <h3
            className="font-semibold leading-snug text-[var(--text-strong)] line-clamp-3 transition-colors duration-150 hover:text-[var(--brand)]"
            style={{
              fontSize: size === "lg" ? 17 : 15,
            }}
          >
            {story.headline}
          </h3>
        </Link>

        <p className="text-sm text-[var(--text-muted)] line-clamp-2 flex-1">
          {story.dek}
        </p>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {story.source}
          </span>
          <SaveButton storyId={story.id} />
        </div>
      </div>
    </article>
  );
}