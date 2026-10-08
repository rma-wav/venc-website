"use client";

interface Props {
  goToPanelRef: { current: ((i: number) => void) | null };
}

// Panel indices in the horizontal journey:
// 0 V · 1 E · 2 N · 3 C · 4 VENC(hero) · 5 Tentang · 6-9 Fokus ·
// 10 Jadwal · 11 Akses · 12 Kolaborasi · 13 Footer
const LINKS = [
  { panel: 5, label: "Tentang" },
  { panel: 6, label: "Fokus" },
  { panel: 10, label: "Jadwal" },
  { panel: 11, label: "Akses" },
  { panel: 12, label: "Kolaborasi" },
];

export default function Navbar({ goToPanelRef }: Props) {
  const go = (i: number) => goToPanelRef.current?.(i);
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <button
          onClick={() => go(0)}
          className="font-display text-lg font-bold tracking-[0.25em] metallic-text"
        >
          VENC
        </button>
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <button
              key={l.label}
              onClick={() => go(l.panel)}
              className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => go(12)}
          className="hidden rounded-full border border-white/25 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.25em] text-white/80 transition-all hover:border-white hover:text-white md:block"
        >
          Kolaborasi
        </button>
      </div>
    </header>
  );
}
