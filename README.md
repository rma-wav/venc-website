# VENC — Website

Website brand VENC: media edukasi independen (AI, Data, Bisnis, Produktivitas).
Identitas visual: hitam, putih, metallic.

## Konsep

- **Hero**: ~15.000 butir bola metalik 3D yang berkumpul → membentuk huruf
  **V → E → N → C** secara bergantian (dengan efek "melebur" di tiap transisi)
  → lalu menyatu menjadi **VENC** utuh.
- **Scroll**: partikel ber-morph mengikuti alur profil —
  gelombang ripple (Tentang), neural network (AI), bar chart (Data),
  grafik menanjak (Bisnis), jam pasir (Produktivitas), partikel menyebar
  (Akses Belajar), ripple (Kolaborasi), dan kembali ke wordmark VENC.
- **Interaksi**: klik/tap di mana saja memicu gelombang ripple metalik
  yang merambat lewat partikel — *"One touch, wider waves."*

## Tech stack

- Next.js 15 (App Router) + TypeScript + React 19
- Three.js via `@react-three/fiber` — particle engine (`InstancedMesh`,
  material chrome `metalness: 1`, environment prosedural `RoomEnvironment`)
- GSAP + ScrollTrigger — sinkronisasi morph dengan scroll
- Lenis — smooth scrolling
- Tailwind CSS v4

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # verifikasi production build
npm start        # jalankan hasil build
```

## Deploy

Dororng repo ini ke GitHub lalu import di [Vercel](https://vercel.com) —
tidak perlu konfigurasi khusus (framework preset: Next.js).

## Kustomisasi

- **Email kontak**: ganti `mailto:halo@venc.id` di
  `components/sections.tsx` (bagian Kolaborasi) dengan email asli.
- **Jumlah partikel**: `app/page.tsx` (`15000` desktop / `7000` layar kecil).
- **Urutan/kecepatan intro**: `lib/controller.ts` (`playIntro`, `stepMs`).
- **Target morph**: tambah generator di `lib/targets.ts`, daftarkan di
  `components/three/ExperienceCanvas.tsx` (`Boot`), lalu pakai lewat
  atribut `data-scene="namasce"`.
- **Teks**: seluruh copy ada di `components/sections.tsx`.

## Struktur

```
app/                  layout, page, globals.css
components/
  three/              ExperienceCanvas, ParticleField (particle engine)
  sections.tsx        Hero, Tentang, Fokus, Jadwal, Akses, Kolaborasi, Footer
  ScrollRig.tsx       Lenis + ScrollTrigger → MorphController
  Navbar.tsx / Loader.tsx
lib/
  targets.ts          generator point-cloud (huruf & bentuk)
  controller.ts       MorphController — jembatan DOM ↔ 3D
```
