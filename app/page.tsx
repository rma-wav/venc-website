"use client";

import { useCallback, useRef, useState } from "react";
import { MorphController } from "@/lib/controller";
import ExperienceCanvas from "@/components/three/ExperienceCanvas";
import ScrollRig from "@/components/ScrollRig";
import Navbar from "@/components/Navbar";
import ProgressNav, { type HudApi } from "@/components/ProgressNav";
import Loader from "@/components/Loader";
import {
  LetterIntro,
  Hero,
  Tentang,
  Fokus,
  Jadwal,
  Akses,
  Kolaborasi,
  Footer,
} from "@/components/sections";

// Slide order (14 panels): 0 V · 1 E · 2 N · 3 C · 4 Hero(VENC) ·
// 5 Tentang · 6-9 Fokus · 10 Jadwal · 11 Akses · 12 Kolaborasi · 13 Footer
const TOTAL_PANELS = 14;

export default function Page() {
  const ctrlRef = useRef<MorphController | null>(null);
  if (!ctrlRef.current) ctrlRef.current = new MorphController();
  const controller = ctrlRef.current;

  const [ready, setReady] = useState(false);
  const [count] = useState(() =>
    typeof window !== "undefined" &&
    Math.min(window.innerWidth, window.innerHeight) < 700
      ? 7000
      : 15000
  );

  const goToPanelRef = useRef<((i: number) => void) | null>(null);
  const hudRef = useRef<HudApi | null>(null);

  const handleReady = useCallback(() => {
    setReady(true);
  }, [controller]);

  return (
    <>
      <Loader show={!ready} />
      <Navbar goToPanelRef={goToPanelRef} />
      <ExperienceCanvas
        controller={controller}
        count={count}
        onReady={handleReady}
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
          <LetterIntro letter="V" no="1" scene="V" />
          <LetterIntro letter="E" no="2" scene="E" />
          <LetterIntro letter="N" no="3" scene="N" />
          <LetterIntro letter="C" no="4" scene="C" />
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
