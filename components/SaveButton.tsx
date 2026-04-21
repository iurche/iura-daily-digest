"use client";

import { useEffect, useState } from "react";
import { useShelf } from "@/lib/store";

type SaveButtonProps = {
  storyId: string;
};

export default function SaveButton({ storyId }: SaveButtonProps) {
  const { toggle, isSaved, hydrate } = useShelf();
  const [hydrated, setHydrated] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  const saved = hydrated ? isSaved(storyId) : false;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    toggle(storyId);
    setTimeout(() => setAnimating(false), 200);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from shelf" : "Save to shelf"}
      aria-pressed={saved}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-1 ${
        animating ? "scale-125" : "scale-100"
      } ${
        saved
          ? "text-red hover:text-red/70"
          : "text-muted hover:text-ink"
      }`}
      style={{ transition: "transform 0.15s ease, color 0.15s ease" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.75}
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
