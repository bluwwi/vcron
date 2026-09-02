"use client";

import { useState, useEffect } from "react";
import { getApiKey, setApiKey } from "@/lib/api";

export default function SettingsPage() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    setKey(getApiKey());
  }, []);

  function save() {
    setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult("");
    setApiKey(key.trim());
    try {
      const res = await fetch("/api/health-proxy");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "healthy") {
        setTestResult("✓ Connected — backend is healthy");
      } else {
        setTestResult(`⚠ Connected but degraded: ${data.status}`);
      }
    } catch (e) {
      setTestResult(`✗ Failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setTesting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors font-mono";

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-text-dim text-sm mt-0.5">Configure API connection</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">
            API Key
          </label>
          <input
            className={inputClass}
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="your-api-key"
          />
          <p className="mt-1.5 text-xs text-text-dim">
            Stored locally in your browser. Set the <code className="text-accent">API_KEY</code> env var on your backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
          >
            {saved ? "Saved ✓" : "Save Key"}
          </button>
          <button
            onClick={testConnection}
            disabled={testing || !key.trim()}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-dim hover:text-text hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
        </div>

        {testResult && (
          <div className="rounded-lg border border-border bg-bg px-4 py-2.5 text-sm">
            {testResult}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-medium mb-2">Backend URL</h3>
        <p className="text-xs text-text-dim">
          The frontend proxies API calls through Next.js rewrites. Set the{" "}
          <code className="text-accent">BACKEND_URL</code> environment variable on Vercel
          to point to your backend (e.g. <code className="text-accent">https://your-vps:8080</code>).
          For local development, it defaults to <code className="text-accent">http://localhost:8080</code>.
        </p>
      </div>
    </div>
  );
}
