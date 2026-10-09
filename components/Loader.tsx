"use client";

export default function Loader({ show }: { show: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black transition-opacity duration-1000 ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!show}
    >
      <div className="font-display text-4xl font-bold tracking-[0.3em] metallic-text animate-pulse">
        VENC
      </div>
      <div className="h-px w-40 overflow-hidden bg-white/10">
        <div className="h-full w-1/2 animate-[loadslide_1.2s_ease-in-out_infinite] bg-white/70" />
      </div>
      <style>{`@keyframes loadslide { 0% { transform: translateX(-100%);} 100% { transform: translateX(300%);} }`}</style>
    </div>
  );
}
