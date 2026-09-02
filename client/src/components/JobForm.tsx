"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CreateJobInput, Job, UpdateJobInput } from "@/lib/types";
import { api } from "@/lib/api";
import { cronToHuman } from "@/lib/utils";

interface JobFormProps {
  job?: Job;
  mode: "create" | "edit";
}

const SCHEDULE_PRESETS = [
  { label: "Every minute", value: "*/1 * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 10 minutes", value: "*/10 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every 30 minutes", value: "*/30 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Weekdays at 9am", value: "0 9 * * 1-5" },
  { label: "Custom", value: "custom" },
];

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

export function JobForm({ job, mode }: JobFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(job?.name ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [url, setUrl] = useState(job?.url ?? "");
  const [method, setMethod] = useState(job?.method ?? "GET");
  const [schedulePreset, setSchedulePreset] = useState(
    job ? (SCHEDULE_PRESETS.some(p => p.value === job.cron_expression) ? job.cron_expression : "custom") : "*/1 * * * *",
  );
  const [cronExpression, setCronExpression] = useState(job?.cron_expression ?? "*/1 * * * *");
  const [headers, setHeaders] = useState(
    job ? JSON.stringify(job.headers, null, 2) : "{}",
  );
  const [body, setBody] = useState(job?.body ?? "");
  const [timeoutSeconds, setTimeoutSeconds] = useState(job?.timeout_seconds ?? 30);
  const [retryCount, setRetryCount] = useState(job?.retry_count ?? 0);
  const [enabled, setEnabled] = useState(job?.enabled ?? true);

  function onPresetChange(value: string) {
    setSchedulePreset(value);
    if (value !== "custom") {
      setCronExpression(value);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      setSaving(false);
      return;
    }
    if (!url.trim() || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      setError("URL must start with http:// or https://");
      setSaving(false);
      return;
    }

    let parsedHeaders: Record<string, unknown> = {};
    try {
      parsedHeaders = JSON.parse(headers || "{}");
    } catch {
      setError("Headers must be valid JSON");
      setSaving(false);
      return;
    }

    try {
      if (mode === "create") {
        const input: CreateJobInput = {
          name: name.trim(),
          description: description.trim() || undefined,
          cron_expression: cronExpression.trim(),
          url: url.trim(),
          method,
          headers: parsedHeaders,
          body: body.trim() || undefined,
          timeout_seconds: timeoutSeconds,
          retry_count: retryCount,
          enabled,
        };
        const created = await api.createJob(input);
        router.push(`/jobs/${created.id}`);
        router.refresh();
      } else if (job) {
        const input: UpdateJobInput = {
          name: name.trim(),
          description: description.trim(),
          cron_expression: cronExpression.trim(),
          url: url.trim(),
          method,
          headers: parsedHeaders,
          body: body.trim() || undefined,
          timeout_seconds: timeoutSeconds,
          retry_count: retryCount,
          enabled,
        };
        await api.updateJob(job.id, input);
        router.push(`/jobs/${job.id}`);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save job");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors";
  const labelClass = "block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Name</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="health-check"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <input
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this job do?"
        />
      </div>

      <div>
        <label className={labelClass}>Target URL</label>
        <input
          className={`${inputClass} font-mono`}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/health"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Method</label>
          <select
            className={inputClass}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Enabled</label>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`${inputClass} text-left flex items-center justify-between`}
          >
            <span>{enabled ? "Yes" : "No"}</span>
            <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? "bg-accent" : "bg-zinc-700"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`} />
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>Schedule</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            className={inputClass}
            value={schedulePreset}
            onChange={(e) => onPresetChange(e.target.value)}
          >
            {SCHEDULE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input
            className={`${inputClass} font-mono ${schedulePreset !== "custom" ? "opacity-60" : ""}`}
            value={cronExpression}
            onChange={(e) => {
              setCronExpression(e.target.value);
              setSchedulePreset("custom");
            }}
            disabled={schedulePreset !== "custom"}
          />
        </div>
        <p className="mt-1 text-xs text-text-dim">
          {cronToHuman(cronExpression)} &middot; 5-field cron (min hour dom mon dow) — minimum is 1 minute
        </p>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm text-text-dim hover:text-text select-none">
          Advanced options
        </summary>
        <div className="mt-4 space-y-5">
          <div>
            <label className={labelClass}>Headers (JSON)</label>
            <textarea
              className={`${inputClass} font-mono h-24 resize-y`}
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Authorization": "Bearer xxx"}'
            />
          </div>

          <div>
            <label className={labelClass}>Request Body</label>
            <textarea
              className={`${inputClass} font-mono h-24 resize-y`}
              value={body ?? ""}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Timeout (seconds)</label>
              <input
                type="number"
                min={1}
                max={300}
                className={inputClass}
                value={timeoutSeconds}
                onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>Retry Count</label>
              <input
                type="number"
                min={0}
                max={10}
                className={inputClass}
                value={retryCount}
                onChange={(e) => setRetryCount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </details>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black hover:bg-accent-dim transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Job" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border bg-surface px-5 py-2 text-sm text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
