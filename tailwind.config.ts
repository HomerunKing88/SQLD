import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 기본: 세이지·파인 계열 (낮은 채도의 세련된 녹색, 눈이 편안)
        brand: {
          50: "#eef4f0",
          100: "#d7e7de",
          200: "#b0cdbf",
          300: "#82ac99",
          400: "#57917a",
          500: "#3a7a60",
          600: "#2f6a53", // DEFAULT (Primary)
          700: "#275643",
          800: "#1f4536",
          DEFAULT: "#2f6a53",
          dark: "#275643",
        },
        // 포인트: 뮤트 허니골드 (형광 노랑 대체, 절제된 강조)
        accent: {
          50: "#faf6ec",
          100: "#f2e9d3",
          200: "#e6d3a4",
          300: "#d6bb77",
          400: "#c9a24e", // DEFAULT
          500: "#b2893a",
          ink: "#6b4e18", // 골드 배경 위 텍스트
          DEFAULT: "#c9a24e",
        },
        // 페이지 바탕 (차분한 웜 뉴트럴 그린 톤)
        canvas: "#f2f5f1",
      },
      maxWidth: {
        app: "480px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(31, 69, 54, 0.05), 0 1px 3px rgba(31, 69, 54, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
