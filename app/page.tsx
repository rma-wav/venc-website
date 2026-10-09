"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MorphController } from "@/lib/controller";
import ExperienceCanvas from "@/components/three/ExperienceCanvas";
import ScrollRig from "@/components/ScrollRig";
import Navbar from "@/components/Navbar";
import ProgressNav, { type HudApi } from "@/components/ProgressNav";
import Loader from "@/components/Loader";
import CustomCursor from "@/components/CustomCursor";
import {
  Hero,
  Tentang,
  Fokus,
  Jadwal,
  Akses,
  Kolaborasi,
  Footer,
} from "@/components/sections";

// Slide order (10 panels): 0 Hero(VENC) · 1 Tentang · 2-5 Fokus ·
// 6 Jadwal · 7 Akses · 8 Kolaborasi · 9 Footer
const TOTAL_PANELS = 10;

export default function Page() {
  const ctrlRef = useRef<MorphController | null>(null);
  if (!ctrlRef.current) ctrlRef.current = new MorphController();
  const controller = ctrlRef.current;

  const [ready, setReady] = useState(false);
  const [count] = useState(() =>
    typeof window !== "undefined" &&
    Math.min(window.innerWidth, window.innerHeight) < 700
      ? 4500
      : 10000
  );

  // Light/dark theme, persisted across visits.
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("venc-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      window.localStorage.setItem("venc-theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);
  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const goToPanelRef = useRef<((i: number) => void) | null>(null);
  const hudRef = useRef<HudApi | null>(null);

  const handleReady = useCallback(() => {
    setReady(true);
  }, [controller]);

  return (
    <>
      <Loader show={!ready} />
      <CustomCursor />
      <Navbar goToPanelRef={goToPanelRef} theme={theme} onToggleTheme={toggleTheme} />
      <ExperienceCanvas
        controller={controller}
        count={count}
        onReady={handleReady}
        theme={theme}
      />
      <ScrollRig
        controller={controller}
        ready={ready}
        goToPanelRef={goToPanelRef}
        hudRef={hudRef}
      />
      <ProgressNav
        ref={hudRef}
        total={TOTAL_PANELS}
        goToPanelRef={goToPanelRef}
      />
      <main id="h-pin" className="relative z-10 overflow-hidden">
        <div id="h-track" className="flex h-screen w-max">
          <Hero />
          <Tentang />
          <Fokus />
          <Jadwal />
          <Akses />
          <Kolaborasi />
          <Footer />
        </div>
      </main>
    </>
  );
}
