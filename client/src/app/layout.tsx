import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "revoCron",
  description: "Cron job scheduler — HTTP trigger server",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <Nav />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-border py-4 text-center text-xs text-text-dim">
          revoCron &middot; cron job server
        </footer>
      </body>
    </html>
  );
}
