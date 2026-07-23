import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'SQLD 30일 코치', description: '출퇴근 20분, SQLD 합격 루틴', manifest: '/manifest.webmanifest', appleWebApp: { capable: true, title: 'SQLD 코치' } };
export const viewport: Viewport = { themeColor: '#fff9f1', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="ko"><body>{children}</body></html>; }
