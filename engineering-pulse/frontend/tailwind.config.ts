import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x) / <alpha-value>) — Tailwind's pattern for letting
        // CSS variables still support opacity modifiers like bg-ink/60,
        // which this codebase uses extensively.
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-raised": "rgb(var(--color-ink-raised) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        "paper-dim": "rgb(var(--color-paper-dim) / <alpha-value>)",
        copper: "rgb(var(--color-copper) / <alpha-value>)",
        "copper-bright": "rgb(var(--color-copper-bright) / <alpha-value>)",
        pcb: "rgb(var(--color-pcb) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgb(var(--color-gridline) / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-gridline) / 0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        blueprint: "32px 32px",
      },
    },
  },
  plugins: [],
};
export default config;
