"use client";

interface Props {
  goToPanelRef: { current: ((i: number) => void) | null };
  theme: "dark" | "light";
  onToggleTheme: () => void;
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

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5 5l1.7 1.7M17.3 17.3L19 19M19 5l-1.7 1.7M6.7 17.3L5 19" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
    </svg>
  );
}

/**
 * Right-edge vertical sidebar. Brand mark on top, section links running
 * vertically down the middle, light/dark toggle at the bottom. The old top
 * bar and its "Kolaborasi" pill button are gone.
 */
export default function Navbar({ goToPanelRef, theme, onToggleTheme }: Props) {
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

      {/* Bottom slot: light/dark mode toggle */}
      <button
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
        title={theme === "dark" ? "Mode terang" : "Mode gelap"}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all hover:rotate-12 hover:border-white/40 hover:text-white"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </aside>
  );
}
