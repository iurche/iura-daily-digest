"use client";

type ToastProps = {
  visible: boolean;
  hiding: boolean;
  msg: string;
};

export default function Toast({ visible, hiding, msg }: ToastProps) {
  if (!visible && !hiding) return null;

  return (
    <div
      className="fixed bottom-8 right-8 z-[9999] bg-[var(--surface-2)] border border-[var(--border-med)] rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-lg animate-fade-up"
      style={{
        animation: hiding ? "toastOut 250ms ease forwards" : "toastIn 300ms ease forwards",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 24px rgba(0,0,0,.3)",
      }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: "var(--brand)" }}
      />
      <span className="text-sm font-medium text-[var(--text-strong)]">{msg}</span>
    </div>
  );
}