"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Apps" },
  { href: "/logs", label: "Logs" },
];

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setUsername(data.username);
      } else {
        setUsername(null);
      }
    } catch {
      setUsername(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-check auth on mount AND on every route change
  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setUsername(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.svg"
            alt="vcron"
            width={32}
            height={32}
            className="group-hover:scale-105 transition-transform duration-200"
          />
        </Link>
        {username && (
          <div className="flex items-center gap-1 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-text-dim hover:text-text hover:bg-surface-hover transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/apps/new"
              className="ml-2 flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New App
            </Link>
            <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-text-dim">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-text-dim text-xs hidden sm:block">{username}</span>
              <button
                onClick={handleLogout}
                className="text-text-dim hover:text-danger transition-colors p-1"
                title="Logout"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {!loading && !username && (
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
            >
              Sign In
            </Link>
            <a
              href="https://github.com/bluwwi/vcron"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-dim hover:text-text transition-colors p-1"
              title="GitHub"
            >
              <Image src="/github.svg" alt="GitHub" width={20} height={20} className="opacity-100" />
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
