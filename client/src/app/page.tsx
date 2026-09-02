"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRevealer } from "@/hooks/useRevealer";

export default function LandingPage() {
  useRevealer();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => setLoggedIn(r.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  return (
    <div className="relative w-full overflow-x-hidden">
      <div className="noise" />
      <div className="global-grid" />

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden"
        style={{ paddingTop: "135px" }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 70% 30%, rgba(202,255,97,0.06), transparent 60%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(120,144,255,0.03), transparent 60%)",
          }}
        />

        <div
          className="relative z-20 mx-auto w-full max-w-7xl"
          style={{ padding: "0 clamp(1.5rem, 5vw, 5rem)" }}
        >
          {/* Section label */}
          <div className="reveal mb-8">
            <p className="section-label">HTTP cron scheduler — Rust + SQLite — 2026</p>
          </div>

          {/* Massive title */}
          <h1
            className="font-bold"
            style={{
              fontSize: "clamp(3rem, 14vw, 12rem)",
              lineHeight: "0.82",
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
            }}
          >
            <span className="title-mask block">
              <span className="line block">Schedule.</span>
            </span>
            <span className="title-mask block">
              <span className="line block">
                <span
                  style={{
                    WebkitTextStroke: "clamp(0.005rem, 0.15vw, 0.08rem) var(--color-text)",
                    color: "transparent",
                  }}
                >
                  Automate.
                </span>
              </span>
            </span>
            <span className="title-mask block">
              <span className="line block" style={{ color: "var(--color-accent)" }}>
                Relax.
              </span>
            </span>
          </h1>

          {/* Content row */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-12 gap-6 max-w-5xl">
            <div className="reveal sm:col-span-7">
              <p
                style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
                className="text-text-dim leading-relaxed"
              >
                Register your APIs, create scheduled jobs, and let vcron hit
                your endpoints on time — every time. No infrastructure needed.
              </p>
            </div>
            <div className="reveal sm:col-span-5 flex flex-wrap items-end gap-3 sm:justify-end">
              {loggedIn === null ? (
                <div className="h-11 w-32 animate-pulse rounded-lg bg-surface" />
              ) : loggedIn ? (
                <Link href="/dashboard" className="accent-btn px-7 py-3 text-sm">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/auth" className="accent-btn px-7 py-3 text-sm">
                    Get Started
                  </Link>
                  <Link href="/dashboard" className="ghost-btn px-7 py-3 text-sm">
                    Live Demo
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 reveal grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl">
            {[
              { num: "30s", label: "Minimum Interval" },
              { num: "✓", label: "Cron Expressions" },
              { num: "✓", label: "Auto Retries" },
              { num: "✓", label: "Multi-App" },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }} className="font-bold text-accent">
                  {s.num}
                </p>
                <p className="text-xs text-text-dimmer uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <section
        className="marquee-section py-3 sm:py-4"
        style={{ background: "linear-gradient(90deg, rgba(202,255,97,0.02), rgba(202,255,97,0.05), rgba(202,255,97,0.02))" }}
      >
        <div className="marquee-content">
          {renderMarqueeSpan()}
          {renderMarqueeSpan()}
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section style={{ padding: "clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 5rem)" }}>
        <div className="reveal mb-12 sm:mb-16">
          <p className="section-label">Expertise</p>
          <h2
            className="font-bold max-w-3xl"
            style={{
              fontSize: "clamp(2rem, 7vw, 5rem)",
              lineHeight: "0.85",
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
            }}
          >
            Built for{" "}
            <span
              style={{
                WebkitTextStroke: "clamp(0.005rem, 0.15vw, 0.08rem) var(--color-accent)",
                color: "transparent",
              }}
            >
              reliability.
            </span>
          </h2>
        </div>

        {/* Staggered 2-column grid */}
        <div className="stagger-grid">
          {features.map((f) => (
            <div key={f.num} className="reveal skill-card stagger-item">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl mb-5 transition-transform"
                style={{ background: "rgba(202,255,97,0.12)", color: "var(--color-accent)" }}
              >
                {f.icon}
              </div>
              <h4 className="font-semibold mb-1" style={{ fontSize: "1.25rem" }}>{f.title}</h4>
              <p className="text-sm text-text-dimmer mb-3">{f.subtitle}</p>
              <p className="text-sm text-text-dim leading-relaxed mb-4">{f.desc}</p>
              <div className="flex flex-wrap gap-2">
                {f.tags.map((t) => (
                  <span key={t} className="tech-pill">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section style={{ padding: "clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 5rem)" }}>
        <div className="reveal mb-12 sm:mb-16">
          <p className="section-label">How it works</p>
          <h2
            className="font-bold max-w-3xl"
            style={{
              fontSize: "clamp(2rem, 7vw, 5rem)",
              lineHeight: "0.85",
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
            }}
          >
            Three steps to{" "}
            <span
              style={{
                WebkitTextStroke: "clamp(0.005rem, 0.15vw, 0.08rem) var(--color-accent)",
                color: "transparent",
              }}
            >
              automate.
            </span>
          </h2>
        </div>

        <div className="space-y-5 max-w-4xl">
          {steps.map((step) => (
            <div key={step.num} className="reveal step-card">
              <div className="flex items-start gap-5 sm:gap-8">
                <span
                  className="font-bold shrink-0"
                  style={{
                    fontSize: "clamp(2rem, 5vw, 3.5rem)",
                    lineHeight: "1",
                    color: "var(--color-accent)",
                  }}
                >
                  {step.num}
                </span>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="step-year">Step {step.num}</p>
                  <h3
                    className="font-semibold mb-2"
                    style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-text-dim leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section style={{ padding: "clamp(4rem, 10vw, 8rem) clamp(1.5rem, 5vw, 5rem)" }}>
        <div className="reveal mb-12">
          <p className="section-label">Highlights</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
          {[
            { num: "30s", label: "Minimum Interval" },
            { num: "10x", label: "Max Retry Count" },
            { num: "1MB", label: "Max RAM Usage" },
          ].map((s) => (
            <div key={s.label} className="reveal stat-card">
              <p className="stat-number text-accent">{s.num}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section style={{ padding: "clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 5rem)" }}>
        <div className="reveal step-card text-center" style={{ padding: "clamp(2.5rem, 6vw, 5rem)" }}>
          <h2
            className="font-bold mb-5"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              lineHeight: "0.85",
              letterSpacing: "-0.045em",
              textTransform: "uppercase",
            }}
          >
            Ready to <span className="text-accent">automate?</span>
          </h2>
          <p className="text-text-dim text-sm sm:text-base mb-10 max-w-md mx-auto">
            Create an account and start scheduling jobs in under a minute.
          </p>
          {loggedIn ? (
            <Link href="/dashboard" className="accent-btn inline-flex px-8 py-3.5 text-sm">
              Go to Dashboard →
            </Link>
          ) : (
            <Link href="/auth" className="accent-btn inline-flex px-8 py-3.5 text-sm">
              Get Started — It's Free
            </Link>
          )}
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="relative overflow-hidden" style={{ background: "#050505" }}>
        <div style={{ padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 5rem) 0" }}>
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="vcron" width={32} height={32} />
              <span className="font-bold text-lg">
                <span className="text-accent">v</span>cron
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {loggedIn ? (
                <Link href="/dashboard" className="accent-btn px-5 py-2 text-xs">
                  Dashboard →
                </Link>
              ) : (
                <Link href="/auth" className="accent-btn px-5 py-2 text-xs">
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Big footer text */}
          <div className="reveal" style={{ overflow: "hidden" }}>
            <p className="footer-big-text" style={{ fontSize: "clamp(3rem, 18vw, 16rem)" }}>
              vcron•
            </p>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-2 py-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-text-dimmer" style={{ fontSize: "0.75rem" }}>
              © 2026 vcron — cron job server
            </span>
            <span className="text-text-dimmer" style={{ fontSize: "0.75rem" }}>
              Built with Rust + Next.js
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function renderMarqueeSpan() {
  return (
    <span className="mono text-xs sm:text-sm tracking-[0.25em] font-bold">
      <span className="text-text">SCHEDULE</span>
      <span className="text-accent mx-5 sm:mx-6">◦</span>
      <span className="text-text">EXECUTE</span>
      <span className="text-accent mx-5 sm:mx-6">◦</span>
      <span className="text-text">LOG</span>
      <span className="text-accent mx-5 sm:mx-6">◦</span>
      <span className="text-text">RETRY</span>
      <span className="text-accent mx-5 sm:mx-6">◦</span>
      <span className="text-text">REPEAT</span>
      <span className="text-accent mx-5 sm:mx-6">◦</span>
    </span>
  );
}

const features = [
  {
    num: "01",
    title: "Flexible Scheduling",
    subtitle: "Cron expressions or simple intervals",
    desc: "Every 30 seconds to daily at midnight. Full 5-field cron support plus interval:N syntax for sub-minute scheduling.",
    tags: ["Cron", "Intervals", "30s minimum"],
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  },
  {
    num: "02",
    title: "Multi-App Support",
    subtitle: "Register multiple APIs as apps",
    desc: "Each app has its own base URL. Jobs define relative paths like /healthz. Full URL is constructed automatically.",
    tags: ["Multi-app", "Base URL", "Paths"],
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  },
  {
    num: "03",
    title: "Built-in Retries",
    subtitle: "Automatic exponential backoff",
    desc: "Configurable retry count per job with 2^n second backoff. Timeout and max attempts fully customizable.",
    tags: ["Retries", "Backoff", "Timeout"],
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  },
  {
    num: "04",
    title: "Run History",
    subtitle: "Full execution logs",
    desc: "Status codes, response bodies, durations and error messages stored for every single job execution.",
    tags: ["Logs", "Status codes", "History"],
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
  },
  {
    num: "05",
    title: "Secure Auth",
    subtitle: "Bcrypt + JWT sessions",
    desc: "Username and password authentication. Your data is scoped to your account — no one else sees your jobs.",
    tags: ["JWT", "Bcrypt", "Scoped"],
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  },
  {
    num: "06",
    title: "Lightweight",
    subtitle: "Runs on 1GB VPS",
    desc: "Rust backend with SQLite. No external database process. Minimal RAM usage, optimized binary.",
    tags: ["Rust", "SQLite", "1GB VPS"],
    icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.7 5.7a4.5 4.5 0 0 1 3.6-1.8h3.4a4.5 4.5 0 0 1 3.6 1.8l1.5 1.85a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 0-3 3" /></svg>,
  },
];

const steps = [
  {
    num: "01",
    title: "Register your API",
    desc: "Create an app with a base URL — e.g. https://api.blu3.in. Add a description so you remember what it's for.",
  },
  {
    num: "02",
    title: "Add jobs",
    desc: "Define paths like /healthz, pick a schedule (every 30s, every 5min, cron expression), set method and headers.",
  },
  {
    num: "03",
    title: "Relax",
    desc: "vcron hits your endpoints on schedule and logs every result. Check the logs page for status, duration and response bodies.",
  },
];
