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

/**
 * Right-edge vertical sidebar. Brand mark on top, section links running
 * vertically down the middle, thin ornament at the bottom. The old top
 * bar and its "Kolaborasi" pill button are gone.
 */
export default function Navbar({ goToPanelRef }: Props) {
  const go = (i: number) => goToPanelRef.current?.(i);
  return (
    <aside className="fixed right-0 top-0 z-40 flex h-full w-14 flex-col items-center justify-between border-l border-white/10 bg-black/45 py-6 backdrop-blur-md md:w-20">
      <button
        onClick={() => go(0)}
        aria-label="VENC — kembali ke awal"
        className="font-display text-base font-bold tracking-[0.2em] metallic-text md:text-lg"
      >
        V
      </button>

      <nav
        className="hidden flex-col items-center gap-8 md:flex"
        aria-label="Navigasi utama"
      >
        {LINKS.map((l) => (
          <button
            key={l.label}
            onClick={() => go(l.panel)}
            className="rotate-180 text-[10px] font-medium uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-white [writing-mode:vertical-rl]"
          >
            {l.label}
          </button>
        ))}
      </nav>
      {/* Mobile keeps just the brand mark, like the old top bar. */}

      <div
        aria-hidden="true"
        className="h-12 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent"
      />
    </aside>
  );
}
