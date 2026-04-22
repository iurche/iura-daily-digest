"use client";

import { useMemo } from "react";

export function useStories() {
  const stories = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("dd-stories");
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  }, []);

  return stories;
}