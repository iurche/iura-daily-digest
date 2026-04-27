'use client';
import { create } from 'zustand';

export type Story = {
  id: string;
  topic: string;
  headline: string;
  dek: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
};

interface ShelfStore {
  saved: Story[];
  syncing: boolean;
  toggle: (story: Story) => void;
  remove: (id: string) => void;
  isSaved: (id: string) => boolean;
  hydrate: () => void;
}

const STORAGE_KEY = 'dd-shelf';

/** Write to localStorage AND sync to Gist (fire-and-forget) */
function persist(stories: Story[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  } catch {}
  // Sync to Gist in background — failures are silent (localStorage is source of truth)
  fetch('/api/shelf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stories),
  }).catch(() => {});
}

/** Merge local + remote: union by id, remote wins on conflict */
function merge(local: Story[], remote: Story[]): Story[] {
  const map = new Map<string, Story>();
  for (const s of local) map.set(s.id, s);
  for (const s of remote) map.set(s.id, s); // remote overwrites local on same id
  return [...map.values()];
}

export const useShelf = create<ShelfStore>((set, get) => ({
  saved: [],
  syncing: false,

  toggle: (story) => {
    const exists = get().saved.find((s) => s.id === story.id);
    const next = exists
      ? get().saved.filter((s) => s.id !== story.id)
      : [...get().saved, story];
    set({ saved: next });
    persist(next);
  },

  remove: (id) => {
    const next = get().saved.filter((s) => s.id !== id);
    set({ saved: next });
    persist(next);
  },

  isSaved: (id) => get().saved.some((s) => s.id === id),

  hydrate: () => {
    // 1. Load from localStorage immediately (instant, no flash)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) set({ saved: JSON.parse(raw) });
    } catch {}

    // 2. Fetch from Gist in background and merge (picks up saves from other devices)
    set({ syncing: true });
    fetch('/api/shelf')
      .then((r) => r.json())
      .then((remote: Story[]) => {
        if (!Array.isArray(remote) || remote.length === 0) return;
        const merged = merge(get().saved, remote);
        // Only update if remote added something new
        if (merged.length !== get().saved.length) {
          set({ saved: merged });
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => set({ syncing: false }));
  },
}));