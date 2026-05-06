"use client";

import { useState, useEffect, useRef } from "react";
import { useChats } from "@/lib/chats-store";
import ChatMessage from "./ChatMessage";
import { ChatMessage as ChatMessageType, Story } from "@/lib/types";

interface ChatPanelProps {
  articleId: string;
  story?: Story;
}

const STARTER_PROMPTS = [
  "Summarize this in 3 bullets",
  "How does this connect to my work on Tuza?",
  "What should I take away as a senior designer?",
];

export default function ChatPanel({ articleId, story }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [width, setWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  
  const { addMessage, hydrate, getThread } = useChats();
  const thread = getThread(articleId);
  const messages = thread?.messages || [];

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (isResizing) {
      const onMouseMove = (e: MouseEvent) => {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 320 && newWidth < window.innerWidth * 0.9) {
          setWidth(newWidth);
        }
      };
      const onMouseUp = () => {
        setIsResizing(false);
        document.body.style.cursor = 'default';
      };
      document.body.style.cursor = 'ew-resize';
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = 'default';
      };
    }
  }, [isResizing]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: Omit<ChatMessageType, 'ts'> = { role: "user", content };
    addMessage(articleId, userMsg);
    setInput("");
    setIsLoading(true);
    setError(null);
    setStreamingContent("");

    try {
      const chatHistory = [...messages, userMsg];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, messages: chatHistory }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        accumulated += text;
        setStreamingContent(accumulated);
      }

      addMessage(articleId, { role: "assistant", content: accumulated });
      setStreamingContent("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--brand)] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-40 group"
        aria-label="Open chat"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="group-hover:rotate-12 transition-transform"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M12 7l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {/* Slide-in Panel */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Panel Content */}
        <div
          style={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : `${width}px` }}
          className={`pointer-events-auto absolute right-0 bottom-0 md:top-0 bg-[var(--surface)] shadow-2xl flex flex-col transition-transform duration-300 transform ${
            isOpen ? "translate-x-0 translate-y-0" : "md:translate-x-full translate-y-full md:translate-y-0"
          } h-[85vh] md:h-full rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none border-l border-t md:border-t-0 border-[var(--border)]`}
        >
          {/* Resize Handle (Desktop Only) */}
          <div
            onMouseDown={() => setIsResizing(true)}
            className="hidden md:block absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-[var(--brand)] hover:opacity-50 transition-colors z-50"
          />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h3 className="font-bold text-[var(--text-strong)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--brand)]"></span>
              Ask about this article
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-[var(--surface-2)] rounded-full transition-colors text-[var(--text-muted)]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth"
          >
            {messages.length === 0 && !streamingContent && (
              <div className="flex flex-col gap-4 mt-4">
                <p className="text-sm text-[var(--text-muted)] text-center mb-2">
                  Iura, how can I help you analyze this?
                </p>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left px-4 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--text-med)] hover:bg-[var(--surface-2)] hover:border-[var(--brand)] transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessage 
                key={i} 
                message={m} 
                story={story || undefined}
                previousUserMessage={i > 0 ? messages.slice(0, i).reverse().find(msg => msg.role === 'user')?.content : undefined}
              />
            ))}

            {streamingContent && (
              <ChatMessage
                message={{ role: "assistant", content: streamingContent, ts: Date.now() }}
                story={story || undefined}
              />
            )}

            {isLoading && !streamingContent && (
              <div className="flex justify-start mb-4">
                <div className="bg-[var(--surface-2)] rounded-2xl rounded-tl-none px-4 py-3 border border-[var(--border)] flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-bounce"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center mb-4">
                {error}
                <button
                  onClick={() => sendMessage(messages[messages.length - 1]?.content || "")}
                  className="ml-2 underline font-bold"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="relative flex items-end gap-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl focus-within:border-[var(--brand)] transition-colors p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-2 resize-none max-h-32 text-[var(--text-strong)]"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-xl transition-all ${
                  input.trim() && !isLoading
                    ? "bg-[var(--brand)] text-white shadow-lg"
                    : "text-[var(--text-muted)] bg-transparent"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center uppercase tracking-widest font-bold opacity-50">
              Powered by Gemini Flash
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
