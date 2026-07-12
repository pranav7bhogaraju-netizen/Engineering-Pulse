import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1A2B",
        "ink-raised": "#122238",
        paper: "#EDEAE0",
        "paper-dim": "#B9B6AC",
        copper: "#C77B3B",
        "copper-bright": "#E0975A",
        pcb: "#4C8066",
        grid: "rgba(237,234,224,0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgba(237,234,224,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(237,234,224,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        blueprint: "32px 32px",
      },
    },
  },
  plugins: [],
};
export default config;
