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
  toggle: (story: Story) => void;
  remove: (id: string) => void;
  isSaved: (id: string) => boolean;
  hydrate: () => void;
}

const STORAGE_KEY = 'dd-shelf';

export const useShelf = create<ShelfStore>((set, get) => ({
  saved: [],
  toggle: (story) => {
    const exists = get().saved.find((s) => s.id === story.id);
    let next: Story[];
    if (exists) {
      next = get().saved.filter((s) => s.id !== story.id);
    } else {
      next = [...get().saved, story];
    }
    set({ saved: next });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
  remove: (id) => {
    const next = get().saved.filter((s) => s.id !== id);
    set({ saved: next });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
  isSaved: (id) => get().saved.some((s) => s.id === id),
  hydrate: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) set({ saved: JSON.parse(raw) });
    } catch {}
  },
}));