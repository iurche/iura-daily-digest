import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "@/lib/types";

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isAssistant
            ? "bg-[var(--surface-2)] text-[var(--text-med)] border border-[var(--border)] rounded-tl-none"
            : "bg-[var(--brand)] text-white rounded-tr-none font-medium"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              code: ({ children }) => (
                <code className="bg-[var(--surface-3)] px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-[var(--surface-3)] p-2 rounded-lg overflow-x-auto my-2 text-xs font-mono">
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse border border-[var(--border)] text-xs">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-[var(--surface-3)]">{children}</thead>,
              th: ({ children }) => <th className="border border-[var(--border)] px-2 py-1 font-bold">{children}</th>,
              td: ({ children }) => <td className="border border-[var(--border)] px-2 py-1">{children}</td>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}
