import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        accent: {
          DEFAULT: "#06B6D4",
          50: "#ECFEFF",
          100: "#CFFAFE",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#666666",
          subtle: "#94A3B8",
        },
        line: "#E2E8F0",
        surface: "#F8FAFC",
        success: "#10B981",
        warn: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Funnel Sans",
          "Geist",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
        card: "0 8px 24px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
