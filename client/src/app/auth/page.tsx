"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect to dashboard if already logged in
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => { if (r.ok) router.push("/"); })
      .catch(() => {});
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      setSaving(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setSaving(false);
      return;
    }

    try {
      await api.auth(mode, { username: username.trim(), password });
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-dim focus:border-accent focus:outline-none transition-colors";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 animate-fadeIn">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-black font-bold text-2xl">
            v
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-accent">v</span>cron
          </h1>
          <p className="text-text-dim text-sm mt-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">
              Username
            </label>
            <input
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-text-dim mb-1.5">
              Password
            </label>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors disabled:opacity-50"
          >
            {saving ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="text-center text-sm text-text-dim">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className="text-accent hover:underline font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="text-accent hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
