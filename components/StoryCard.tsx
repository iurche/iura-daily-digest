"use client";

import { useRef, useEffect, useState, useCallback, KeyboardEvent } from "react";
import type { Story } from "@/lib/types";
import { TOPIC_LABELS } from "@/lib/topic-labels";
import SaveButton from "@/components/SaveButton";
import { getFallbackUrl } from "@/lib/fallback";
import { useShelf } from "@/lib/store";

type StoryCardProps = {
  story: Story;
  date: string;
};

export default function StoryCard({ story, date }: StoryCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { toggle } = useShelf();
  const imageUrl = story.imageUrl ?? getFallbackUrl(story.id, story.topic);
  const isLocal = imageUrl.startsWith("/");

  // Intersection Observer for fade-in
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter") {
        window.open(story.sourceUrl, "_blank", "noopener,noreferrer");
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        toggle(story.id);
      }
    },
    [story.sourceUrl, story.id, toggle]
  );

  return (
    <article
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`group flex flex-col border border-gray-200 hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 ${
        visible ? "animate-fade-in" : "opacity-0"
      }`}
      aria-label={`${story.headline} — ${story.source}`}
    >
      {/* Image */}
      <div
        className="relative w-full overflow-hidden bg-gray-100 flex-shrink-0"
        style={{ aspectRatio: "3/2" }}
      >
        {isLocal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={story.headline}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={story.headline}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <p
          className="font-sans text-gray-500 mb-2"
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          {TOPIC_LABELS[story.topic] ?? story.topic}
        </p>

        <a
          href={story.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          className="flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-serif text-xl sm:text-2xl text-gray-900 leading-snug group-hover:text-gray-600 transition-colors line-clamp-3">
            {story.headline}
          </h3>
        </a>

        <p className="font-sans text-sm text-gray-500 leading-relaxed mt-2 line-clamp-2">
          {story.dek}
        </p>

        <footer className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span
            className="font-sans text-gray-400"
            style={{
              fontSize: "0.6875rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {story.source}
          </span>
          <SaveButton storyId={story.id} />
        </footer>
      </div>
    </article>
  );
}
