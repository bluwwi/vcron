"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { App, JobWithApp } from "@/lib/types";
import { JobForm } from "@/components/JobForm";

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [job, setJob] = useState<JobWithApp | null>(null);
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    api.getJob(id)
      .then((j) => {
        setJob(j);
        return api.getApp(j.app_id);
      })
      .then(setApp)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-text-dim animate-pulse">Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!job || !app) return <div className="text-text-dim">Job not found</div>;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-text-dim text-sm mt-0.5">{job.name}</p>
      </div>
      <JobForm app={app} job={job} mode="edit" />
    </div>
  );
}
