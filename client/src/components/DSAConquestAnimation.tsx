import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './dsa-conquest.css';

interface TopicPanelData {
  id: string;
  step: number;
  label: string;
  cardPos: { x: number; y: number; w: number; h: number };
  pedestal: { cx: number; cy: number; rx: number; ry: number };
  connectionPath: string;
  checkpoint: { x: number; y: number };
  type:
    | 'arrays'
    | 'trees'
    | 'dp'
    | 'graphs'
    | 'greedy'
    | 'sorting'
    | 'heaps'
    | 'linked-lists'
    | 'stacks-queues';
}

// 9 Topic Panels arranged in an expanded, ergonomic ellipse around center (600, 350)
const TOPIC_PANELS: TopicPanelData[] = [
  {
    id: 'arrays-strings',
    step: 0,
    label: 'Arrays & Strings',
    cardPos: { x: 225, y: 105, w: 200, h: 90 },
    pedestal: { cx: 325, cy: 205, rx: 88, ry: 18 },
    connectionPath: 'M 555,320 C 495,265 435,225 380,205',
    checkpoint: { x: 465, y: 260 },
    type: 'arrays',
  },
  {
    id: 'trees',
    step: 1,
    label: 'Trees',
    cardPos: { x: 517, y: 35, w: 166, h: 88 },
    pedestal: { cx: 600, cy: 135, rx: 76, ry: 17 },
    connectionPath: 'M 600,295 C 600,240 600,185 600,132',
    checkpoint: { x: 600, y: 210 },
    type: 'trees',
  },
  {
    id: 'dp',
    step: 2,
    label: 'Dynamic Programming',
    cardPos: { x: 810, y: 80, w: 210, h: 94 },
    pedestal: { cx: 915, cy: 185, rx: 90, ry: 18 },
    connectionPath: 'M 645,320 C 700,265 770,210 855,182',
    checkpoint: { x: 755, y: 240 },
    type: 'dp',
  },
  {
    id: 'graphs',
    step: 3,
    label: 'Graphs',
    cardPos: { x: 880, y: 225, w: 180, h: 92 },
    pedestal: { cx: 970, cy: 325, rx: 82, ry: 18 },
    connectionPath: 'M 685,345 C 750,335 815,310 885,290',
    checkpoint: { x: 790, y: 320 },
    type: 'graphs',
  },
  {
    id: 'greedy',
    step: 4,
    label: 'Greedy Algorithms',
    cardPos: { x: 880, y: 365, w: 190, h: 92 },
    pedestal: { cx: 975, cy: 465, rx: 85, ry: 18 },
    connectionPath: 'M 685,365 C 750,380 815,405 885,425',
    checkpoint: { x: 790, y: 395 },
    type: 'greedy',
  },
  {
    id: 'sorting',
    step: 5,
    label: 'Sorting',
    cardPos: { x: 755, y: 490, w: 180, h: 90 },
    pedestal: { cx: 845, cy: 588, rx: 82, ry: 18 },
    connectionPath: 'M 655,385 C 695,435 740,475 790,505',
    checkpoint: { x: 725, y: 450 },
    type: 'sorting',
  },
  {
    id: 'heaps',
    step: 6,
    label: 'Heaps & Priority Queues',
    cardPos: { x: 495, y: 505, w: 210, h: 100 },
    pedestal: { cx: 600, cy: 612, rx: 92, ry: 19 },
    connectionPath: 'M 600,410 C 600,445 600,480 600,515',
    checkpoint: { x: 600, y: 465 },
    type: 'heaps',
  },
  {
    id: 'linked-lists',
    step: 7,
    label: 'Linked Lists',
    cardPos: { x: 245, y: 475, w: 200, h: 90 },
    pedestal: { cx: 345, cy: 575, rx: 88, ry: 18 },
    connectionPath: 'M 545,385 C 500,430 455,465 405,495',
    checkpoint: { x: 470, y: 445 },
    type: 'linked-lists',
  },
  {
    id: 'stacks-queues',
    step: 8,
    label: 'Stacks & Queues',
    cardPos: { x: 190, y: 295, w: 195, h: 105 },
    pedestal: { cx: 287, cy: 410, rx: 86, ry: 19 },
    connectionPath: 'M 515,350 C 460,350 420,350 385,350',
    checkpoint: { x: 450, y: 350 },
    type: 'stacks-queues',
  },
];

export const DSAConquestAnimation: React.FC = () => {
  const { isDark } = useTheme();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Cycle through all 9 topic panels automatically
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TOPIC_PANELS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Click handler to activate a panel immediately
  const handlePanelClick = useCallback((step: number) => {
    setActiveStep(step);
    setIsPaused(true);
    const timer = setTimeout(() => setIsPaused(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  // Theme-sensitive color palette
  const colors = useMemo(() => {
    if (isDark) {
      return {
        cardBg: 'rgba(5, 20, 16, 0.94)',
        cardBorder: 'rgba(52, 211, 153, 0.38)',
        cardBorderActive: '#34d399',
        cardText: '#ffffff',
        cardTextMuted: '#94a3b8',
        pedestalBg: 'rgba(16, 185, 129, 0.1)',
        pedestalBorder: 'rgba(52, 211, 153, 0.3)',
        beamIdle: 'rgba(16, 185, 129, 0.28)',
        beamActive: '#34d399',
        circuitGrid: 'rgba(52, 211, 153, 0.16)',
        circuitGridSubtle: 'rgba(52, 211, 153, 0.08)',
        coreBaseTop: '#061c14',
        coreBaseSides: '#03100b',
        coreRim: '#10b981',
        corePlate: '#051610',
        coreGlow: 'rgba(16, 185, 129, 0.6)',
        cellBg: 'rgba(6, 26, 19, 0.75)',
        cellBorder: 'rgba(52, 211, 153, 0.35)',
      };
    }
    // Light mode palette
    return {
      cardBg: 'rgba(255, 255, 255, 0.96)',
      cardBorder: '#d1fae5',
      cardBorderActive: '#10b981',
      cardText: '#0f172a',
      cardTextMuted: '#64748b',
      pedestalBg: 'rgba(16, 185, 129, 0.08)',
      pedestalBorder: 'rgba(16, 185, 129, 0.25)',
      beamIdle: 'rgba(16, 185, 129, 0.3)',
      beamActive: '#059669',
      circuitGrid: 'rgba(16, 185, 129, 0.18)',
      circuitGridSubtle: 'rgba(16, 185, 129, 0.09)',
      coreBaseTop: '#e6f4ea',
      coreBaseSides: '#cbd5e1',
      coreRim: '#10b981',
      corePlate: '#ffffff',
      coreGlow: 'rgba(16, 185, 129, 0.35)',
      cellBg: '#f8fafc',
      cellBorder: '#cbd5e1',
    };
  }, [isDark]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-visible bg-transparent select-none px-0 pt-0 pb-2">
      {/* ── Ambient Radial Atmosphere Volumetric Glows (Utilizing Page Space) ── */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[680px] w-[680px] rounded-full bg-emerald-500/18 blur-[160px] dark:bg-emerald-500/14" />
      <div className="pointer-events-none absolute right-4 top-10 h-[400px] w-[400px] rounded-full bg-teal-500/14 blur-[140px] dark:bg-teal-500/10" />
      <div className="pointer-events-none absolute left-4 bottom-10 h-[380px] w-[380px] rounded-full bg-emerald-600/14 blur-[140px] dark:bg-emerald-600/10" />

      <div className="relative z-10 w-full max-w-[1360px] overflow-visible">
        <svg
          viewBox="0 0 1200 700"
          className="h-auto w-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Futuristic DSA Mastery Core: Interactive central engine and connected DSA topic universe"
        >
          <defs>
            {/* Core Intense Neon Glow Filter */}
            <filter id="neonCoreGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Beam Glow Filter */}
            <filter id="neonBeamGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft Ambient Node Glow */}
            <filter id="softNodeGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Central Platform Radial Light Pool */}
            <radialGradient id="coreLightPool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity={isDark ? 0.8 : 0.6} />
              <stop offset="42%" stopColor="#10b981" stopOpacity={isDark ? 0.38 : 0.28} />
              <stop offset="80%" stopColor="#042318" stopOpacity={isDark ? 0.12 : 0.05} />
              <stop offset="100%" stopColor="#050505" stopOpacity="0" />
            </radialGradient>

            {/* Isometric Platform Top Surface Gradient */}
            <linearGradient id="corePlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#08251a' : '#ffffff'} />
              <stop offset="50%" stopColor={isDark ? '#051912' : '#f0fdf4'} />
              <stop offset="100%" stopColor={isDark ? '#020b07' : '#dcfce7'} />
            </linearGradient>

            {/* Central Core Symbol Badge Gradient */}
            <linearGradient id="coreBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* ══════════════════════════════════════════════════════════════
              BACKGROUND FLOOR CONCENTRIC CIRCUIT TRACKS & RADAR GRID
              ══════════════════════════════════════════════════════════════ */}
          <g className="pointer-events-none">
            {/* Outer Wide Boundary Track */}
            <ellipse cx="600" cy="350" rx="630" ry="315" fill="none" stroke={colors.circuitGridSubtle} strokeWidth="1" strokeDasharray="4 8" />
            {/* 4 Concentric Floor Ellipses around Center (600, 350) */}
            <ellipse cx="600" cy="350" rx="530" ry="265" fill="none" stroke={colors.circuitGrid} strokeWidth="1" strokeDasharray="8 10" />
            <ellipse cx="600" cy="350" rx="420" ry="210" fill="none" stroke={colors.circuitGrid} strokeWidth="1.2" strokeDasharray="12 6" />
            <ellipse cx="600" cy="350" rx="290" ry="145" fill="none" stroke={colors.circuitGrid} strokeWidth="1.5" strokeDasharray="6 6" />
            <ellipse cx="600" cy="350" rx="180" ry="90" fill="none" stroke="#10b981" strokeWidth="1.8" strokeOpacity="0.45" />

            {/* Horizontal & Diagonal Floor Grid Axes (Tactical Holo-Table) */}
            <line x1="70" y1="350" x2="1130" y2="350" stroke={colors.circuitGridSubtle} strokeWidth="1" strokeDasharray="4 6" />
            <line x1="600" y1="40" x2="600" y2="660" stroke={colors.circuitGridSubtle} strokeWidth="1" strokeDasharray="4 6" />

            {/* Radial Calibration Ticks & Holo-Coordinates on Track Boundaries */}
            <circle cx="70" cy="350" r="3" fill="#34d399" opacity="0.75" />
            <circle cx="1130" cy="350" r="3" fill="#34d399" opacity="0.75" />
            <circle cx="600" cy="40" r="3" fill="#34d399" opacity="0.75" />
            <circle cx="600" cy="660" r="3" fill="#34d399" opacity="0.75" />

            <circle cx="180" cy="350" r="2.5" fill="#10b981" opacity="0.5" />
            <circle cx="1020" cy="350" r="2.5" fill="#10b981" opacity="0.5" />
            <circle cx="600" cy="140" r="2.5" fill="#10b981" opacity="0.5" />
            <circle cx="600" cy="560" r="2.5" fill="#10b981" opacity="0.5" />

            {/* ── Corner Cybernetic Bus Lines (Utilizing empty screen corners) ── */}
            {/* Top-Left Corner Bus */}
            <path d="M 60,60 L 150,60 L 200,105" fill="none" stroke={colors.circuitGrid} strokeWidth="1.2" strokeDasharray="6 4" />
            <circle cx="60" cy="60" r="3.5" fill="#10b981" opacity="0.7" />
            <circle cx="200" cy="105" r="2.5" fill="#34d399" opacity="0.8" />

            {/* Top-Right Corner Bus */}
            <path d="M 1140,60 L 1050,60 L 1000,105" fill="none" stroke={colors.circuitGrid} strokeWidth="1.2" strokeDasharray="6 4" />
            <circle cx="1140" cy="60" r="3.5" fill="#10b981" opacity="0.7" />
            <circle cx="1000" cy="105" r="2.5" fill="#34d399" opacity="0.8" />

            {/* Bottom-Left Corner Bus */}
            <path d="M 60,640 L 150,640 L 210,585" fill="none" stroke={colors.circuitGrid} strokeWidth="1.2" strokeDasharray="6 4" />
            <circle cx="60" cy="640" r="3.5" fill="#10b981" opacity="0.7" />
            <circle cx="210" cy="585" r="2.5" fill="#34d399" opacity="0.8" />

            {/* Bottom-Right Corner Bus */}
            <path d="M 1140,640 L 1050,640 L 990,585" fill="none" stroke={colors.circuitGrid} strokeWidth="1.2" strokeDasharray="6 4" />
            <circle cx="1140" cy="640" r="3.5" fill="#10b981" opacity="0.7" />
            <circle cx="990" cy="585" r="2.5" fill="#34d399" opacity="0.8" />
          </g>

          {/* ══════════════════════════════════════════════════════════════
              AMBIENT HOLOGRAPHIC DATA PARTICLES & STAR DUST
              ══════════════════════════════════════════════════════════════ */}
          <g className="pointer-events-none">
            {/* Shimmering micro-particles floating in deep space */}
            <circle cx="160" cy="180" r="2" fill="#34d399" className="animate-particle-shimmer" style={{ animationDelay: '0.2s' }} />
            <polygon points="260,60 263,63 260,66 257,63" fill="#6ee7b7" className="animate-particle-shimmer" style={{ animationDelay: '1.2s' }} />
            <circle cx="460" cy="70" r="1.8" fill="#34d399" className="animate-particle-shimmer" style={{ animationDelay: '0.7s' }} />
            <circle cx="740" cy="50" r="2.2" fill="#6ee7b7" className="animate-particle-shimmer" style={{ animationDelay: '2.1s' }} />
            <polygon points="1040,160 1043,163 1040,166 1037,163" fill="#34d399" className="animate-particle-shimmer" style={{ animationDelay: '1.8s' }} />
            <circle cx="1110,420" r="2" fill="#10b981" className="animate-particle-shimmer" style={{ animationDelay: '0.9s' }} />
            <polygon points="980,630 983,633 980,636 977,633" fill="#6ee7b7" className="animate-particle-shimmer" style={{ animationDelay: '1.4s' }} />
            <circle cx="730" cy="640" r="2" fill="#34d399" className="animate-particle-shimmer" style={{ animationDelay: '2.5s' }} />
            <circle cx="470" cy="640" r="1.8" fill="#6ee7b7" className="animate-particle-shimmer" style={{ animationDelay: '0.4s' }} />
            <polygon points="190,560 193,563 190,566 187,563" fill="#34d399" className="animate-particle-shimmer" style={{ animationDelay: '1.9s' }} />
            <circle cx="120" cy="450" r="2.2" fill="#6ee7b7" className="animate-particle-shimmer" style={{ animationDelay: '1.1s' }} />
            <circle cx="140" cy="260" r="1.8" fill="#34d399" className="animate-particle-shimmer" style={{ animationDelay: '0.6s' }} />
          </g>

          {/* ══════════════════════════════════════════════════════════════
              CARD 3D PEDESTALS / BASE SHADOWS (ON FLOOR PLANE)
              ══════════════════════════════════════════════════════════════ */}
          {TOPIC_PANELS.map((p) => {
            const isActive = activeStep === p.step;
            return (
              <g key={`pedestal-${p.id}`} className="pointer-events-none">
                <ellipse
                  cx={p.pedestal.cx}
                  cy={p.pedestal.cy}
                  rx={p.pedestal.rx}
                  ry={p.pedestal.ry}
                  fill={colors.pedestalBg}
                  stroke={isActive ? colors.cardBorderActive : colors.pedestalBorder}
                  strokeWidth={isActive ? 1.8 : 1}
                  className="transition-colors duration-300"
                />
              </g>
            );
          })}

          {/* ══════════════════════════════════════════════════════════════
              RADIAL EMERALD BEAMS (CONNECTING CORE TO 9 CARDS)
              ══════════════════════════════════════════════════════════════ */}
          {TOPIC_PANELS.map((p) => {
            const isActive = activeStep === p.step;
            return (
              <g key={`beam-group-${p.id}`}>
                {/* Base beam path */}
                <path
                  d={p.connectionPath}
                  fill="none"
                  stroke={isActive ? colors.beamActive : colors.beamIdle}
                  strokeWidth={isActive ? 3 : 1.6}
                  strokeLinecap="round"
                  filter={isActive ? 'url(#neonBeamGlow)' : undefined}
                  className={isActive ? 'animate-beam-flow transition-all duration-300' : 'transition-all duration-300'}
                  strokeDasharray={isActive ? '8 6' : 'none'}
                />

                {/* Checkpoint Node along connection */}
                <circle
                  cx={p.checkpoint.x}
                  cy={p.checkpoint.y}
                  r={isActive ? 6 : 3.5}
                  fill={isActive ? '#34d399' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive ? 'url(#neonBeamGlow)' : undefined}
                />

                {/* Traveling photon on active beam */}
                {isActive && (
                  <circle r="4.5" fill="#ffffff" filter="url(#neonBeamGlow)" className="animate-photon-glow">
                    <animateMotion
                      dur="2.4s"
                      repeatCount="indefinite"
                      path={p.connectionPath}
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* ══════════════════════════════════════════════════════════════
              CENTRAL ISOMETRIC CODE ENGINE PLATFORM (THE CORE)
              Center coordinate: (600, 350)
              ══════════════════════════════════════════════════════════════ */}
          <g
            className="animate-core-float cursor-pointer"
            onClick={() => setActiveStep((prev) => (prev + 1) % TOPIC_PANELS.length)}
            role="button"
            tabIndex={0}
            aria-label="DSA Code Core Engine: Click to cycle active topic"
          >
            {/* Ambient Base Light Pool */}
            <ellipse
              cx="600"
              cy="355"
              rx="185"
              ry="92"
              fill="url(#coreLightPool)"
              className="animate-core-pulse-ring pointer-events-none"
            />

            {/* Central Platform 3D Lower Base Thickness (Drop Side Facets) */}
            <g>
              {/* Left drop facet */}
              <polygon
                points="470,345 600,400 600,432 470,377"
                fill={colors.coreBaseSides}
                stroke={colors.coreRim}
                strokeWidth="1.2"
                strokeOpacity="0.75"
              />
              {/* Right drop facet */}
              <polygon
                points="600,400 730,345 730,377 600,432"
                fill={isDark ? '#020a06' : '#94a3b8'}
                stroke={colors.coreRim}
                strokeWidth="1.2"
                strokeOpacity="0.75"
              />
            </g>

            {/* Radiant Glowing Neon Emerald Bevel Band */}
            <path
              d="M 470,345 Q 600,405 730,345"
              fill="none"
              stroke="#34d399"
              strokeWidth="3.6"
              strokeLinecap="round"
              filter="url(#neonCoreGlow)"
            />

            {/* Platform Top Surface Plate (Rounded Isometric Diamond) */}
            <path
              d="M 600,295 C 622,295 720,332 728,342 C 736,352 622,395 600,395 C 578,395 464,352 472,342 C 480,332 578,295 600,295 Z"
              fill="url(#corePlateGrad)"
              stroke="#10b981"
              strokeWidth="2.2"
            />

            {/* Inner Concentric Glowing Circuit Border */}
            <path
              d="M 600,307 C 616,307 695,335 700,343 C 705,351 616,383 600,383 C 584,383 505,351 510,343 C 515,335 584,307 600,307 Z"
              fill="none"
              stroke="#34d399"
              strokeWidth="1.4"
              strokeDasharray="16 7"
              opacity="0.85"
            />

            {/* Central Elevated Glowing Code Symbol Badge */}
            <g transform="translate(0, 0)">
              {/* Badge Platform Shadow/Glow */}
              <ellipse
                cx="600"
                cy="343"
                rx="58"
                ry="28"
                fill="#34d399"
                filter="url(#neonCoreGlow)"
                opacity="0.65"
              />

              {/* Badge Raised Surface */}
              <path
                d="M 600,320 C 612,320 655,335 660,342 C 665,349 612,367 600,367 C 588,367 535,349 540,342 C 545,335 588,320 600,320 Z"
                fill={isDark ? '#020d08' : '#ffffff'}
                stroke="#34d399"
                strokeWidth="2.2"
              />

              {/* Glowing </> Code Icon Symbol */}
              <text
                x="600"
                y="349"
                fill="#ffffff"
                fontFamily="DM Mono, monospace, system-ui"
                fontSize="22"
                fontWeight="900"
                textAnchor="middle"
                style={{
                  filter: 'drop-shadow(0 0 10px #34d399) drop-shadow(0 0 20px #10b981)',
                }}
              >
                &lt;/&gt;
              </text>
            </g>
          </g>

          {/* ══════════════════════════════════════════════════════════════
              THE 9 TOPIC PANELS WITH RICH INTERNAL DATA VISUALIZATIONS
              ══════════════════════════════════════════════════════════════ */}

          {/* ── CARD 0: ARRAYS & STRINGS (TOP-LEFT) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 0 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(0)}
          >
            <rect
              x={TOPIC_PANELS[0].cardPos.x}
              y={TOPIC_PANELS[0].cardPos.y}
              width={TOPIC_PANELS[0].cardPos.w}
              height={TOPIC_PANELS[0].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 0 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 0 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header Icon + Label */}
            <rect x="237" y="116" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <text x="247" y="131" fill="#34d399" fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">[ ]</text>
            <text x="265" y="131" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Arrays & Strings
            </text>

            {/* Array Cells Visualization: [ 4 | 8 | 1 | 1 | 6 | 2 ] */}
            <g transform="translate(237, 147)">
              <rect x="0" y="0" width="25" height="25" rx="5" fill={colors.cellBg} stroke={colors.cellBorder} strokeWidth="1" />
              <text x="12.5" y="17.5" fill={colors.cardText} fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">4</text>

              <rect x="29" y="0" width="25" height="25" rx="5" fill={colors.cellBg} stroke={colors.cellBorder} strokeWidth="1" />
              <text x="41.5" y="17.5" fill={colors.cardText} fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">8</text>

              <rect x="58" y="0" width="25" height="25" rx="5" fill={colors.cellBg} stroke={colors.cellBorder} strokeWidth="1" />
              <text x="70.5" y="17.5" fill={colors.cardText} fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">1</text>

              {/* Highlighted active element in solid vibrant emerald */}
              <rect x="87" y="0" width="25" height="25" rx="5" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
              <text x="99.5" y="17.5" fill="#ffffff" fontFamily="monospace" fontSize="12.5" fontWeight="900" textAnchor="middle">1</text>

              <rect x="116" y="0" width="25" height="25" rx="5" fill={colors.cellBg} stroke={colors.cellBorder} strokeWidth="1" />
              <text x="128.5" y="17.5" fill={colors.cardText} fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">6</text>

              <rect x="145" y="0" width="25" height="25" rx="5" fill={colors.cellBg} stroke={colors.cellBorder} strokeWidth="1" />
              <text x="157.5" y="17.5" fill={colors.cardText} fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">2</text>
            </g>
          </g>

          {/* ── CARD 1: TREES (TOP-CENTER) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 1 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(1)}
          >
            <rect
              x={TOPIC_PANELS[1].cardPos.x}
              y={TOPIC_PANELS[1].cardPos.y}
              width={TOPIC_PANELS[1].cardPos.w}
              height={TOPIC_PANELS[1].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 1 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 1 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header */}
            <rect x="529" y="44" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <circle cx="539" cy="51" r="2.5" fill="#34d399" />
            <line x1="539" y1="53.5" x2="535" y2="58" stroke="#34d399" strokeWidth="1" />
            <line x1="539" y1="53.5" x2="543" y2="58" stroke="#34d399" strokeWidth="1" />
            <text x="557" y="59" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Trees
            </text>

            {/* Complete Binary Tree Visualization (7 Nodes) */}
            <g transform="translate(527, 68)">
              {/* Branch connecting lines */}
              <line x1="73" y1="8" x2="45" y2="25" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.85" />
              <line x1="73" y1="8" x2="101" y2="25" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.85" />

              <line x1="45" y1="25" x2="31" y2="42" stroke="#10b981" strokeWidth="1" strokeOpacity="0.65" />
              <line x1="45" y1="25" x2="59" y2="42" stroke="#10b981" strokeWidth="1" strokeOpacity="0.65" />
              <line x1="101" y1="25" x2="87" y2="42" stroke="#10b981" strokeWidth="1" strokeOpacity="0.65" />
              <line x1="101" y1="25" x2="115" y2="42" stroke="#10b981" strokeWidth="1" strokeOpacity="0.65" />

              {/* Root node (level 0) - Glowing emerald */}
              <circle cx="73" cy="8" r="6.5" fill="#10b981" stroke="#34d399" strokeWidth="1.4" filter="url(#neonCoreGlow)" />
              <text x="73" y="11" fill="#ffffff" fontFamily="monospace" fontSize="8" fontWeight="800" textAnchor="middle">1</text>

              {/* Level 1 nodes */}
              <circle cx="45" cy="25" r="5" fill="#042318" stroke="#10b981" strokeWidth="1.2" />
              <circle cx="101" cy="25" r="5" fill="#042318" stroke="#10b981" strokeWidth="1.2" />

              {/* Level 2 leaf nodes */}
              <circle cx="31" cy="42" r="4" fill="#03150f" stroke="#34d399" strokeWidth="1" />
              <circle cx="59" cy="42" r="4" fill="#03150f" stroke="#34d399" strokeWidth="1" />
              <circle cx="87" cy="42" r="4" fill="#03150f" stroke="#34d399" strokeWidth="1" />
              <circle cx="115" cy="42" r="4" fill="#03150f" stroke="#34d399" strokeWidth="1" />
            </g>
          </g>

          {/* ── CARD 2: DYNAMIC PROGRAMMING (TOP-RIGHT) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 2 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(2)}
          >
            <rect
              x={TOPIC_PANELS[2].cardPos.x}
              y={TOPIC_PANELS[2].cardPos.y}
              width={TOPIC_PANELS[2].cardPos.w}
              height={TOPIC_PANELS[2].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 2 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 2 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header */}
            <rect x="822" y="90" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <rect x="827" y="95" width="4" height="4" fill="#34d399" />
            <rect x="833" y="95" width="4" height="4" fill="#10b981" />
            <rect x="827" y="101" width="4" height="4" fill="#10b981" />
            <rect x="833" y="101" width="4" height="4" fill="#34d399" />
            <text x="850" y="105" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Dynamic Programming
            </text>

            {/* Memoization Matrix Table (4 rows x 5 columns) */}
            <g transform="translate(822, 120)">
              {/* Row 0 */}
              <rect x="0" y="0" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="21" y="0" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="42" y="0" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="63" y="0" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="84" y="0" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />

              {/* Row 1 */}
              <rect x="0" y="11" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="21" y="11" width="18" height="9" rx="2" fill="#10b981" stroke="#34d399" strokeWidth="1" />
              <rect x="42" y="11" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="63" y="11" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="84" y="11" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />

              {/* Row 2 */}
              <rect x="0" y="22" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="21" y="22" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="42" y="22" width="18" height="9" rx="2" fill="#10b981" stroke="#34d399" strokeWidth="1" />
              <rect x="63" y="22" width="18" height="9" rx="2" fill="#10b981" stroke="#34d399" strokeWidth="1" />
              <rect x="84" y="22" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />

              {/* Row 3 - Highlighted optimal result cell */}
              <rect x="0" y="33" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="21" y="33" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="42" y="33" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="63" y="33" width="18" height="9" rx="2" fill="#062217" stroke="#10b981" strokeWidth="0.8" />
              <rect x="84" y="33" width="18" height="9" rx="2" fill="#34d399" stroke="#ffffff" strokeWidth="1.2" filter="url(#neonCoreGlow)" />
            </g>
          </g>

          {/* ── CARD 3: GRAPHS (MID-RIGHT) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 3 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(3)}
          >
            <rect
              x={TOPIC_PANELS[3].cardPos.x}
              y={TOPIC_PANELS[3].cardPos.y}
              width={TOPIC_PANELS[3].cardPos.w}
              height={TOPIC_PANELS[3].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 3 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 3 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header */}
            <rect x="892" y="234" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <circle cx="899" cy="241" r="2.5" fill="#34d399" />
            <circle cx="905" cy="247" r="2" fill="#10b981" />
            <line x1="899" y1="241" x2="905" y2="247" stroke="#34d399" strokeWidth="1" />
            <text x="920" y="249" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Graphs
            </text>

            {/* Network Graph Visualization */}
            <g transform="translate(895, 260)">
              {/* Edges */}
              <line x1="20" y1="22" x2="52" y2="10" stroke="#10b981" strokeWidth="1.2" />
              <line x1="52" y1="10" x2="90" y2="20" stroke="#10b981" strokeWidth="1.2" />
              <line x1="20" y1="22" x2="52" y2="38" stroke="#10b981" strokeWidth="1.2" />
              <line x1="52" y1="38" x2="90" y2="20" stroke="#10b981" strokeWidth="1.2" />
              <line x1="52" y1="10" x2="52" y2="38" stroke="#34d399" strokeWidth="1.4" strokeDasharray="3 2" />

              {/* Vertices */}
              <circle cx="20" cy="22" r="5" fill="#042318" stroke="#10b981" strokeWidth="1.2" />
              <circle cx="90" cy="20" r="5" fill="#042318" stroke="#10b981" strokeWidth="1.2" />
              <circle cx="52" cy="38" r="5" fill="#042318" stroke="#10b981" strokeWidth="1.2" />

              {/* Central highlighted vertex */}
              <circle cx="52" cy="10" r="7" fill="#10b981" stroke="#34d399" strokeWidth="1.5" filter="url(#neonCoreGlow)" />
              <text x="52" y="13.5" fill="#ffffff" fontFamily="monospace" fontSize="8.5" fontWeight="900" textAnchor="middle">1</text>
            </g>
          </g>

          {/* ── CARD 4: GREEDY ALGORITHMS (LOWER-RIGHT) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 4 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(4)}
          >
            <rect
              x={TOPIC_PANELS[4].cardPos.x}
              y={TOPIC_PANELS[4].cardPos.y}
              width={TOPIC_PANELS[4].cardPos.w}
              height={TOPIC_PANELS[4].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 4 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 4 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header */}
            <rect x="892" y="374" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <path d="M 897,389 L 902,383 L 907,379" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
            <text x="920" y="389" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Greedy Algorithms
            </text>

            {/* Ascending Greedy Bars with Upward Optimization Trajectory */}
            <g transform="translate(895, 404)">
              <rect x="0" y="26" width="13" height="12" rx="3" fill="#042318" stroke="#10b981" strokeWidth="1" />
              <rect x="18" y="20" width="13" height="18" rx="3" fill="#063222" stroke="#10b981" strokeWidth="1" />
              <rect x="36" y="13" width="13" height="25" rx="3" fill="#09452f" stroke="#10b981" strokeWidth="1" />
              <rect x="54" y="6" width="13" height="32" rx="3" fill="#0d5a3d" stroke="#34d399" strokeWidth="1.2" />
              {/* Max Greedy choice bar (radiant neon) */}
              <rect x="72" y="0" width="13" height="38" rx="3" fill="#10b981" stroke="#6ee7b7" strokeWidth="1.5" filter="url(#neonCoreGlow)" />

              {/* Upward curved trajectory line */}
              <path d="M 5,22 Q 40,16 78, -3" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="78,-3 73,-1 75,-6" fill="#34d399" />
            </g>
          </g>

          {/* ── CARD 5: SORTING (BOTTOM-RIGHT) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 5 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(5)}
          >
            <rect
              x={TOPIC_PANELS[5].cardPos.x}
              y={TOPIC_PANELS[5].cardPos.y}
              width={TOPIC_PANELS[5].cardPos.w}
              height={TOPIC_PANELS[5].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 5 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 5 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header */}
            <rect x="767" y="499" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <line x1="772" y1="513" x2="772" y2="509" stroke="#34d399" strokeWidth="1.5" />
            <line x1="776" y1="513" x2="776" y2="505" stroke="#34d399" strokeWidth="1.5" />
            <line x1="780" y1="513" x2="780" y2="501" stroke="#34d399" strokeWidth="1.5" />
            <text x="795" y="514" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Sorting
            </text>

            {/* Stepped Sorted Bars */}
            <g transform="translate(767, 529)">
              <rect x="0" y="24" width="18" height="13" rx="4" fill="#042318" stroke="#10b981" strokeWidth="1" />
              <rect x="24" y="17" width="18" height="20" rx="4" fill="#063222" stroke="#10b981" strokeWidth="1" />
              <rect x="48" y="9" width="18" height="28" rx="4" fill="#09452f" stroke="#10b981" strokeWidth="1" />
              {/* Highlighted sorted pinnacle */}
              <rect x="72" y="0" width="18" height="37" rx="4" fill="#10b981" stroke="#6ee7b7" strokeWidth="1.5" filter="url(#neonCoreGlow)" />
            </g>
          </g>

          {/* ── CARD 6: HEAPS & PRIORITY QUEUES (BOTTOM-CENTER) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 6 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(6)}
          >
            <rect
              x={TOPIC_PANELS[6].cardPos.x}
              y={TOPIC_PANELS[6].cardPos.y}
              width={TOPIC_PANELS[6].cardPos.w}
              height={TOPIC_PANELS[6].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 6 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 6 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header */}
            <rect x="507" y="514" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <polygon points="517,519 523,529 511,529" fill="none" stroke="#34d399" strokeWidth="1.2" />
            <text x="535" y="529" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Heaps & Priority Queues
            </text>

            {/* Binary Heap Tree Visualization */}
            <g transform="translate(505, 540)">
              <line x1="88" y1="8" x2="56" y2="26" stroke="#10b981" strokeWidth="1.2" />
              <line x1="88" y1="8" x2="120" y2="26" stroke="#10b981" strokeWidth="1.2" />
              <line x1="56" y1="26" x2="40" y2="44" stroke="#10b981" strokeWidth="1" />
              <line x1="56" y1="26" x2="72" y2="44" stroke="#10b981" strokeWidth="1" />
              <line x1="120" y1="26" x2="104" y2="44" stroke="#10b981" strokeWidth="1" />
              <line x1="120" y1="26" x2="136" y2="44" stroke="#10b981" strokeWidth="1" />

              {/* Min-Heap Root */}
              <circle cx="88" cy="8" r="7" fill="#10b981" stroke="#34d399" strokeWidth="1.5" filter="url(#neonCoreGlow)" />
              <text x="88" y="11.5" fill="#ffffff" fontFamily="monospace" fontSize="8.5" fontWeight="900" textAnchor="middle">1</text>

              <circle cx="56" cy="26" r="5" fill="#042318" stroke="#10b981" strokeWidth="1.2" />
              <circle cx="120" cy="26" r="5" fill="#042318" stroke="#10b981" strokeWidth="1.2" />

              <circle cx="40" cy="44" r="4" fill="#03150f" stroke="#34d399" strokeWidth="1" />
              <circle cx="72" cy="44" r="4" fill="#03150f" stroke="#34d399" strokeWidth="1" />
              <circle cx="104" cy="44" r="4" fill="#03150f" stroke="#34d399" strokeWidth="1" />
              <circle cx="136" cy="44" r="4" fill="#03150f" stroke="#34d399" strokeWidth="1" />
            </g>
          </g>

          {/* ── CARD 7: LINKED LISTS (BOTTOM-LEFT) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 7 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(7)}
          >
            <rect
              x={TOPIC_PANELS[7].cardPos.x}
              y={TOPIC_PANELS[7].cardPos.y}
              width={TOPIC_PANELS[7].cardPos.w}
              height={TOPIC_PANELS[7].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 7 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 7 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header */}
            <rect x="257" y="484" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <circle cx="262" cy="494" r="2.5" fill="#34d399" />
            <line x1="265" y1="494" x2="271" y2="494" stroke="#34d399" strokeWidth="1.2" />
            <circle cx="272" cy="494" r="2.5" fill="#10b981" />
            <text x="285" y="499" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Linked Lists
            </text>

            {/* Linked Nodes: [ 1 ] -> [ 2 ] -> [ 3 ] -> [ 4 ] */}
            <g transform="translate(257, 516)">
              {/* Node 1 */}
              <rect x="0" y="0" width="26" height="25" rx="5" fill={colors.cellBg} stroke={colors.cellBorder} strokeWidth="1" />
              <text x="13" y="17.5" fill={colors.cardText} fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">1</text>

              <line x1="29" y1="12.5" x2="43" y2="12.5" stroke="#10b981" strokeWidth="1.5" />
              <polyline points="40,9.5 43,12.5 40,15.5" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

              {/* Node 2 - Highlighted solid emerald */}
              <rect x="46" y="0" width="26" height="25" rx="5" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
              <text x="59" y="17.5" fill="#ffffff" fontFamily="monospace" fontSize="12.5" fontWeight="900" textAnchor="middle">2</text>

              <line x1="75" y1="12.5" x2="89" y2="12.5" stroke="#10b981" strokeWidth="1.5" />
              <polyline points="86,9.5 89,12.5 86,15.5" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

              {/* Node 3 */}
              <rect x="92" y="0" width="26" height="25" rx="5" fill={colors.cellBg} stroke={colors.cellBorder} strokeWidth="1" />
              <text x="105" y="17.5" fill={colors.cardText} fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">3</text>

              <line x1="121" y1="12.5" x2="135" y2="12.5" stroke="#10b981" strokeWidth="1.5" />
              <polyline points="132,9.5 135,12.5 132,15.5" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

              {/* Node 4 */}
              <rect x="138" y="0" width="26" height="25" rx="5" fill={colors.cellBg} stroke={colors.cellBorder} strokeWidth="1" />
              <text x="151" y="17.5" fill={colors.cardText} fontFamily="monospace" fontSize="12" fontWeight="700" textAnchor="middle">4</text>
            </g>
          </g>

          {/* ── CARD 8: STACKS & QUEUES (MID-LEFT) ── */}
          <g
            className={`cursor-pointer transition-transform duration-300 ${
              activeStep === 8 ? 'animate-card-active' : 'hover:opacity-100 opacity-95'
            }`}
            onClick={() => handlePanelClick(8)}
          >
            <rect
              x={TOPIC_PANELS[8].cardPos.x}
              y={TOPIC_PANELS[8].cardPos.y}
              width={TOPIC_PANELS[8].cardPos.w}
              height={TOPIC_PANELS[8].cardPos.h}
              rx="12"
              fill={colors.cardBg}
              stroke={activeStep === 8 ? colors.cardBorderActive : colors.cardBorder}
              strokeWidth={activeStep === 8 ? 2 : 1}
              className="transition-colors duration-300"
            />
            {/* Header */}
            <rect x="202" y="305" width="20" height="20" rx="5" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="1" />
            <ellipse cx="212" cy="311" rx="5.5" ry="2" fill="none" stroke="#34d399" strokeWidth="1.2" />
            <ellipse cx="212" cy="316" rx="5.5" ry="2" fill="none" stroke="#34d399" strokeWidth="1.2" />
            <text x="230" y="320" fill={colors.cardText} fontFamily="Manrope, system-ui, sans-serif" fontSize="13" fontWeight="700">
              Stacks & Queues
            </text>

            {/* Body: Left side 3D Stack */}
            <g transform="translate(205, 332)">
              <ellipse cx="22" cy="46" rx="18" ry="6" fill="#042318" stroke="#059669" strokeWidth="1.2" />
              <path d="M 4,40 v 6 c 0,3.5 8,6 18,6 s 18,-2.5 18,-6 v -6" fill="#042318" stroke="#059669" strokeWidth="1.2" />
              <ellipse cx="22" cy="40" rx="18" ry="6" fill="#063222" stroke="#10b981" strokeWidth="1.2" />

              <path d="M 4,28 v 6 c 0,3.5 8,6 18,6 s 18,-2.5 18,-6 v -6" fill="#08422d" stroke="#10b981" strokeWidth="1.2" />
              <ellipse cx="22" cy="28" rx="18" ry="6" fill="#0a5238" stroke="#34d399" strokeWidth="1.2" />

              <path d="M 4,16 v 6 c 0,3.5 8,6 18,6 s 18,-2.5 18,-6 v -6" fill="#0d6545" stroke="#34d399" strokeWidth="1.2" />
              <ellipse cx="22" cy="16" rx="18" ry="6" fill="#10b981" stroke="#6ee7b7" strokeWidth="1.5" filter="url(#neonCoreGlow)" />
            </g>

            {/* Body: Right side 4 Micro Action Pills */}
            <g transform="translate(295, 335)">
              <rect x="0" y="0" width="56" height="11.5" rx="3.5" fill="rgba(16, 185, 129, 0.16)" stroke="#10b981" strokeWidth="0.9" />
              <text x="28" y="9" fill="#34d399" fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">Push</text>

              <rect x="0" y="14.5" width="56" height="11.5" rx="3.5" fill="rgba(16, 185, 129, 0.16)" stroke="#10b981" strokeWidth="0.9" />
              <text x="28" y="23.5" fill="#34d399" fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">Pop</text>

              <rect x="0" y="29" width="56" height="11.5" rx="3.5" fill="rgba(16, 185, 129, 0.16)" stroke="#10b981" strokeWidth="0.9" />
              <text x="28" y="38" fill="#34d399" fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">Front</text>

              <rect x="0" y="43.5" width="56" height="11.5" rx="3.5" fill="rgba(16, 185, 129, 0.16)" stroke="#10b981" strokeWidth="0.9" />
              <text x="28" y="52.5" fill="#34d399" fontFamily="Manrope, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">Back</text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default DSAConquestAnimation;
