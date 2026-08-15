import type { Config } from "tailwindcss";

const rgb = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: rgb("primary"),
        "primary-hover": rgb("primary-hover"),
        "primary-strong": rgb("primary-strong"),
        "primary-soft": rgb("primary-soft"),
        "primary-softer": rgb("primary-softer"),
        bg: rgb("bg"),
        surface: rgb("surface"),
        line: rgb("line"),
        "line-strong": rgb("line-strong"),
        ink: rgb("ink"),
        "ink-soft": rgb("ink-soft"),
        "ink-muted": rgb("ink-muted"),
        success: rgb("success"),
        warning: rgb("warning"),
        danger: rgb("danger"),
        chart: {
          forest: rgb("chart-forest"),
          pine: rgb("chart-pine"),
          teal: rgb("chart-teal"),
          emerald: rgb("chart-emerald"),
          gold: rgb("chart-gold"),
          rose: rgb("chart-rose"),
          slate: rgb("chart-slate"),
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
      borderRadius: {
        "2xl": "1rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
