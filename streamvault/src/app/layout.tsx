import type { Metadata } from "next";
import "./globals.css";
import AnnouncementBanner from "@/components/ui/AnnouncementBanner";

export const metadata: Metadata = {
  title: "StreamVault",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e50914" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="StreamVault" />
      </head>
      <body className="antialiased">
        <AnnouncementBanner />
        {children}
      </body>
    </html>
  );
}