"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { App, Job } from "@/lib/types";
import { cronToHuman, timeAgo, timeUntil } from "@/lib/utils";
import { useTick } from "@/lib/useTick";

export default function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useTick();
  const router = useRouter();
  const [id, setId] = useState("");
  const [app, setApp] = useState<App | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [a, j] = await Promise.all([api.getApp(id), api.listAppJobs(id)]);
      setApp(a);
      setJobs(j);
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

  async function handleDeleteApp() {
    if (!app) return;
    if (!confirm(`Delete app "${app.name}" and all its jobs?`)) return;
    setDeleting(true);
    try {
      await api.deleteApp(app.id);
      router.push("/");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : e);
      setDeleting(false);
    }
  }

  async function toggleJob(job: Job) {
    try {
      await api.updateJob(job.id, { enabled: !job.enabled });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : e);
    }
  }

  async function deleteJob(job: Job) {
    if (!confirm(`Delete job "${job.name}"?`)) return;
    try {
      await api.deleteJob(job.id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : e);
    }
  }

  if (loading) return <div className="text-text-dim animate-pulse">Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!app) return <div className="text-text-dim">App not found</div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">{app.name}</h1>
          </div>
          <p className="text-text-dim text-sm font-mono">{app.base_url}</p>
          {app.description && <p className="text-text-dim text-sm mt-1">{app.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDeleteApp}
            disabled={deleting}
            className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete App"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Jobs ({jobs.length})</h2>
        <Link
          href={`/apps/${app.id}/jobs/new`}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
        >
          + New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <p className="text-text-dim mb-3">No jobs in this app yet</p>
          <Link href={`/apps/${app.id}/jobs/new`} className="text-accent hover:underline text-sm">
            Create a job →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div key={job.id} className="group rounded-xl border border-border bg-surface p-4 hover:border-border-hover hover:bg-surface-hover transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/jobs/${job.id}`} className="font-semibold hover:text-accent transition-colors">
                      {job.name}
                    </Link>
                    {job.enabled ? (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">Active</span>
                    ) : (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">Paused</span>
                    )}
                    {job.last_run_status === "success" && (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">✓</span>
                    )}
                    {job.last_run_status === "failed" && (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">✗</span>
                    )}
                  </div>
                  <p className="text-sm text-text-dim font-mono truncate">
                    <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 mr-1">{job.method}</span>
                    {app.base_url}<span className="text-accent">{job.path}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-dim">
                    <span>{cronToHuman(job.cron_expression)}</span>
                    <span>Last: {timeAgo(job.last_run_at)}</span>
                    <span>Next: {timeUntil(job.next_run_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleJob(job)} className="rounded-md px-2.5 py-1 text-xs text-text-dim hover:text-text hover:bg-zinc-800 transition-colors">
                    {job.enabled ? "Pause" : "Resume"}
                  </button>
                  <button onClick={() => deleteJob(job)} className="rounded-md px-2.5 py-1 text-xs text-text-dim hover:text-danger hover:bg-danger/10 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
