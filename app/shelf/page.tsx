"use client";

import { useEffect, useState, useMemo } from "react";
import { useShelf } from "@/lib/store";
import type { Story } from "@/lib/types";
import { TOPIC_LABELS } from "@/lib/topic-labels";
import StoryCard from "@/components/StoryCard";
import ShelfFilters from "@/components/ShelfFilters";

type StoriesApiResponse = {
  stories: (Story & { date: string })[];
};

export default function ShelfPage() {
  const { saved, hydrate } = useShelf();
  const [allStories, setAllStories] = useState<(Story & { date: string })[]>([]);
  const [filtered, setFiltered] = useState<(Story & { date: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    fetch("/api/stories")
      .then((r) => r.json())
      .then((data: StoriesApiResponse) => {
        setAllStories(data.stories);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const savedStories = useMemo(
    () => allStories.filter((s) => saved.has(s.id)),
    [allStories, saved]
  );

  // Sync filtered with savedStories when they change
  useEffect(() => {
    setFiltered(savedStories);
  }, [savedStories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-500 font-sans text-sm">Loading your shelf&hellip;</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="font-serif text-4xl text-gray-900">Your Shelf</h1>
        <p className="text-gray-500 text-sm font-sans mt-2">
          {savedStories.length}{" "}
          {savedStories.length === 1 ? "story" : "stories"} saved
        </p>
      </div>

      {savedStories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg
            className="w-12 h-12 text-rule mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <p className="text-gray-500 font-sans text-base max-w-sm">
            Your shelf is empty. Save stories from the digest to read later.
          </p>
        </div>
      ) : (
        <>
          <ShelfFilters stories={savedStories} onFilter={setFiltered} />

          {filtered.length === 0 ? (
            <p className="text-gray-500 font-sans text-sm mt-8">
              No stories match your current filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
              {filtered.map((story) => (
                <StoryCard key={story.id} story={story} date={story.date} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
