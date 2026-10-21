import React from 'react';
import { Trophy } from 'lucide-react';
import './dsa-conquest.css';

export const DSAConquestAnimation: React.FC = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-visible bg-transparent font-sans select-none text-white px-2 py-4">
      {/* ── Ambient Radial Atmosphere Glows ── */}
      <div className="pointer-events-none absolute top-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute top-8 h-40 w-40 rounded-full bg-amber-400/5 blur-[70px]" />

      {/* ── Scaled Mountain Citadel & Golden Star Visual ── */}
      <div className="relative z-10 flex w-full max-w-[680px] flex-col items-center justify-center overflow-visible">
        <svg
          viewBox="0 0 600 330"
          className="h-auto w-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Emerald Mountain Glow Filter */}
            <filter id="emeraldMountainGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Subtle Golden Star Glow Filter */}
            <filter id="goldStarGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Main Center Mountain Fill Gradient */}
            <linearGradient id="mainMountainGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="55%" stopColor="#081410" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#050505" stopOpacity="0.99" />
            </linearGradient>

            {/* Background Mountains Gradient */}
            <linearGradient id="bgMountainGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#060908" stopOpacity="0.95" />
            </linearGradient>

            {/* Soft Golden Halo Radial Gradient */}
            <radialGradient id="goldenHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
              <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#050505" stopOpacity="0" />
            </radialGradient>

            {/* Golden Star Surface Gradient */}
            <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fef08a" />
              <stop offset="70%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Soft Lens Flare Ray Gradient */}
            <linearGradient id="rayGradH" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rayGradV" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ── Background Left Mountain ── */}
          <polygon
            points="50,265 190,135 330,265"
            fill="url(#bgMountainGrad)"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* ── Background Right Mountain ── */}
          <polygon
            points="270,265 410,125 550,265"
            fill="url(#bgMountainGrad)"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* ── Foreground Center Dominant Mountain ── */}
          <polygon
            points="120,265 300,75 480,265"
            fill="url(#mainMountainGrad)"
            stroke="#34d399"
            strokeWidth="2.8"
            strokeLinejoin="round"
            filter="url(#emeraldMountainGlow)"
            className="animate-mountain-glow"
          />

          {/* Center Mountain Ridge Line for Depth */}
          <line
            x1="300"
            y1="75"
            x2="300"
            y2="265"
            stroke="#10b981"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.4"
          />

          {/* ── Rising Golden Micro-Sparks from the Apex ── */}
          <circle cx="295" cy="55" r="1.6" fill="#fef08a" className="animate-star-sparkle-1" />
          <circle cx="306" cy="48" r="1.3" fill="#fbbf24" className="animate-star-sparkle-2" />
          <circle cx="300" cy="40" r="1.9" fill="#ffffff" className="animate-star-sparkle-3" />

          {/* ── Blinking Golden Star at the Apex ── */}
          <g>
            {/* Ambient Golden Radial Halo */}
            <circle
              cx="300"
              cy="72"
              r="24"
              fill="url(#goldenHalo)"
              className="animate-conquest-pulse"
            />

            {/* Delicate Lens Flare Rays */}
            <g className="animate-golden-ray-rotate" style={{ transformOrigin: '300px 72px', opacity: 0.35 }}>
              <line x1="265" y1="72" x2="335" y2="72" stroke="url(#rayGradH)" strokeWidth="1" />
              <line x1="300" y1="37" x2="300" y2="107" stroke="url(#rayGradV)" strokeWidth="1" />
            </g>

            {/* Primary Blinking Golden Star Shape */}
            <g className="animate-golden-star-blink" style={{ transformOrigin: '300px 72px' }}>
              {/* Primary 4-pointed Diamond Star */}
              <polygon
                points="300,48 305,66 323,72 305,78 300,96 295,78 277,72 295,66"
                fill="url(#goldStarGrad)"
                filter="url(#goldStarGlow)"
              />

              {/* Secondary 4-pointed Diagonal Star */}
              <polygon
                points="300,56 304,67 314,72 304,77 300,88 296,77 286,72 296,67"
                fill="#ffffff"
                opacity="0.75"
                transform="rotate(45 300 72)"
              />

              {/* Refined Star Core Center */}
              <circle cx="300" cy="72" r="2.2" fill="#ffffff" />
            </g>
          </g>
        </svg>

        {/* ── Typography Section: DSA CONQUERED ── */}
        <div className="mt-2 sm:mt-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Trophy
              size={26}
              className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]"
            />
            <h2 className="conquest-text-gradient font-mono text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[0.25em] drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              DSA <span className="text-white">CONQUERED</span>
            </h2>
            <Trophy
              size={26}
              className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]"
            />
          </div>

          <p className="mt-2 font-mono text-[11px] sm:text-xs tracking-[0.25em] text-emerald-400/80 uppercase font-semibold">
            MASTER EVERY CONCEPT • CONQUER EVERY CHALLENGE
          </p>
        </div>
      </div>
    </div>
  );
};

export default DSAConquestAnimation;
