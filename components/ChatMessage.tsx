import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType, Story } from "@/lib/types";
import { useShelf } from "@/lib/store";
import { useState } from "react";

export default function ChatMessage({ message, story }: { message: ChatMessageType, story?: Story }) {
  const isAssistant = message.role === "assistant";
  const { toggle, isSavedUrl } = useShelf();
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {
    if (!story) return;
    
    const insightStory = {
      id: `ai-${Date.now()}`,
      topic: "ai-insight",
      headline: `AI Insight: ${story.headline}`,
      dek: message.content,
      source: "Daily AI",
      sourceUrl: `${story.sourceUrl}#insight-${message.ts || Date.now()}`,
      imageUrl: story.imageUrl
    };
    
    toggle(insightStory);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const isSaved = story ? isSavedUrl(`${story.sourceUrl}#insight-${message.ts || Date.now()}`) : false;

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"} mb-6 group`}>
      <div
        className={`relative max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isAssistant
            ? "bg-[var(--surface-2)] text-[var(--text-med)] border border-[var(--border)] rounded-tl-none"
            : "bg-[var(--brand)] text-white rounded-tr-none font-medium"
        }`}
      >
        {isAssistant ? (
          <>
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc ml-4 mb-3">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal ml-4 mb-3">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-[var(--surface-3)] px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-[var(--surface-3)] p-3 rounded-xl overflow-x-auto my-3 text-xs font-mono border border-[var(--border)]">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 border border-[var(--border)] rounded-xl">
                    <table className="min-w-full border-collapse text-xs">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-[var(--surface-3)]">{children}</thead>,
                th: ({ children }) => <th className="border-b border-[var(--border)] px-3 py-2 font-bold text-left">{children}</th>,
                td: ({ children }) => <td className="border-b border-[var(--border)] px-3 py-2">{children}</td>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {story && (
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isSaved || justSaved
                    ? "bg-[var(--brand)] text-white"
                    : "bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  {isSaved || justSaved ? (
                    <path d="M20 6L9 17l-5-5" />
                  ) : (
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8" />
                  )}
                </svg>
                {justSaved ? "Saved to Shelf" : isSaved ? "Saved" : "Save Insight"}
              </button>
            </div>
          )}
        </>
      ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}
