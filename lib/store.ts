'use client';
import { create } from 'zustand';

interface ShelfStore {
  saved: Set<string>;
  toggle: (id: string) => void;
  isSaved: (id: string) => boolean;
  hydrate: () => void;
}

const STORAGE_KEY = 'iura-shelf';

export const useShelf = create<ShelfStore>((set, get) => ({
  saved: new Set(),
  toggle: (id) => {
    const next = new Set(get().saved);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ saved: next });
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  },
  isSaved: (id) => get().saved.has(id),
  hydrate: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) set({ saved: new Set(JSON.parse(raw)) });
    } catch {}
  },
}));
