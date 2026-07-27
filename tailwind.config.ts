import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          white: "#FAF6ED",
          panel: "#F3EBDD",
          line: "#E2D5C0",
        },
        gold: {
          shadow: "#8A6A2E",
          DEFAULT: "#C7A24B",
          bright: "#E6C978",
        },
        cream: {
          DEFAULT: "#F6EEDD",
        },
        ink: {
          DEFAULT: "#1C160E",
          muted: "#6B5D45",
        },
        // Operate-mode semantic states — muted, ledger-ink tones that sit on warm
        // paper. DEFAULT is AA-legible text on warm-white; `soft` is a chip tint.
        success: { DEFAULT: "#3E6B44", soft: "#E6EEE3" },
        warning: { DEFAULT: "#8A5A0E", soft: "#F2E6C9" },
        danger: { DEFAULT: "#9E3B34", soft: "#F1E0DC" },
        info: { DEFAULT: "#3E5C7A", soft: "#E1E7ED" },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 3.2vw + 2rem, 5.75rem)", { lineHeight: "1.02", letterSpacing: "-0.01em" }],
        "display-lg": ["clamp(2.1rem, 2vw + 1.6rem, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(1.6rem, 1.2vw + 1.3rem, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.005em" }],
        particulars: ["0.72rem", { lineHeight: "1.6", letterSpacing: "0.28em" }],
        nav: ["0.68rem", { lineHeight: "1.6", letterSpacing: "0.28em" }],
        meta: ["0.65rem", { lineHeight: "1.6", letterSpacing: "0.28em" }],
        // Operate-mode fixed-rem UI scale (dashboard chrome + data), ~1.2 ratio.
        // Distinct from the landing's fluid clamp display sizes.
        "ui-title": ["1.5rem", { lineHeight: "1.15", letterSpacing: "-0.005em" }],
        "ui-lg": ["1.125rem", { lineHeight: "1.4" }],
        ui: ["0.9375rem", { lineHeight: "1.5" }],
        "ui-sm": ["0.8125rem", { lineHeight: "1.45" }],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      boxShadow: {
        emboss: "0 1px 0 0 rgba(230,201,120,0.3), 0 12px 28px -10px rgba(138,106,46,0.35)",
        "card-lift": "0 20px 48px -20px rgba(28,22,14,0.18)",
        seal: "0 8px 24px -6px rgba(28,22,14,0.25), 0 0 0 1px rgba(199,162,75,0.4)",
      },
      keyframes: {
        // Admin overlays: a state change, not a performance (150–250ms).
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        stamp: {
          "0%": { opacity: "0", transform: "scale(1.22) rotate(-3deg)" },
          "60%": { opacity: "1", transform: "scale(0.97) rotate(0.6deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
      },
      animation: {
        stamp: "stamp 1.1s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      maxWidth: {
        measure: "70ch",
      },
    },
  },
  plugins: [],
} satisfies Config;
