"use client";

import { useEffect, useRef, useState } from "react";

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number; // pixels per second
  pauseOnHover?: boolean;
}

export function Marquee({ children, speed = 25, pauseOnHover = true }: MarqueeProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const [copies, setCopies] = useState(4);

  useEffect(() => {
    function calcCopies() {
      const content = contentRef.current;
      if (!content) return;
      const container = containerRef.current;
      if (!container) return;

      const oneCopy = content.scrollWidth / copies;
      const containerWidth = container.offsetWidth;
      const needed = Math.ceil((containerWidth * 2) / oneCopy);
      setCopies(Math.max(needed, 4));
    }

    calcCopies();
    window.addEventListener("resize", calcCopies);
    return () => window.removeEventListener("resize", calcCopies);
  }, [copies]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const el = content;
    let raf = 0;

    function tick(now: number) {
      const delta = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = now;

      if (!pausedRef.current) {
        offsetRef.current -= speed * delta;
        const halfWidth = el.scrollWidth / 2;
        if (offsetRef.current <= -halfWidth) {
          offsetRef.current += halfWidth;
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
  }, [speed, pauseOnHover, copies]);

  return (
    <div ref={containerRef} className="marquee-section">
      <div ref={contentRef} className="marquee-content">
        {Array.from({ length: copies }).map((_, i) => (
          <div key={i} className="shrink-0">{children}</div>
        ))}
      </div>
    </div>
  );
}
