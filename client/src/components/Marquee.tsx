"use client";

import { useEffect, useRef } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // pixels per second
  pauseOnHover?: boolean;
}

export function Marquee({ children, speed = 30, pauseOnHover = true }: MarqueeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const getContentWidth = () => content.scrollWidth / 2;

    let raf = 0;
    const el = content;

    function tick(now: number) {
      const delta = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = now;

      if (!pausedRef.current) {
        offsetRef.current -= speed * delta;
        const w = getContentWidth();
        if (offsetRef.current <= -w) {
          offsetRef.current += w;
        }
        el.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const onEnter = () => { pausedRef.current = true; };
      const onLeave = () => { pausedRef.current = false; };
      container.addEventListener("mouseenter", onEnter);
      container.addEventListener("mouseleave", onLeave);
      return () => {
        container.removeEventListener("mouseenter", onEnter);
        container.removeEventListener("mouseleave", onLeave);
        cancelAnimationFrame(raf);
      };
    }

    return () => cancelAnimationFrame(raf);
  }, [speed, pauseOnHover]);

  return (
    <div ref={containerRef} className="marquee-section">
      <div ref={contentRef} className="marquee-content">
        {children}
        {children}
      </div>
    </div>
  );
}
