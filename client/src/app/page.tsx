"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { App, AppStats, DashboardStats } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { timeAgo } from "@/lib/utils";
import { useTick } from "@/lib/useTick";

export default function Dashboard() {
  useTick();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [apps, setApps] = useState<App[]>([]);
  const [appStats, setAppStats] = useState<AppStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, a, as] = await Promise.all([api.stats(), api.listApps(), api.appStats()]);
      setStats(s);
      setApps(a);
      setAppStats(as);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <div className="text-text-dim animate-pulse">Loading...</div>;
  if (error) return <div className="text-danger text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-text-dim text-sm mt-0.5">Your apps and scheduled jobs</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Apps" value={stats?.total_apps ?? 0} />
        <StatCard label="Total Jobs" value={stats?.total_jobs ?? 0} />
        <StatCard label="Enabled" value={stats?.enabled_jobs ?? 0} accent="success" />
        <StatCard label="Due Now" value={stats?.due_jobs ?? 0} accent="warning" />
        <StatCard label="Failures (1h)" value={stats?.recent_failures ?? 0} accent={stats && stats.recent_failures > 0 ? "danger" : "default"} />
        <StatCard label="Runs Today" value={stats?.runs_today ?? 0} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Apps</h2>
        <Link
          href="/apps/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
        >
          + New App
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="text-text-dim mb-3">No apps yet</p>
          <Link href="/apps/new" className="text-accent hover:underline text-sm">
            Create your first app →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {apps.map((app) => {
            const stat = appStats.find((s) => s.app_id === app.id);
            return (
              <Link
                key={app.id}
                href={`/apps/${app.id}`}
                className="group rounded-xl border border-border bg-surface p-4 hover:border-border-hover hover:bg-surface-hover transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold group-hover:text-accent transition-colors">{app.name}</h3>
                    <p className="text-sm text-text-dim font-mono truncate">{app.base_url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-dim mt-3">
                  <span>{stat?.job_count ?? 0} jobs</span>
                  <span>{stat?.enabled_count ?? 0} active</span>
                  {stat?.last_run && <span>Last: {timeAgo(stat.last_run)}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
