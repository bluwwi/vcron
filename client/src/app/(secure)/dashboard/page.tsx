"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { App, AppStats, DashboardStats } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { PixelLoader } from "@/components/PixelLoader";
import { timeAgo } from "@/lib/utils";
import { useTick } from "@/lib/useTick";
import { useInitialLoader } from "@/lib/useInitialLoader";

const Icons = {
  apps: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  jobs: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.083 0-.166.018-.242.051M8.25 8.25H4.875A2.25 2.25 0 0 0 2.625 10.5v7.5a2.25 2.25 0 0 0 2.25 2.25h12a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25H8.25Z" /></svg>,
  active: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  due: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  fail: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  runs: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
};

export default function Dashboard() {
  useTick();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [appStats, setAppStats] = useState<AppStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { show: showLoader, complete: completeLoader } = useInitialLoader();

  const load = useCallback(async () => {
    try {
      const [s, a, as] = await Promise.all([api.stats(), api.listApps(), api.appStats()]);
      setStats(s);
      setApps(a);
      setAppStats(as);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.includes("not authenticated") || msg.includes("401")) {
        window.location.href = "/auth";
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (error) return (
    <div>
      {showLoader && <PixelLoader onComplete={completeLoader} />}
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-dim">
          <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
        </div>
        <p className="text-danger font-medium">Connection failed</p>
        <p className="text-text-dim text-sm max-w-md text-center">{error}</p>
        <button onClick={load} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-hover transition-colors">Retry</button>
      </div>
    </div>
  );

  return (
    <>
      {showLoader && <PixelLoader onComplete={completeLoader} />}
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-text-dim text-sm mt-1">Monitor and manage your scheduled jobs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Apps" value={stats?.total_apps ?? 0} icon={Icons.apps} />
          <StatCard label="Total Jobs" value={stats?.total_jobs ?? 0} icon={Icons.jobs} />
          <StatCard label="Active" value={stats?.enabled_jobs ?? 0} accent="success" icon={Icons.active} />
          <StatCard label="Due Now" value={stats?.due_jobs ?? 0} accent="warning" icon={Icons.due} />
          <StatCard label="Failures (1h)" value={stats?.recent_failures ?? 0} accent={stats && stats.recent_failures > 0 ? "danger" : "default"} icon={Icons.fail} />
          <StatCard label="Runs Today" value={stats?.runs_today ?? 0} accent="info" icon={Icons.runs} />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Apps</h2>
        </div>

        {apps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
              <svg className="h-7 w-7 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
            </div>
            <p className="text-text mb-1 font-medium">No apps yet</p>
            <p className="text-text-dim text-sm mb-4">Create an app to start scheduling jobs against its endpoints</p>
            <Link href="/apps/new" className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dim transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Create App
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => {
              const stat = appStats.find((s) => s.app_id === app.id);
              return (
                <Link
                  key={app.id}
                  href={`/apps/${app.id}`}
                  className="group rounded-2xl border border-border bg-surface p-5 hover:border-border-hover hover:bg-surface-hover transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-glow text-accent font-bold text-lg">
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold group-hover:text-accent transition-colors truncate">{app.name}</h3>
                      <p className="text-xs text-text-dim font-mono truncate mt-0.5">{app.base_url}</p>
                    </div>
                  </div>
                  {app.description && (
                    <p className="text-sm text-text-dim mb-3 line-clamp-1">{app.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-dim pt-3 border-t border-border">
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08" /></svg>
                      {stat?.job_count ?? 0} jobs
                    </span>
                    {stat && stat.enabled_count > 0 && (
                      <span className="flex items-center gap-1 text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        {stat.enabled_count} active
                      </span>
                    )}
                    {stat?.last_run && <span className="ml-auto">{timeAgo(stat.last_run)}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
