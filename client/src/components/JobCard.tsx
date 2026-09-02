"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Job } from "@/lib/types";
import { api } from "@/lib/api";
import { cronToHuman, timeAgo, timeUntil } from "@/lib/utils";

interface JobCardProps {
  job: Job;
}

function StatusBadge({ job }: { job: Job }) {
  if (!job.enabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
        Paused
      </span>
    );
  }
  const status = job.last_run_status;
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
        Idle
      </span>
    );
  }
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        Success
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">
      <span className="h-1.5 w-1.5 rounded-full bg-danger" />
      {status}
    </span>
  );
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function toggle() {
    setToggling(true);
    try {
      await api.updateJob(job.id, { enabled: !job.enabled });
      router.refresh();
    } catch (e) {
      alert(`Failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setToggling(false);
    }
  }

  async function del() {
    if (!confirm(`Delete job "${job.name}"? This also deletes its run history.`)) return;
    setDeleting(true);
    try {
      await api.deleteJob(job.id);
      router.refresh();
    } catch (e) {
      alert(`Failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="group rounded-xl border border-border bg-surface p-4 hover:border-border-hover transition-all hover:bg-surface-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/jobs/${job.id}`}
              className="font-semibold text-text hover:text-accent transition-colors truncate"
            >
              {job.name}
            </Link>
            <StatusBadge job={job} />
          </div>
          <p className="text-sm text-text-dim truncate font-mono">{job.url}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-dim">
            <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 font-mono">
              {job.method}
            </span>
            <span>{cronToHuman(job.cron_expression)}</span>
            <span>Last: {timeAgo(job.last_run_at)}</span>
            <span>Next: {timeUntil(job.next_run_at)}</span>
            {job.retry_count > 0 && <span>Retries: {job.retry_count}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggle}
            disabled={toggling}
            className="rounded-md px-2.5 py-1 text-xs text-text-dim hover:text-text hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title={job.enabled ? "Pause job" : "Resume job"}
          >
            {toggling ? "..." : job.enabled ? "Pause" : "Resume"}
          </button>
          <button
            onClick={del}
            disabled={deleting}
            className="rounded-md px-2.5 py-1 text-xs text-text-dim hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
            title="Delete job"
          >
            {deleting ? "..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
