"use client";

import { useEffect, useRef } from "react";

export function useRevealer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const els = document.querySelectorAll(".reveal, .title-mask");
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}
