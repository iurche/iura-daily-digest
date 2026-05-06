'use client';
import { create } from 'zustand';
import { ChatThread, ChatMessage } from './types';

interface ChatStore {
  chats: Record<string, ChatThread>;
  syncing: boolean;
  addMessage: (articleId: string, message: Omit<ChatMessage, 'ts'>) => void;
  getThread: (articleId: string) => ChatThread | undefined;
  hydrate: () => void;
}

const STORAGE_KEY = 'dd-chats';

function readLocal(): Record<string, ChatThread> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let debounceTimer: NodeJS.Timeout | null = null;
function persist(chats: Record<string, ChatThread>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {}

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetch('/api/chats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chats),
    }).catch(() => {});
  }, 2000);
}

function merge(local: Record<string, ChatThread>, remote: Record<string, ChatThread>): Record<string, ChatThread> {
  const merged = { ...local };
  for (const [id, thread] of Object.entries(remote)) {
    if (!merged[id] || new Date(thread.updatedAt) > new Date(merged[id].updatedAt)) {
      merged[id] = thread;
    }
  }
  return merged;
}

export const useChats = create<ChatStore>((set, get) => ({
  chats: readLocal(),
  syncing: false,

  addMessage: (articleId, message) => {
    const ts = Date.now();
    const newMessage = { ...message, ts };
    const currentThread = get().chats[articleId] || { messages: [], updatedAt: new Date(0).toISOString() };
    
    const nextThread = {
      messages: [...currentThread.messages, newMessage],
      updatedAt: new Date().toISOString(),
    };

    const nextChats = {
      ...get().chats,
      [articleId]: nextThread,
    };

    set({ chats: nextChats });
    persist(nextChats);
  },

  getThread: (articleId) => get().chats[articleId],

  hydrate: () => {
    const local = readLocal();
    set({ chats: local });

    set({ syncing: true });
    fetch('/api/chats')
      .then((r) => r.json())
      .then((remote: Record<string, ChatThread>) => {
        if (!remote || typeof remote !== 'object') return;
        const merged = merge(get().chats, remote);
        set({ chats: merged });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      })
      .catch(() => {})
      .finally(() => set({ syncing: false }));
  },
}));
