"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, getApiKey } from "@/lib/api";
import type { DashboardStats, Job } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { JobCard } from "@/components/JobCard";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasKey, setHasKey] = useState(true);

  const load = useCallback(async () => {
    if (!getApiKey()) {
      setHasKey(false);
      setLoading(false);
      return;
    }
    setHasKey(true);
    setLoading(true);
    setError("");
    try {
      const [s, j] = await Promise.all([api.stats(), api.listJobs(1, 50)]);
      setStats(s);
      setJobs(j.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="rounded-full border border-warning/30 bg-warning/10 p-4">
          <svg className="h-8 w-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75M5.25 10.5h13.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-6a1.5 1.5 0 0 1 1.5-1.5Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">API Key Required</h2>
        <p className="text-text-dim max-w-sm">
          Set your revoCron API key to manage jobs. You can get it from your backend's
          <code className="mx-1 px-1 py-0.5 rounded bg-surface text-accent text-sm">API_KEY</code>
          environment variable.
        </p>
        <Link
          href="/settings"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
        >
          Set API Key →
        </Link>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-text-dim">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
        <p className="text-danger font-medium">Failed to connect</p>
        <p className="text-text-dim text-sm max-w-md">{error}</p>
        <button
          onClick={load}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-text-dim text-sm mt-0.5">Monitor and manage your scheduled jobs</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Jobs" value={stats?.total_jobs ?? 0} />
        <StatCard label="Enabled" value={stats?.enabled_jobs ?? 0} accent="success" />
        <StatCard label="Due Now" value={stats?.due_jobs ?? 0} accent="warning" />
        <StatCard label="Failures (1h)" value={stats?.recent_failures ?? 0} accent={stats && stats.recent_failures > 0 ? "danger" : "default"} />
        <StatCard label="Runs Today" value={stats?.runs_today ?? 0} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Jobs</h2>
        <Link
          href="/jobs/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
        >
          + New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="text-text-dim mb-3">No jobs yet</p>
          <Link
            href="/jobs/new"
            className="text-accent hover:underline text-sm"
          >
            Create your first job →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
