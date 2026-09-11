import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* ── 1. GRID LAYER ──
          Refined graph-paper using CSS gradients.
          Opacity driven by CSS variable for per-theme tuning. */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#0f413910_1px,transparent_1px),linear-gradient(to_bottom,#0f413910_1px,transparent_1px)] bg-[size:52px_52px]"
        style={{ opacity: 'var(--grid-opacity)' }}
      />

      {/* ── 2. PRIMARY RADIAL GLOW ──
          A central spotlight that gives depth and draws the eye */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, var(--accent-surface) 0%, transparent 70%)',
          opacity: 0.6,
        }}
      />

      {/* ── 3. CORNER ACCENT GLOW ── */}
      <div className="absolute left-[8%] top-[-8%] h-[450px] w-[450px] rounded-full bg-teal-300 blur-[120px] dark:bg-teal-600" style={{ opacity: 'var(--blob-opacity)' }} />

      {/* ── 4. AURORA BLOBS ──
          Slow-moving gradient blobs for atmospheric depth.
          Dark mode uses richer, more vibrant colors with higher opacity. */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
        {/* Blob 1 — Purple/Violet */}
        <div
          className="absolute top-[-8%] left-[-8%] w-[38%] h-[38%] rounded-full mix-blend-multiply filter blur-[80px] animate-blob bg-purple-200 dark:mix-blend-screen dark:bg-purple-800/50"
          style={{ opacity: 'var(--blob-opacity)' }}
        />
        {/* Blob 2 — Cyan/Teal */}
        <div
          className="absolute top-[-6%] right-[-8%] w-[36%] h-[36%] rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000 bg-cyan-200 dark:mix-blend-screen dark:bg-cyan-700/50"
          style={{ opacity: 'var(--blob-opacity)' }}
        />
        {/* Blob 3 — Pink/Rose */}
        <div
          className="absolute bottom-[-16%] left-[18%] w-[45%] h-[45%] rounded-full mix-blend-multiply filter blur-[90px] animate-blob-slow animation-delay-4000 bg-pink-200 dark:mix-blend-screen dark:bg-rose-800/40"
          style={{ opacity: 'var(--blob-opacity)' }}
        />
        {/* Blob 4 (dark only) — Extra teal accent for richness */}
        <div
          className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-3000 bg-transparent dark:bg-emerald-700/30"
          style={{ opacity: 'var(--blob-opacity)' }}
        />
      </div>

      {/* ── 5. GRADIENT MESH (subtle living atmosphere) ── */}
      <div
        className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, var(--accent-surface) 25%, transparent 50%, var(--accent-surface) 75%, transparent 100%)',
          backgroundSize: '400% 400%',
          opacity: 0.04,
        }}
      />

      {/* ── 6. NOISE TEXTURE ──
          Film grain to prevent color banding on high-res screens. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 'var(--noise-opacity)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ── 7. BOTTOM FADE ──
          Vignette that fades the grid/blobs toward the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, var(--bg-base))`,
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
