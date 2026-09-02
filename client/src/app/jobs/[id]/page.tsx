"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { JobRun, JobWithApp } from "@/lib/types";
import { cronToHuman, formatDate, timeAgo, timeUntil } from "@/lib/utils";
import { useTick } from "@/lib/useTick";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useTick();
  const router = useRouter();
  const [id, setId] = useState("");
  const [job, setJob] = useState<JobWithApp | null>(null);
  const [runs, setRuns] = useState<JobRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [j, r] = await Promise.all([api.getJob(id), api.listRuns(id, 1, 50)]);
      setJob(j);
      setRuns(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    if (!id) return;
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load, id]);

  async function handleDelete() {
    if (!job) return;
    if (!confirm(`Delete "${job.name}"?`)) return;
    setDeleting(true);
    try {
      await api.deleteJob(job.id);
      router.push(`/apps/${job.app_id}`);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : e);
      setDeleting(false);
    }
  }

  if (loading) return <div className="text-text-dim animate-pulse">Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!job) return <div className="text-text-dim">Job not found</div>;

  const fullUrl = `${job.app_base_url}${job.path}`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/apps/${job.app_id}`} className="text-text-dim hover:text-accent text-sm">{job.app_name}</Link>
            <span className="text-text-dim">/</span>
            <h1 className="text-2xl font-bold tracking-tight">{job.name}</h1>
            {job.enabled ? (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">Active</span>
            ) : (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">Paused</span>
            )}
          </div>
          {job.description && <p className="text-text-dim text-sm">{job.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/jobs/${job.id}/edit`} className="rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-hover transition-colors">Edit</Link>
          <button onClick={handleDelete} disabled={deleting} className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger hover:bg-danger/20 transition-colors disabled:opacity-50">
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-text-dim mb-1">Target URL</p>
          <p className="font-mono text-sm break-all">{fullUrl}</p>
          <p className="text-xs text-text-dim mt-1">
            <Link href={`/apps/${job.app_id}`} className="hover:text-accent">{job.app_name}</Link>
            <span className="mx-1">·</span>
            <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 font-mono">{job.method}</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-text-dim mb-1">Schedule</p>
          <p className="text-sm">{cronToHuman(job.cron_expression)}</p>
          <p className="font-mono text-xs text-text-dim mt-0.5">{job.cron_expression}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-text-dim mb-1">Next Run</p>
          <p className="text-sm">{timeUntil(job.next_run_at)}</p>
          <p className="text-xs text-text-dim mt-0.5">{formatDate(job.next_run_at)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-text-dim mb-1">Last Run</p>
          <p className="text-sm">{timeAgo(job.last_run_at)}</p>
          {job.last_run_status && (
            <p className={`text-xs mt-0.5 ${job.last_run_status === "success" ? "text-success" : "text-danger"}`}>{job.last_run_status}</p>
          )}
        </div>
      </div>

      {job.body && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-wider text-text-dim mb-2">Request Body</p>
          <pre className="font-mono text-sm whitespace-pre-wrap break-all text-text-dim">{job.body}</pre>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Run History</h2>
        {runs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <p className="text-text-dim text-sm">No runs yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => {
              const statusColor = run.status === "success" ? "text-success" : run.status === "running" ? "text-warning" : "text-danger";
              const dotColor = run.status === "success" ? "bg-success" : run.status === "running" ? "bg-warning animate-pulse" : "bg-danger";
              return (
                <div key={run.id} className="flex items-center gap-4 rounded-lg border border-border bg-surface p-3 hover:bg-surface-hover transition-colors">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${statusColor}`}>{run.status}</span>
                      {run.status_code !== null && <span className="text-xs font-mono text-text-dim">HTTP {run.status_code}</span>}
                    </div>
                    {run.error_message && <p className="text-xs text-danger truncate mt-0.5">{run.error_message}</p>}
                  </div>
                  <div className="text-right text-xs text-text-dim shrink-0">
                    <p>{formatDate(run.started_at)}</p>
                    {run.duration_ms !== null && <p>{run.duration_ms}ms</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
