"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Toast from "@/components/Toast";
import { TOPIC_LABELS } from "@/lib/topics";

type Story = {
  id: string;
  topic: string;
  headline: string;
  dek: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
};

export default function ShelfPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState({ visible: false, hiding: false, msg: "" });
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/stories");
        const data = await res.json();
        setStories(data.stories || []);
      } catch (e) {
        console.error("Failed to load stories", e);
      } finally {
        setLoading(false);
      }
    };

    try {
      const raw = localStorage.getItem("dd-saved");
      if (raw) setSaved(new Set(JSON.parse(raw)));
    } catch {}

    loadData();
  }, []);

  const savedStories = useMemo(
    () => stories.filter((s) => saved.has(s.id)),
    [stories, saved]
  );

  const topics = useMemo(
    () => [...new Set(savedStories.map((s) => s.topic))],
    [savedStories]
  );

  const filtered =
    filter === "all" ? savedStories : savedStories.filter((s) => s.topic === filter);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, hiding: false, msg });
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, hiding: true }));
      setTimeout(() => setToast({ visible: false, hiding: false, msg: "" }), 300);
    }, 2200);
  };

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast("Removed from shelf");
      } else {
        next.add(id);
        showToast("Saved to shelf");
      }
      localStorage.setItem("dd-saved", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const exportMd = () => {
    const md = savedStories
      .map(
        (s) =>
          `## ${s.headline}\n\n${s.dek}\n\n**Source:** ${s.source}\n\n[Read →](${s.sourceUrl})\n\n---`
      )
      .join("\n\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    a.download = "shelf.md";
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] pt-20 px-5 md:px-[5vw] lg:px-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-[var(--surface-2)] rounded" />
          <div className="h-4 w-48 bg-[var(--surface-2)] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20">
      <div className="px-5 md:px-[5vw] lg:px-20 py-12 border-b border-[var(--border)]">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors mb-6"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
          Back to digest
        </Link>

        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-[var(--text-strong)]"
              style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800 }}
            >
              Your shelf
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1.5">
              {savedStories.length} saved {savedStories.length === 1 ? "story" : "stories"}
            </p>
          </div>

          {savedStories.length > 0 && (
            <button
              onClick={exportMd}
              className="flex items-center gap-1.5 border border-[var(--border)] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--text-med)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition-all"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export as Markdown
            </button>
          )}
        </div>

        {topics.length > 1 && (
          <div className="flex gap-2 mt-6 flex-wrap">
            {["all", ...topics].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer"
                style={{
                  background: filter === t ? "var(--brand)" : "transparent",
                  borderColor: filter === t ? "var(--brand)" : "var(--border)",
                  color: filter === t ? "#fff" : "var(--text-muted)",
                }}
              >
                {t === "all" ? "All" : TOPIC_LABELS[t]}
              </button>
            ))}
          </div>
        )}
      </div>

      {savedStories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-16 h-16 rounded-xl bg-[var(--surface)] flex items-center justify-center mb-5">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--text-strong)] mb-2">
            Nothing saved yet
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-[340px] mb-6">
            Save stories from the digest to build your personal reading list.
          </p>
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            Browse today&apos;s digest
          </Link>
        </div>
      ) : (
        <div className="px-5 md:px-[5vw] lg:px-20 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((story, i) => (
            <article
              key={story.id}
              className="fade-up bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden transition-all duration-200 hover:border-[var(--border-med)] hover:shadow-elevated flex flex-col"
              style={{
                animationDelay: `${i * 40}ms`,
                boxShadow: "var(--card-shadow)",
              }}
            >
              <Link
                href={story.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative aspect-video overflow-hidden flex-shrink-0"
              >
                {story.imageUrl && (
                  <img
                    src={story.imageUrl}
                    alt={story.headline}
                    className="w-full h-full object-cover transition-transform duration-400 hover:scale-105"
                  />
                )}
              </Link>

              <div className="p-4 flex-1 flex flex-col gap-2">
                <Link href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <h3 className="font-semibold leading-snug text-[var(--text-strong)] line-clamp-3 transition-colors duration-150 hover:text-[var(--brand)]">
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
                  <button
                    onClick={() => toggle(story.id)}
                    className="flex items-center gap-1.5 transition-colors"
                    style={{ color: saved.has(story.id) ? "var(--brand)" : "var(--text-muted)" }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={saved.has(story.id) ? "var(--brand)" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Toast visible={toast.visible} hiding={toast.hiding} msg={toast.msg} />
    </div>
  );
}