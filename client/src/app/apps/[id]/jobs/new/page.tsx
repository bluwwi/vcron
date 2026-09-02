"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { App } from "@/lib/types";
import { JobForm } from "@/components/JobForm";
import Link from "next/link";

export default function NewJobPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    api.getApp(id).then(setApp).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-text-dim animate-pulse">Loading...</div>;
  if (!app) return <div className="text-text-dim">App not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Job</h1>
        <p className="text-text-dim text-sm mt-0.5">
          <Link href={`/apps/${app.id}`} className="hover:text-accent">{app.name}</Link>
          {" / "}
          <span className="font-mono">{app.base_url}</span>
        </p>
      </div>
      <JobForm app={app} mode="create" />
    </div>
  );
}
