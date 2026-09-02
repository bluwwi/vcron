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

            <div className="flex items-center gap-2 border-l border-border ">

              <span className="text-text-dim text-sm hidden sm:block">{username}</span>
              <button
                onClick={handleLogout}
                className="text-text-dim hover:text-danger transition-colors text-sm font-medium px-2 py-1 rounded-lg"
                title="Logout"
              >
                Logout
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
