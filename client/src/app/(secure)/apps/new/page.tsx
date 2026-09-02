"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CreateAppInput } from "@/lib/types";

export default function NewAppPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      setSaving(false);
      return;
    }
    if (!baseUrl.trim() || (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://"))) {
      setError("Base URL must start with http:// or https://");
      setSaving(false);
      return;
    }

    try {
      const input: CreateAppInput = {
        name: name.trim(),
        base_url: baseUrl.trim().replace(/\/$/, ""),
        description: description.trim() || undefined,
      };
      const app = await api.createApp(input);
      router.push(`/apps/${app.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create app");
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors";
  const labelClass = "block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New App</h1>
        <p className="text-text-dim text-sm mt-0.5">Register an API to schedule jobs against</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="blu3 API" required />
        </div>
        <div>
          <label className={labelClass}>Base URL</label>
          <input className={`${inputClass} font-mono`} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.blu3.in" required />
          <p className="mt-1 text-xs text-text-dim">Jobs will be executed against this URL + their path (e.g. base_url + /healthz)</p>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this API for?" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black hover:bg-accent-dim transition-colors disabled:opacity-50">
            {saving ? "Creating..." : "Create App"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-border bg-surface px-5 py-2 text-sm text-text-dim hover:text-text hover:bg-surface-hover transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
