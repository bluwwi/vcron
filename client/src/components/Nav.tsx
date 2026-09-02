import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-black font-bold text-sm group-hover:scale-110 transition-transform">
            v
          </span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-accent">v</span>cron
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-4 text-sm">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/jobs/new"
            className="px-3 py-1.5 rounded-md text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          >
            New Job
          </Link>
          <Link
            href="/settings"
            className="px-3 py-1.5 rounded-md text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          >
            Settings
          </Link>
        </div>
      </nav>
    </header>
  );
}
