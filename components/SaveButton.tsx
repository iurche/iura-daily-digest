"use client";

import { useState, useCallback, useEffect } from "react";
import { useShelf, type Story } from "@/lib/store";

type SaveButtonProps = {
  story: Story;
  size?: "sm" | "lg";
};

export default function SaveButton({ story, size = "sm" }: SaveButtonProps) {
  const toggle = useShelf((state) => state.toggle);
  const savedStories = useShelf((state) => state.saved);
  
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [particles, setParticles] = useState<{ id: number; dx: number; dy: number }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const saved = mounted ? savedStories.some(s => s.sourceUrl === story.sourceUrl) : false;
  const iconSize = size === "lg" ? 22 : 18;

  const handleClick = useCallback(() => {
    if (!saved) {
      setAnimating(true);
      const pts = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        dx: Math.cos((i / 8) * Math.PI * 2) * 28,
        dy: Math.sin((i / 8) * Math.PI * 2) * 28,
      }));
      setParticles(pts);
      setTimeout(() => {
        setAnimating(false);
        setParticles([]);
      }, 600);
    }
    toggle(story);
  }, [saved, story, toggle]);

  const color = saved ? "var(--brand)" : "var(--text-muted)";

  return (
    <div className="relative inline-flex items-center">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particleOut pointer-events-none z-10"
          style={{
            left: "50%",
            top: "50%",
            width: 5,
            height: 5,
            background: "var(--brand)",
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
          } as React.CSSProperties}
        />
      ))}
      <button
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? "Remove from shelf" : "Save to shelf"}
        className="flex items-center gap-1.5 transition-all duration-200 focus-ring rounded-md"
        style={{
          color,
          animation: animating ? "bookmarkPop 400ms ease" : "none",
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill={saved ? "var(--brand)" : "none"}
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        {size === "lg" && (
          <span className="text-xs font-semibold uppercase tracking-wider">
            {saved ? "Saved" : "Save"}
          </span>
        )}
      </button>
    </div>
  );
}