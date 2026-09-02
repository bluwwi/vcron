"use client";

import { useEffect, useState } from "react";
import { api, getApiKey } from "@/lib/api";
import type { Job } from "@/lib/types";
import { JobForm } from "@/components/JobForm";
import Link from "next/link";

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasKey, setHasKey] = useState(true);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    if (!getApiKey()) {
      setHasKey(false);
      setLoading(false);
      return;
    }
    api.getJob(id)
      .then(setJob)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (!hasKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center">
        <h2 className="text-xl font-semibold">API Key Required</h2>
        <Link href="/settings" className="text-accent hover:underline">Set API Key →</Link>
      </div>
    );
  }

  if (loading) return <div className="text-text-dim animate-pulse">Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!job) return <div className="text-text-dim">Job not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-text-dim text-sm mt-0.5">{job.name}</p>
      </div>
      <JobForm job={job} mode="edit" />
    </div>
  );
}
