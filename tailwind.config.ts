import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        base: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        strong: "var(--text-strong)",
        med: "var(--text-med)",
        muted: "var(--text-muted)",
        border: "var(--border)",
        "border-med": "var(--border-med)",
        brand: "var(--brand)",
        "brand-dim": "var(--brand-dim)",
        "brand-text": "var(--brand-text)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,.4), 0 4px 12px rgba(0,0,0,.3)",
        elevated: "0 8px 24px rgba(0,0,0,.25)",
      },
      keyframes: {
        bookmarkPop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.45) rotate(-8deg)" },
          "70%": { transform: "scale(.92)" },
          "100%": { transform: "scale(1)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        toastIn: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        toastOut: {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(8px)" },
        },
      },
      animation: {
        bookmarkPop: "bookmarkPop 400ms ease",
        fadeUp: "fadeUp 500ms ease forwards",
        toastIn: "toastIn 300ms ease forwards",
        toastOut: "toastOut 250ms ease forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;