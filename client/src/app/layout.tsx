import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "vcron",
  description: "Cron job scheduler — HTTP trigger server",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <Nav />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-border py-4 text-center text-xs text-text-dim">
          vcron &middot; cron job server
        </footer>
      </body>
    </html>
  );
}
