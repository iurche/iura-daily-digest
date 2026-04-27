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
  isSavedUrl: (url: string) => boolean;
  hydrate: () => void;
}

const STORAGE_KEY = 'dd-shelf';

/** Read saved stories from localStorage synchronously (SSR-safe). */
function readLocal(): Story[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Story[]) : [];
  } catch {
    return [];
  }
}

/** Write to localStorage AND sync to Gist (fire-and-forget). */
function persist(stories: Story[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  } catch {}
  fetch('/api/shelf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stories),
  }).catch(() => {});
}

/** Merge local + remote: union by id, remote wins on conflict. */
function merge(local: Story[], remote: Story[]): Story[] {
  const map = new Map<string, Story>();
  for (const s of local) map.set(s.id, s);
  for (const s of remote) map.set(s.id, s);
  return [...map.values()];
}

export const useShelf = create<ShelfStore>((set, get) => ({
  // ← Pre-populated from localStorage on first import — no flash, no delay
  saved: readLocal(),
  syncing: false,

  toggle: (story) => {
    const exists = get().saved.find((s) => s.sourceUrl === story.sourceUrl);
    const next = exists
      ? get().saved.filter((s) => s.sourceUrl !== story.sourceUrl)
      : [...get().saved, story];
    set({ saved: next });
    persist(next);
  },

  remove: (id) => {
    // Keep remove by id for internal removals, but could also be URL
    const next = get().saved.filter((s) => s.id !== id);
    set({ saved: next });
    persist(next);
  },

  isSaved: (id) => get().saved.some((s) => s.id === id),
  isSavedUrl: (url) => get().saved.some((s) => s.sourceUrl === url),

  hydrate: () => {
    // Sync from localStorage again (in case it changed in another tab)
    const local = readLocal();
    set({ saved: local });

    // Then fetch from Gist and merge any saves from other devices
    set({ syncing: true });
    fetch('/api/shelf')
      .then((r) => r.json())
      .then((remote: Story[]) => {
        if (!Array.isArray(remote) || remote.length === 0) return;
        const merged = merge(get().saved, remote);
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