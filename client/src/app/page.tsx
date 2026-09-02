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
      <div className="global-grid" />

      {/* Hero */}
      <section
        className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 82% 22%, rgba(202,255,97,0.06), transparent 30%), radial-gradient(circle at 18% 78%, rgba(120,144,255,0.04), transparent 35%)",
          }}
        />

        <div
          className="relative z-20 mx-auto w-full max-w-7xl"
          style={{ padding: "clamp(2rem, 5vw, 5rem) clamp(1.5rem, 5vw, 5rem)" }}
        >
          {/* Kicker */}
          <div className="reveal mb-6">
            <p className="mono text-[10px] sm:text-xs tracking-[0.16em] text-text-dim">
              <span className="text-accent">◦</span> HTTP cron scheduler <span className="text-accent">◦</span> Rust + SQLite <span className="text-accent">◦</span> 2026
            </p>
          </div>

          {/* Title */}
          <h1
            className="font-bold relative z-10"
            style={{
              fontSize: "clamp(3rem, 10vw, 9rem)",
              lineHeight: "0.85",
              letterSpacing: "-0.06em",
            }}
          >
            <span className="title-mask block">
              <span className="line block">Schedule.</span>
            </span>
            <span className="title-mask block">
              <span
                className="line block"
                style={{
                  WebkitTextStroke: "clamp(0.005rem, 0.15vw, 0.08rem) var(--color-text)",
                  color: "transparent",
                }}
              >
                Automate.
              </span>
            </span>
            <span className="title-mask block">
              <span className="line block text-accent">Relax.</span>
            </span>
          </h1>

          {/* Hero content grid */}
          <div
            className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl"
          >
            <div className="reveal">
              <p className="text-base sm:text-lg text-text-dim leading-relaxed">
                Register your APIs, create scheduled jobs, and let vcron hit
                your endpoints on time — every time. No infrastructure needed.
              </p>
            </div>
            <div className="reveal flex flex-wrap items-end gap-3">
              {loggedIn === null ? (
                <div className="h-11 w-32 animate-pulse rounded-lg bg-surface" />
              ) : loggedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
                >
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="rounded-xl bg-accent px-6 py-2.5 text-sm font-medium text-black hover:bg-accent-dim transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-xl border border-border bg-surface px-6 py-2.5 text-sm text-text-dim hover:text-text hover:border-border-hover transition-colors"
                  >
                    Live Demo
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero rail */}
          <div className="mt-12 reveal">
            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mono text-[9px] sm:text-[10px] tracking-[0.12em] text-text-dimmer">
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
      <section
        className="marquee-section border-y border-border py-3 sm:py-4"
        style={{ background: "rgba(202,255,97,0.04)" }}
      >
        <div className="marquee-content">
          <span className="mono text-xs sm:text-sm tracking-[0.2em] font-bold">
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
          <span className="mono text-xs sm:text-sm tracking-[0.2em] font-bold">
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
        </div>
      </section>

      {/* Features */}
      <section
        className="mx-auto w-full max-w-7xl"
        style={{ padding: "clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 5rem)" }}
      >
        {/* Section heading */}
        <div className="reveal mb-10 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr] gap-2 sm:gap-0">
            <div className="mono text-[10px] sm:text-xs tracking-[0.12em] text-accent mb-2 sm:mb-0">
              ◦ Features
            </div>
            <h2
              className="font-bold"
              style={{
                fontSize: "clamp(2rem, 7vw, 6rem)",
                lineHeight: "0.85",
                letterSpacing: "-0.06em",
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
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((f) => (
            <FeatureCard key={f.num} {...f} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        className="mx-auto w-full max-w-5xl"
        style={{ padding: "clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 5rem)" }}
      >
        <div className="reveal mb-10 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr] gap-2 sm:gap-0">
            <div className="mono text-[10px] sm:text-xs tracking-[0.12em] text-accent mb-2 sm:mb-0">
              ◦ How it works
            </div>
            <h2
              className="font-bold"
              style={{
                fontSize: "clamp(2rem, 7vw, 6rem)",
                lineHeight: "0.85",
                letterSpacing: "-0.06em",
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
        </div>

        <div className="space-y-2 sm:space-y-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="reveal glass-card spotlight-card p-5 sm:p-8 group cursor-default"
              onMouseMove={handleSpotlight}
            >
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="mono text-xl sm:text-2xl font-bold text-text-dimmer tabular-nums shrink-0">
                  {step.num}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-text-dim mt-1">{step.desc}</p>
                </div>
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-text-dimmer group-hover:text-accent transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="mx-auto w-full max-w-5xl"
        style={{ padding: "clamp(3rem, 8vw, 6rem) clamp(1.5rem, 5vw, 5rem)" }}
      >
        <div className="reveal glass-card p-8 sm:p-16 text-center">
          <h2
            className="font-bold mb-4"
            style={{
              fontSize: "clamp(2rem, 6vw, 4rem)",
              lineHeight: "0.85",
              letterSpacing: "-0.06em",
            }}
          >
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
      <footer className="border-t border-border py-6 sm:py-8 px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 mono text-[9px] sm:text-[10px] tracking-[0.12em] text-text-dimmer">
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

const features = [
  { num: "01", title: "Flexible Scheduling", desc: "Cron expressions or simple intervals. Every 30 seconds to daily at midnight.", icon: "clock" },
  { num: "02", title: "Multi-App Support", desc: "Register multiple APIs as apps. Each with its own base URL and job paths.", icon: "grid" },
  { num: "03", title: "Built-in Retries", desc: "Automatic exponential backoff retries. Configurable timeout and retry count per job.", icon: "retry" },
  { num: "04", title: "Run History", desc: "Full execution logs with status codes, response bodies, durations and error messages.", icon: "chart" },
  { num: "05", title: "Secure Auth", desc: "Username + password with bcrypt and JWT. Your data is scoped to your account.", icon: "shield" },
  { num: "06", title: "Lightweight", desc: "Rust backend with SQLite. Runs on 1GB VPS with minimal resource usage.", icon: "feather" },
];

const steps = [
  { num: "01", title: "Register your API", desc: "Create an app with a base URL — e.g. https://api.blu3.in" },
  { num: "02", title: "Add jobs", desc: "Define paths like /healthz, pick a schedule, set method and headers" },
  { num: "03", title: "Relax", desc: "vcron hits your endpoints on schedule and logs every result" },
];

const icons: Record<string, React.ReactNode> = {
  clock: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  grid: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
  retry: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  chart: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>,
  shield: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  feather: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.7 5.7a4.5 4.5 0 0 1 3.6-1.8h3.4a4.5 4.5 0 0 1 3.6 1.8l1.5 1.85a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 0a3 3 0 0 0-3 3" /></svg>,
};

function FeatureCard({ num, title, desc, icon }: { num: string; title: string; desc: string; icon: string }) {
  return (
    <div
      className="reveal glass-card spotlight-card p-5 sm:p-6 group cursor-default transition-transform hover:-translate-y-1 duration-300"
      onMouseMove={handleSpotlight}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-glow text-accent">
          {icons[icon]}
        </div>
        <span className="mono text-xs text-text-dimmer tabular-nums">{num}</span>
      </div>
      <h3 className="font-semibold mb-1 text-sm sm:text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-text-dim leading-relaxed">{desc}</p>
    </div>
  );
}
