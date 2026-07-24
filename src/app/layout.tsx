import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "SQLD 30일 스퍼트",
  description: "SQLD 합격을 위한 30일 개인 학습 앱",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SQLD 30",
  },
};

export const viewport: Viewport = {
  themeColor: "#2f6a53",
  width: "device-width",
  initialScale: 1,
  // 확대(zoom)를 허용해 접근성(WCAG 1.4.4)을 보장 — 텍스트·SQL 표가 많은 앱.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <StoreProvider>
          <div className="mx-auto flex min-h-screen max-w-app flex-col">
            <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
          </div>
          <BottomNav />
          <ServiceWorkerRegister />
        </StoreProvider>
      </body>
    </html>
  );
}
