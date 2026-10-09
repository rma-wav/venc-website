"use client";

import type { SceneName } from "@/lib/controller";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.4em] text-white/45">
      {children}
    </p>
  );
}

function Heading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl ${className}`}
    >
      {children}
    </h2>
  );
}

/** Shared full-screen slide shell for the horizontal journey. */
function Slide({
  scene,
  children,
  className = "",
}: {
  scene: SceneName;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      data-panel
      data-scene={scene}
      className={`relative flex h-screen w-screen shrink-0 items-center ${className}`}
    >
      {children}
    </section>
  );
}

/* ---------------------------------- HERO ---------------------------------- */

export function Hero() {
  return (
    <Slide scene="VENC" className="items-end pb-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div data-reveal>
          <Label>Media edukasi independen</Label>
          <p className="max-w-xl text-lg leading-relaxed text-white/75 md:text-xl">
            Artificial Intelligence · Data · Bisnis · Produktivitas — insight
            yang terstruktur untuk memahami topik kompleks secara praktis dan
            rasional.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              data-goto="1"
              className="rounded-full bg-white px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-black transition-transform hover:scale-105"
            >
              Jelajahi
            </button>
            <button
              data-goto="8"
              className="rounded-full border border-white/25 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/85 transition-colors hover:border-white hover:text-white"
            >
              Kolaborasi
            </button>
          </div>
        </div>
        <div
          data-reveal
          className="mt-16 flex items-center gap-3 text-white/35"
        >
          <span className="text-[10px] uppercase tracking-[0.35em]">
            Scroll untuk menjelajah ke samping
          </span>
          <span className="inline-block h-px w-8 animate-pulse bg-white/40" />
        </div>
      </div>
    </Slide>
  );
}

/* --------------------------------- TENTANG -------------------------------- */

export function Tentang() {
  return (
    <Slide scene="rings">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div data-reveal className="max-w-3xl">
          <Label>Tentang VENC</Label>
          <Heading>
            Cara berpikir yang <span className="metallic-text">jernih</span>,
            pola pikir yang <span className="metallic-text">bertumbuh</span>.
          </Heading>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-white/70 md:text-lg">
            <p>
              VENC adalah media edukasi independen yang berfokus pada Artificial
              Intelligence, Data, Bisnis, dan produktivitas. Kami menghadirkan
              insight dan perspektif yang terstruktur — membantu audiens
              memahami topik kompleks secara praktis dan rasional.
            </p>
            <p>
              Fokus kami adalah membangun cara berpikir yang jernih serta
              mendorong pola pikir yang berkembang, dengan pendekatan seimbang
              antara wawasan teknis, perspektif strategis, dan pengembangan
              pola pikir.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              ["6", "hari konten / minggu"],
              ["4", "pilar pembahasan"],
              ["1", "misi: berpikir jernih"],
            ].map(([n, t]) => (
              <div key={t}>
                <div className="font-display text-4xl font-bold metallic-text md:text-5xl">
                  {n}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/45">
                  {t}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ---------------------------------- FOKUS --------------------------------- */

const FOKUS = [
  {
    no: "01",
    scene: "neural" as SceneName,
    title: "Artificial Intelligence",
    desc: "Memahami cara kerja model, prompt, dan otomasi — tanpa hype, tanpa jargon berlebihan. AI sebagai alat berpikir, bukan sekadar tren.",
    tags: ["Machine Learning", "Prompt Engineering", "Otomasi"],
  },
  {
    no: "02",
    scene: "bars" as SceneName,
    title: "Data",
    desc: "Membaca angka dengan jernih: dari visualisasi hingga pengambilan keputusan berbasis data. Data yang baik melahirkan intuisi yang tajam.",
    tags: ["Analisis", "Visualisasi", "Decision-making"],
  },
  {
    no: "03",
    scene: "trend" as SceneName,
    title: "Bisnis",
    desc: "Strategi, model bisnis, dan cara berpikir sistem untuk membangun hal yang bertahan. Pertumbuhan yang rasional, bukan sekadar cepat.",
    tags: ["Strategi", "Model Bisnis", "Growth"],
  },
  {
    no: "04",
    scene: "hourglass" as SceneName,
    title: "Produktivitas",
    desc: "Sistem kerja yang tenang dan konsisten. Fokus pada output yang bermakna — bukan kesibukan yang melelahkan.",
    tags: ["Sistem Kerja", "Fokus", "Mindset"],
  },
];

export function Fokus() {
  return (
    <>
      {FOKUS.map((f, i) => (
        <Slide key={f.no} scene={f.scene}>
          <div className="mx-auto w-full max-w-7xl px-6">
            <div data-reveal className="max-w-2xl">
              <div className="mb-6 flex items-center gap-5">
                <span className="font-display text-sm font-bold tracking-[0.3em] metallic-text">
                  {f.no}
                </span>
                <span className="h-px w-16 bg-white/20" />
                <span className="text-[11px] uppercase tracking-[0.4em] text-white/45">
                  Pilar {i + 1} dari 4
                </span>
              </div>
              <Heading>{f.title}</Heading>
              <p className="mt-6 text-base leading-relaxed text-white/70 md:text-lg">
                {f.desc}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {f.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Slide>
      ))}
    </>
  );
}

/* ---------------------------------- JADWAL -------------------------------- */

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function Jadwal() {
  return (
    <Slide scene="VENC">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div data-reveal>
          <Label>Jadwal publikasi</Label>
          <Heading className="max-w-3xl">
            Konsisten, <span className="metallic-text">Senin hingga Sabtu</span>.
          </Heading>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Konten VENC dipublikasikan secara konsisten setiap Senin hingga
            Sabtu — ritme yang disiplin untuk membangun pemahaman sedikit demi
            sedikit, setiap hari.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {HARI.map((h) => (
              <div
                key={h}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-white/30"
              >
                <div className="mb-4 h-2 w-2 rounded-full bg-gradient-to-br from-white to-white/30 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
                <div className="font-display text-sm font-semibold tracking-wide text-white">
                  {h}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Konten baru
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-white/5 bg-transparent p-5 opacity-40">
              <div className="mb-4 h-2 w-2 rounded-full border border-white/30" />
              <div className="font-display text-sm font-semibold tracking-wide text-white/70">
                Minggu
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/30">
                Refleksi
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ---------------------------------- AKSES --------------------------------- */

export function Akses() {
  return (
    <Slide scene="scatter">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div data-reveal className="max-w-3xl">
          <Label>Akses belajar</Label>
          <Heading>
            Pendidikan seharusnya{" "}
            <span className="metallic-text">tidak selalu menjadi beban</span>.
          </Heading>
          <p className="mt-8 text-base leading-relaxed text-white/70 md:text-lg">
            Selain berbagi wawasan, VENC mendukung akses belajar dengan
            menghubungkan individu terpilih ke kesempatan pembelajaran berbayar
            ketika memungkinkan — karena keterbatasan finansial tidak seharusnya
            menghentikan rasa ingin tahu.
          </p>
          <div className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-white/40 font-display text-lg font-bold text-black">
              ✦
            </div>
            <p className="text-sm leading-relaxed text-white/65">
              Satu sentuhan kecil hari ini bisa membuka gelombang kesempatan
              yang lebih luas esok hari.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* -------------------------------- KOLABORASI ------------------------------- */

export function Kolaborasi() {
  return (
    <Slide scene="rings">
      <div className="mx-auto w-full max-w-7xl px-6 text-center">
        <div data-reveal>
          <Label>Kolaborasi</Label>
          <Heading className="mx-auto max-w-4xl">
            Punya visi yang <span className="metallic-text">sejalan</span>?
          </Heading>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            VENC terbuka untuk kolaborasi bagi yang memiliki visi yang sejalan
            dan berkomitmen pada integritas edukasi. Mari ciptakan gelombang
            yang lebih luas — bersama.
          </p>
          <div className="mt-12">
            <a
              href="mailto:halo@venc.id"
              className="inline-block rounded-full bg-white px-10 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-black transition-transform hover:scale-105"
            >
              Mulai Percakapan
            </a>
            <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-white/35">
              Psst — klik di mana saja, rasakan gelombangnya
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ---------------------------------- FOOTER --------------------------------- */

export function Footer() {
  return (
    <Slide scene="VENC" className="items-end pb-12">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div data-reveal>
          <p className="font-display text-[13vw] font-bold leading-[0.95] tracking-tight metallic-text md:text-[9vw]">
            One touch,
            <br />
            wider waves.
          </p>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="font-display text-sm font-bold tracking-[0.3em] metallic-text">
            VENC
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">
            Media edukasi independen — AI · Data · Bisnis · Produktivitas
          </p>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">
            © 2026 VENC
          </p>
        </div>
      </div>
    </Slide>
  );
}
