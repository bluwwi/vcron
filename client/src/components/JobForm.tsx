"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { App, CreateJobInput, Job, UpdateJobInput } from "@/lib/types";
import { api } from "@/lib/api";
import { cronToHuman } from "@/lib/utils";

interface JobFormProps {
  app: App;
  job?: Job;
  mode: "create" | "edit";
}

const SCHEDULE_PRESETS = [
  { label: "Every 30 seconds", value: "interval:30" },
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

export function JobForm({ app, job, mode }: JobFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(job?.name ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [path, setPath] = useState(job?.path ?? "/");
  const [method, setMethod] = useState(job?.method ?? "GET");
  const [schedulePreset, setSchedulePreset] = useState(
    job ? (SCHEDULE_PRESETS.some((p) => p.value === job.cron_expression) ? job.cron_expression : "custom") : "interval:30",
  );
  const [cronExpression, setCronExpression] = useState(job?.cron_expression ?? "interval:30");
  const [headers, setHeaders] = useState(job ? JSON.stringify(job.headers, null, 2) : "{}");
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
    if (!path.trim() || !path.startsWith("/")) {
      setError("Path must start with /");
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
          app_id: app.id,
          name: name.trim(),
          description: description.trim() || undefined,
          cron_expression: cronExpression.trim(),
          path: path.trim(),
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
          path: path.trim(),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="rounded-lg px-4 py-2.5 text-sm text-danger"
          style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)" }}>
          {error}
        </div>
      )}

      {/* App context */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">App</label>
        <div className="rounded-lg px-3 py-2.5 text-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
          <span className="font-medium">{app.name}</span>
          <span className="text-text-dim font-mono ml-2">{app.base_url}</span>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Name</label>
        <input
          className="w-full rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dimmer focus:outline-none transition-colors"
          style={{ background: "rgba(255,255,255,0.03)" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="health-check"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Description</label>
        <input
          className="w-full rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dimmer focus:outline-none transition-colors"
          style={{ background: "rgba(255,255,255,0.03)" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this job do?"
        />
      </div>

      {/* Method + Enabled */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Method</label>
          <select
            className="w-full rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none transition-colors"
            style={{ background: "rgba(255,255,255,0.03)" }}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Enabled</label>
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className="w-full rounded-lg px-3 py-2.5 text-sm flex items-center justify-between focus:outline-none"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span>{enabled ? "Yes" : "No"}</span>
            <span
              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              style={{ background: enabled ? "var(--color-accent)" : "#3a3a3e" }}
            >
              <span
                className="inline-block h-3.5 w-3.5 transform rounded-full bg-black transition-transform"
                style={{ transform: enabled ? "translateX(22px)" : "translateX(4px)" }}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Path */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Path</label>
        <input
          className="w-full rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dimmer focus:outline-none transition-colors font-mono"
          style={{ background: "rgba(255,255,255,0.03)" }}
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="/healthz"
          required
        />
        <p className="mt-1.5 text-xs text-text-dim">
          Full URL: <span className="font-mono text-accent">{app.base_url}{path || "/path"}</span>
        </p>
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Schedule</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none transition-colors"
            style={{ background: "rgba(255,255,255,0.03)" }}
            value={schedulePreset}
            onChange={(e) => onPresetChange(e.target.value)}
          >
            {SCHEDULE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input
            className="rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none transition-colors font-mono"
            style={{
              background: "rgba(255,255,255,0.03)",
              opacity: schedulePreset !== "custom" ? 0.5 : 1,
            }}
            value={cronExpression}
            onChange={(e) => { setCronExpression(e.target.value); setSchedulePreset("custom"); }}
            disabled={schedulePreset !== "custom"}
          />
        </div>
        <p className="mt-1.5 text-xs text-text-dim">
          {cronToHuman(cronExpression)} &middot; cron or interval:N format
        </p>
      </div>

      {/* Advanced */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-text-dim hover:text-text select-none">
          Advanced options
        </summary>
        <div className="mt-4 space-y-5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Headers (JSON)</label>
            <textarea
              className="w-full rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dimmer focus:outline-none transition-colors font-mono h-24 resize-y"
              style={{ background: "rgba(255,255,255,0.03)" }}
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Authorization": "Bearer xxx"}'
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Request Body</label>
            <textarea
              className="w-full rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-dimmer focus:outline-none transition-colors font-mono h-24 resize-y"
              style={{ background: "rgba(255,255,255,0.03)" }}
              value={body ?? ""}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Timeout (seconds)</label>
              <input
                type="number"
                min={1}
                max={300}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none transition-colors"
                style={{ background: "rgba(255,255,255,0.03)" }}
                value={timeoutSeconds}
                onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">Retry Count</label>
              <input
                type="number"
                min={0}
                max={10}
                className="w-full rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none transition-colors"
                style={{ background: "rgba(255,255,255,0.03)" }}
                value={retryCount}
                onChange={(e) => setRetryCount(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </details>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="accent-btn px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Job" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="ghost-btn px-5 py-2.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
