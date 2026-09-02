"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => setLoggedIn(r.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
        {/* Glow background */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <Image
            src="/full-logo.svg"
            alt="vcron"
            width={280}
            height={58}
            className="mx-auto mb-8"
          />

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Cron jobs for{" "}
            <span className="text-accent">HTTP endpoints</span>
          </h1>

          <p className="mt-4 text-lg text-text-dim max-w-xl mx-auto">
            Register your APIs, create scheduled jobs, and let vcron hit your
            endpoints on time — every time. No infrastructure needed.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            {loggedIn === null ? (
              <div className="h-11 w-32 animate-pulse rounded-lg bg-surface" />
            ) : loggedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-border bg-surface px-6 py-2.5 text-sm text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
                >
                  Live Demo
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
            title="Flexible Scheduling"
            desc="Cron expressions or simple intervals. Every 30 seconds to daily at midnight."
          />
          <FeatureCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>}
            title="Multi-App Support"
            desc="Register multiple APIs as apps. Each with its own base URL and job paths."
          />
          <FeatureCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
            title="Built-in Retries"
            desc="Automatic exponential backoff retries. Configurable timeout and retry count per job."
          />
          <FeatureCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>}
            title="Run History"
            desc="Full execution logs with status codes, response bodies, durations and error messages."
          />
          <FeatureCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
            title="Secure Auth"
            desc="Username + password with bcrypt and JWT. Your data is scoped to your account."
          />
          <FeatureCard
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.7 5.7a4.5 4.5 0 0 1 3.6-1.8h3.4a4.5 4.5 0 0 1 3.6 1.8l1.5 1.85a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 0-3 3" /></svg>}
            title="Lightweight"
            desc="Rust backend with SQLite. Runs on 1GB VPS with minimal resource usage."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">How it works</h2>
        <p className="text-text-dim text-sm mb-12">Three steps to automated cron jobs</p>

        <div className="space-y-8">
          <Step
            num="01"
            title="Register your API"
            desc="Create an app with a base URL — e.g. https://api.blu3.in"
          />
          <Step
            num="02"
            title="Add jobs"
            desc="Define paths like /healthz, pick a schedule, set method and headers"
          />
          <Step
            num="03"
            title="Relax"
            desc="vcron hits your endpoints on schedule and logs every result"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-border bg-surface p-12">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Ready to automate?</h2>
          <p className="text-text-dim text-sm mb-6">
            Create an account and start scheduling jobs in under a minute.
          </p>
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <Link
              href="/auth"
              className="inline-flex rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
            >
              Get Started — It's Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 hover:border-border-hover transition-colors">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-glow text-accent">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-text-dim leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 text-left">
      <span className="shrink-0 text-2xl font-bold text-accent-dim tabular-nums">{num}</span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-text-dim mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
