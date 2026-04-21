"use client";

import { useState, useCallback } from "react";
import type { Story } from "@/lib/types";
import { TOPIC_LABELS } from "@/lib/topic-labels";

type ShelfFiltersProps = {
  stories: (Story & { date: string })[];
  onFilter: (filtered: (Story & { date: string })[]) => void;
};

type ExportFormat = "json" | "markdown";

function exportAs(stories: (Story & { date: string })[], format: ExportFormat) {
  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === "json") {
    content = JSON.stringify(stories, null, 2);
    filename = `shelf-export-${new Date().toISOString().slice(0, 10)}.json`;
    mimeType = "application/json";
  } else {
    const lines = stories.map(
      (s) =>
        `## ${s.headline}\n\n**${s.source}** — ${s.date}\n\n${s.dek}\n\n[Read more](${s.sourceUrl})\n`
    );
    content = `# My Reading Shelf\n\nExported ${new Date().toLocaleDateString()}\n\n---\n\n${lines.join("\n---\n\n")}`;
    filename = `shelf-export-${new Date().toISOString().slice(0, 10)}.md`;
    mimeType = "text/markdown";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ShelfFilters({ stories, onFilter }: ShelfFiltersProps) {
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set()
  );
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const allTopics = Array.from(new Set(stories.map((s) => s.topic))).sort();
  const allSources = Array.from(new Set(stories.map((s) => s.source))).sort();

  const applyFilters = useCallback(
    (
      date: string,
      topics: Set<string>,
      sources: Set<string>
    ) => {
      let filtered = [...stories];
      if (date) filtered = filtered.filter((s) => s.date === date);
      if (topics.size > 0)
        filtered = filtered.filter((s) => topics.has(s.topic));
      if (sources.size > 0)
        filtered = filtered.filter((s) => sources.has(s.source));
      onFilter(filtered);
    },
    [stories, onFilter]
  );

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setDateFilter(val);
    applyFilters(val, selectedTopics, selectedSources);
  }

  function toggleTopic(topic: string) {
    const next = new Set(selectedTopics);
    if (next.has(topic)) next.delete(topic);
    else next.add(topic);
    setSelectedTopics(next);
    applyFilters(dateFilter, next, selectedSources);
  }

  function toggleSource(source: string) {
    const next = new Set(selectedSources);
    if (next.has(source)) next.delete(source);
    else next.add(source);
    setSelectedSources(next);
    applyFilters(dateFilter, selectedTopics, next);
  }

  function clearAll() {
    setDateFilter("");
    setSelectedTopics(new Set());
    setSelectedSources(new Set());
    onFilter(stories);
  }

  const hasFilters =
    dateFilter || selectedTopics.size > 0 || selectedSources.size > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      {/* Date filter */}
      <div className="flex items-center gap-1 border border-gray-200 rounded px-3 py-1.5">
        <label
          htmlFor="shelf-date"
          className="font-sans text-xs text-gray-500"
          style={{ letterSpacing: "0.05em" }}
        >
          Day
        </label>
        <input
          id="shelf-date"
          type="date"
          value={dateFilter}
          onChange={handleDateChange}
          className="font-sans text-xs text-gray-900 bg-transparent focus:outline-none cursor-pointer"
        />
      </div>

      {/* Topic filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowTopicDropdown((v) => !v);
            setShowSourceDropdown(false);
            setShowExportDropdown(false);
          }}
          className={`flex items-center gap-1.5 border rounded px-3 py-1.5 font-sans text-xs transition-colors ${
            selectedTopics.size > 0
              ? "border-ink text-gray-900"
              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
          }`}
        >
          Topic
          {selectedTopics.size > 0 && (
            <span className="bg-red text-cream rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
              {selectedTopics.size}
            </span>
          )}
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
        {showTopicDropdown && (
          <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg min-w-44 py-1">
            {allTopics.map((topic) => (
              <label
                key={topic}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer font-sans text-xs text-gray-900"
              >
                <input
                  type="checkbox"
                  checked={selectedTopics.has(topic)}
                  onChange={() => toggleTopic(topic)}
                  className="accent-red"
                />
                {TOPIC_LABELS[topic] ?? topic}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Source filter */}
      <div className="relative">
        <button
          onClick={() => {
            setShowSourceDropdown((v) => !v);
            setShowTopicDropdown(false);
            setShowExportDropdown(false);
          }}
          className={`flex items-center gap-1.5 border rounded px-3 py-1.5 font-sans text-xs transition-colors ${
            selectedSources.size > 0
              ? "border-ink text-gray-900"
              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900"
          }`}
        >
          Source
          {selectedSources.size > 0 && (
            <span className="bg-red text-cream rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
              {selectedSources.size}
            </span>
          )}
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
        {showSourceDropdown && (
          <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg min-w-48 py-1 max-h-64 overflow-y-auto">
            {allSources.map((source) => (
              <label
                key={source}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer font-sans text-xs text-gray-900"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.has(source)}
                  onChange={() => toggleSource(source)}
                  className="accent-red"
                />
                {source}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="font-sans text-xs text-gray-500 hover:text-gray-900 transition-colors px-2 py-1.5"
        >
          Clear all
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Export button */}
      <div className="relative">
        <button
          onClick={() => {
            setShowExportDropdown((v) => !v);
            setShowTopicDropdown(false);
            setShowSourceDropdown(false);
          }}
          className="flex items-center gap-1.5 border border-gray-200 rounded px-3 py-1.5 font-sans text-xs text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors"
        >
          Export
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
        {showExportDropdown && (
          <div className="absolute z-20 top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg min-w-40 py-1">
            <button
              onClick={() => {
                exportAs(stories, "json");
                setShowExportDropdown(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 font-sans text-xs text-gray-900"
            >
              Export as JSON
            </button>
            <button
              onClick={() => {
                exportAs(stories, "markdown");
                setShowExportDropdown(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 font-sans text-xs text-gray-900"
            >
              Export as Markdown
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
