"use client";

import { useEffect, useState } from "react";

const PIXEL_GRID = 5;
const PIXEL_DELAY = 60;

export function PixelLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const total = PIXEL_GRID * PIXEL_GRID;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= total) return 0;
        return p + 1;
      });
    }, PIXEL_DELAY);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="flex items-center justify-center">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${PIXEL_GRID}, 1fr)` }}
        >
          {Array.from({ length: PIXEL_GRID * PIXEL_GRID }).map((_, i) => {
            const active = i < progress;
            return (
              <div
                key={i}
                className={`h-3 w-3 rounded-sm transition-colors duration-150 ${
                  active
                    ? "bg-accent shadow-[0_0_8px_var(--color-accent)]"
                    : "bg-zinc-800/40"
                }`}
              />
            );
          })}
        </div>
      </div>
      <div className="text-text-dim text-sm font-mono tracking-widest">
        <span className="text-accent">v</span>cron
      </div>
    </div>
  );
}
