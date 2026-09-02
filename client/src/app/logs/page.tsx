"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { RunWithJobAndApp } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const STATUS_FILTERS = ["", "success", "failed", "timeout"] as const;

export default function LogsPage() {
  const [runs, setRuns] = useState<RunWithJobAndApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("");

  const load = useCallback(async () => {
    try {
      const r = await api.listAllRuns(1, 100, filter);
      setRuns(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs</h1>
          <p className="text-text-dim text-sm mt-0.5">Recent job executions across all apps</p>
        </div>
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true); }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f ? "bg-accent text-black" : "text-text-dim hover:text-text hover:bg-surface-hover"
              }`}
            >
              {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && runs.length === 0 ? (
        <div className="text-text-dim animate-pulse">Loading...</div>
      ) : error ? (
        <div className="text-danger text-sm">{error}</div>
      ) : runs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="text-text-dim text-sm">No runs found.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {runs.map((run) => {
            const isSuccess = run.status === "success";
            const isRunning = run.status === "running";
            const statusColor = isSuccess ? "text-success" : isRunning ? "text-warning" : "text-danger";
            const dotColor = isSuccess ? "bg-success" : isRunning ? "bg-warning animate-pulse" : "bg-danger";

            return (
              <div key={run.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 hover:bg-surface-hover transition-colors">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/apps/${run.job_id}`} className="text-xs text-text-dim hover:text-accent">
                      {run.app_name}
                    </Link>
                    <span className="text-text-dim">/</span>
                    <Link href={`/jobs/${run.job_id}`} className="text-sm font-medium hover:text-accent transition-colors">
                      {run.job_name}
                    </Link>
                    <span className={`text-xs font-medium ${statusColor}`}>{run.status}</span>
                    {run.status_code !== null && <span className="text-xs font-mono text-text-dim">HTTP {run.status_code}</span>}
                    {run.request_method && <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-xs font-mono text-text-dim">{run.request_method}</span>}
                  </div>
                  <p className="text-xs text-text-dim font-mono truncate mt-1">{run.request_url}</p>
                  {run.error_message && <p className="text-xs text-danger mt-1 truncate">{run.error_message}</p>}
                  {run.response_body && isSuccess && (
                    <p className="text-xs text-text-dim mt-1 truncate font-mono max-w-2xl">→ {run.response_body.slice(0, 200)}</p>
                  )}
                </div>
                <div className="text-right text-xs text-text-dim shrink-0">
                  <p>{timeAgo(run.started_at)}</p>
                  {run.duration_ms !== null && <p className="font-mono">{run.duration_ms}ms</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
