"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { MorphController, SceneName } from "@/lib/controller";
import type { HudApi } from "@/components/ProgressNav";

gsap.registerPlugin(ScrollTrigger);

const SCENES: SceneName[] = [
  "V",
  "E",
  "N",
  "C",
  "VENC",
  "rings",
  "neural",
  "bars",
  "trend",
  "hourglass",
  "scatter",
];

interface Props {
  controller: MorphController;
  ready: boolean;
  goToPanelRef: { current: ((i: number) => void) | null };
  hudRef: { current: HudApi | null };
}

/**
 * Horizontal slide journey rig.
 *
 * The page scrolls vertically (smoothed by Lenis) but a pinned tween
 * translates #h-track sideways — so scrolling moves the site left/right.
 * Each `[data-panel]` is one full screen (100vw x 100vh). When a panel
 * reaches the center of the viewport, its `data-scene` morphs the particle
 * field. Nothing auto-plays: scenes change only through scroll.
 */
export default function ScrollRig({
  controller,
  ready,
  goToPanelRef,
  hudRef,
}: Props) {
  useEffect(() => {
    if (!ready) return;

    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const track = document.getElementById("h-track");
    const pinEl = document.getElementById("h-pin");
    if (!track || !pinEl) return;

    const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
    const getAmount = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const goTo = (i: number) => {
      const n = panels.length;
      if (n < 2) return;
      const clamped = Math.max(0, Math.min(i, n - 1));
      const y = (getAmount() / (n - 1)) * clamped;
      lenis.scrollTo(y, { duration: 1.6 });
    };
    goToPanelRef.current = goTo;

    // Declarative panel jumps: any [data-goto="N"] click scrolls to panel N.
    const onGotoClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.(
        "[data-goto]"
      ) as HTMLElement | null;
      if (!el) return;
      e.preventDefault();
      goTo(parseInt(el.dataset.goto || "0", 10));
    };
    document.addEventListener("click", onGotoClick);

    // The master horizontal tween (pinned, scrubbed by vertical scroll).
    const tween = gsap.to(track, {
      x: () => -getAmount(),
      ease: "none",
      scrollTrigger: {
        trigger: pinEl,
        start: "top top",
        end: () => `+=${getAmount()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          controller.scrollProgress = self.progress;
          hudRef.current?.setProgress(self.progress);
        },
      },
    });

    const triggers: ScrollTrigger[] = [];

    panels.forEach((panel, i) => {
      const scene = panel.dataset.scene as SceneName;

      // Scene morph when this panel is centered — scroll-driven only.
      if (SCENES.includes(scene)) {
        triggers.push(
          ScrollTrigger.create({
            trigger: panel,
            containerAnimation: tween,
            start: "left center",
            end: "right center",
            onToggle: (self) => {
              if (self.isActive) {
                controller.panelIndex = i;
                controller.morphTo(scene);
                hudRef.current?.setActive(i);
              }
            },
          })
        );
      }

      // Content reveals slide in from the right as the panel arrives.
      panel.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        const t = gsap.fromTo(
          el,
          { x: 56, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left 75%",
            },
          }
        );
        if (t.scrollTrigger) triggers.push(t.scrollTrigger);
      });
    });

    controller.panelIndex = 0;
    controller.scrollProgress = 0;
    hudRef.current?.setActive(0);
    hudRef.current?.setProgress(0);

    ScrollTrigger.refresh();

    return () => {
      document.removeEventListener("click", onGotoClick);
      triggers.forEach((t) => t.kill());
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.ticker.remove(raf);
      lenis.destroy();
      goToPanelRef.current = null;
    };
  }, [ready, controller, goToPanelRef, hudRef]);

  return null;
}
