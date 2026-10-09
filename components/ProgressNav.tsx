"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export interface HudApi {
  setProgress(p: number): void;
  setActive(i: number): void;
}

interface Props {
  total: number;
  goToPanelRef: { current: ((i: number) => void) | null };
}

/**
 * Slide-journey HUD: a thin progress bar on top and clickable
 * navigation dots on the right edge. Updated imperatively by ScrollRig
 * (no React re-renders on scroll).
 */
const ProgressNav = forwardRef<HudApi, Props>(function ProgressNav(
  { total, goToPanelRef },
  ref
) {
  const barRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useImperativeHandle(
    ref,
    () => ({
      setProgress(p: number) {
        if (barRef.current)
          barRef.current.style.transform = `scaleX(${Math.max(
            0,
            Math.min(1, p)
          )})`;
      },
      setActive(i: number) {
        dotRefs.current.forEach((d, di) => {
          if (!d) return;
          const active = di === i;
          d.style.opacity = active ? "1" : "0.3";
          d.style.transform = active ? "scale(1.6)" : "scale(1)";
        });
      },
    }),
    []
  );

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] bg-white/10">
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-gradient-to-r from-white/60 to-white"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
      <nav
        className="fixed right-24 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
        aria-label="Navigasi slide"
      >
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            onClick={() => goToPanelRef.current?.(i)}
            className="h-1.5 w-1.5 rounded-full bg-white transition-all duration-300"
            style={{ opacity: i === 0 ? 1 : 0.3 }}
            aria-label={`Ke slide ${i + 1}`}
          />
        ))}
      </nav>
    </>
  );
});

export default ProgressNav;
