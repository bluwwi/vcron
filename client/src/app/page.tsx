"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => setLoggedIn(r.ok))
      .catch(() => setLoggedIn(false));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.15 }
    );

    containerRef.current?.querySelectorAll(".reveal, .title-mask").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="global-grid" />

      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 82% 22%, rgba(202,255,97,0.06), transparent 30%), radial-gradient(circle at 18% 78%, rgba(120,144,255,0.04), transparent 35%)",
          }}
        />

        <div className="relative z-20 mx-auto max-w-6xl px-6 py-20 w-full">
          {/* Kicker */}
          <div className="reveal mb-8">
            <p className="mono text-xs uppercase tracking-[0.16em] text-text-dim">
              <span className="text-accent">◦</span> HTTP cron scheduler <span className="text-accent">◦</span> Rust + SQLite <span className="text-accent">◦</span> 2026
            </p>
          </div>

          {/* Title */}
          <h1 className="font-bold tracking-[-0.078em] leading-[0.75]" style={{ fontSize: "clamp(68px, 12vw, 180px)" }}>
            <span className="title-mask block">
              <span className="line block">Schedule.</span>
            </span>
            <span className="title-mask block">
              <span className="line outline-text">Automate.</span>
            </span>
            <span className="title-mask block">
              <span className="line block text-accent">Relax.</span>
            </span>
          </h1>

          {/* Hero lower */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl">
            <div className="reveal">
              <p className="text-lg text-text-dim leading-relaxed">
                Register your APIs, create scheduled jobs, and let vcron hit
                your endpoints on time — every time. No infrastructure needed.
              </p>
            </div>
            <div className="reveal flex items-end gap-3">
              {loggedIn === null ? (
                <div className="h-12 w-32 animate-pulse rounded-lg bg-surface" />
              ) : loggedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="rounded-xl bg-accent px-6 py-3 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-xl border border-border bg-surface px-6 py-3 text-sm text-text-dim hover:text-text hover:border-border-hover transition-colors"
                  >
                    Live Demo
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero rail */}
          <div className="mt-16 reveal">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mono text-[10px] uppercase tracking-[0.12em] text-text-dimmer">
              <span><span className="text-accent">◦</span> 30s intervals</span>
              <span><span className="text-accent">◦</span> Cron expressions</span>
              <span><span className="text-accent">◦</span> Auto retries</span>
              <span><span className="text-accent">◦</span> Run history</span>
              <span><span className="text-accent">◦</span> Multi-app</span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="relative border-y border-border overflow-hidden py-4" style={{ background: "rgba(202,255,97,0.04)" }}>
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="marquee-group flex items-center gap-8 px-4 shrink-0">
              {["SCHEDULE", "EXECUTE", "LOG", "RETRY", "REPEAT"].map((word, j) => (
                <span key={j} className="mono text-sm uppercase tracking-[0.2em] font-bold whitespace-nowrap">
                  <span className="text-text">{word}</span>
                  <span className="text-accent ml-8">◦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="reveal mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
            <div className="mono text-xs uppercase tracking-[0.12em] text-accent">
              ◦ Features
            </div>
            <div className="sm:col-span-2">
              <h2 className="font-bold tracking-[-0.06em] leading-[0.86]" style={{ fontSize: "clamp(48px, 8vw, 96px)" }}>
                Built for <span className="outline-accent">reliability.</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            num="01"
            title="Flexible Scheduling"
            desc="Cron expressions or simple intervals. Every 30 seconds to daily at midnight."
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          />
          <FeatureCard
            num="02"
            title="Multi-App Support"
            desc="Register multiple APIs as apps. Each with its own base URL and job paths."
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>}
          />
          <FeatureCard
            num="03"
            title="Built-in Retries"
            desc="Automatic exponential backoff retries. Configurable timeout and retry count per job."
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          />
          <FeatureCard
            num="04"
            title="Run History"
            desc="Full execution logs with status codes, response bodies, durations and error messages."
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>}
          />
          <FeatureCard
            num="05"
            title="Secure Auth"
            desc="Username + password with bcrypt and JWT. Your data is scoped to your account."
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>}
          />
          <FeatureCard
            num="06"
            title="Lightweight"
            desc="Rust backend with SQLite. Runs on 1GB VPS with minimal resource usage."
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.7 5.7a4.5 4.5 0 0 1 3.6-1.8h3.4a4.5 4.5 0 0 1 3.6 1.8l1.5 1.85a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 0-3 3" /></svg>}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="reveal mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
            <div className="mono text-xs uppercase tracking-[0.12em] text-accent">
              ◦ How it works
            </div>
            <div className="sm:col-span-2">
              <h2 className="font-bold tracking-[-0.06em] leading-[0.86]" style={{ fontSize: "clamp(48px, 8vw, 96px)" }}>
                Three steps to <span className="outline-accent">automate.</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { num: "01", title: "Register your API", desc: "Create an app with a base URL — e.g. https://api.blu3.in" },
            { num: "02", title: "Add jobs", desc: "Define paths like /healthz, pick a schedule, set method and headers" },
            { num: "03", title: "Relax", desc: "vcron hits your endpoints on schedule and logs every result" },
          ].map((step) => (
            <div key={step.num} className="reveal glass-card spotlight-card p-6 sm:p-8 group cursor-default" onMouseMove={handleSpotlight}>
              <div className="flex items-center gap-6">
                <span className="mono text-2xl font-bold text-text-dimmer tabular-nums shrink-0">{step.num}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm text-text-dim mt-1">{step.desc}</p>
                </div>
                <svg className="h-5 w-5 text-text-dimmer group-hover:text-accent transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="reveal glass-card p-12 sm:p-16 text-center">
          <h2 className="font-bold tracking-[-0.06em] leading-[0.86] mb-4" style={{ fontSize: "clamp(40px, 7vw, 80px)" }}>
            Ready to <span className="text-accent">automate?</span>
          </h2>
          <p className="text-text-dim text-sm mb-8 max-w-md mx-auto">
            Create an account and start scheduling jobs in under a minute.
          </p>
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex rounded-xl bg-accent px-8 py-3 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <Link
              href="/auth"
              className="inline-flex rounded-xl bg-accent px-8 py-3 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
            >
              Get Started — It's Free
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between mono text-[10px] uppercase tracking-[0.12em] text-text-dimmer">
          <span><span className="text-accent">◦</span> vcron — cron job server</span>
          <span>Built with Rust + Next.js</span>
        </div>
      </footer>
    </div>
  );
}

function handleSpotlight(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  e.currentTarget.style.setProperty("--mx", `${x}%`);
  e.currentTarget.style.setProperty("--my", `${y}%`);
}

function FeatureCard({ num, title, desc, icon }: { num: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div
      className="reveal glass-card spotlight-card p-6 group cursor-default transition-transform hover:-translate-y-1 duration-300"
      onMouseMove={handleSpotlight}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-glow text-accent">
          {icon}
        </div>
        <span className="mono text-xs text-text-dimmer tabular-nums">{num}</span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-text-dim leading-relaxed">{desc}</p>
    </div>
  );
}
