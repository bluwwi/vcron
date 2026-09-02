"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function PixelLoader({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = canvas;
    const g = ctx;

    const PIXEL = 120;
    const GAP = 1;
    const COLOR_LIME = "#a3e635";
    const COLOR_WHITE = "#ffffff";
    const COLOR_BLACK = "#000000";
    const GLOW_LIME = "rgba(163,230,53,0.25)";
    const GLOW_WHITE = "rgba(255,255,255,0.15)";
    const FILL_MS = 500;
    const FADE_MS = 500;
    const WHITE_RATIO = 0.33;
    const BLACK_RATIO = 0.33;

    let cols: number;
    let rows: number;
    let total: number;
    let order: number[] = [];

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / PIXEL);
      rows = Math.ceil(h / PIXEL);
      total = cols * rows;

      order = Array.from({ length: total }, (_, i) => i);
      for (let i = total - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }

      g.fillStyle = COLOR_BLACK;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          g.fillRect(x * PIXEL, y * PIXEL, PIXEL - GAP, PIXEL - GAP);
        }
      }
    }

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const startTime = performance.now();
    let lastFilledCount = 0;
    let finished = false;

    function draw(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / FILL_MS, 1);
      const filledCount = Math.floor(progress * total);

      if (filledCount > lastFilledCount) {
        for (let i = lastFilledCount; i < filledCount; i++) {
          const idx = order[i];
          const x = (idx % cols) * PIXEL;
          const y = Math.floor(idx / cols) * PIXEL;
          const roll = Math.random();

          if (roll < BLACK_RATIO) {
            g.fillStyle = COLOR_BLACK;
            g.shadowColor = "transparent";
            g.shadowBlur = 0;
          } else if (roll < BLACK_RATIO + WHITE_RATIO) {
            g.fillStyle = COLOR_WHITE;
            g.shadowColor = GLOW_WHITE;
            g.shadowBlur = 3;
          } else {
            g.fillStyle = COLOR_LIME;
            g.shadowColor = GLOW_LIME;
            g.shadowBlur = 3;
          }
          g.fillRect(x, y, PIXEL - GAP, PIXEL - GAP);
        }

        g.shadowBlur = 0;
        lastFilledCount = filledCount;
      }

      if (progress >= 1 && !finished) {
        finished = true;
        cancelAnimationFrame(raf);
        container.style.opacity = "0";
        setTimeout(() => onCompleteRef.current?.(), FADE_MS);
        return;
      }

      raf = requestAnimationFrame(draw);
    }

    const container = c.parentElement!;
    container.style.transition = "opacity 500ms ease-out";
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#000000", opacity: 1, transition: "opacity 500ms ease-out" }}
    >
      <canvas ref={canvasRef} className="block" />
      <div className="absolute bottom-12">
        <Image
          src="/textlogo.svg"
          alt="vcron"
          width={180}
          height={40}
          style={{ opacity: 0.6 }}
        />
      </div>
    </div>
  );
}
