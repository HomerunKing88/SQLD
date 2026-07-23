import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 기본: 녹색 계열 (Primary)
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          DEFAULT: "#16a34a",
          dark: "#15803d",
        },
        // 포인트: 노란색 계열 (Accent)
        accent: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          ink: "#854d0e", // 노란 배경 위 텍스트
          DEFAULT: "#facc15",
        },
        // 페이지 바탕 (아주 옅은 녹색 톤)
        canvas: "#f4f7f3",
      },
      maxWidth: {
        app: "480px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
