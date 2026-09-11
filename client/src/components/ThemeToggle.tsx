import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex items-center gap-1 rounded-full p-[3px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1a2e2b 0%, #0f1f1d 100%)'
          : 'linear-gradient(135deg, #e8ece4 0%, #d4ddd0 100%)',
        width: '68px',
        height: '34px',
        boxShadow: isDark
          ? 'inset 0 1px 3px rgba(0,0,0,0.5), 0 0 12px rgba(94,234,212,0.08)'
          : 'inset 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        focusVisibleRingColor: isDark ? 'rgba(94,234,212,0.4)' : 'rgba(13,107,94,0.4)',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track decorations — tiny stars (visible in dark mode) */}
      <span className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
        <span className="absolute top-[8px] left-[10px] h-[2px] w-[2px] rounded-full bg-teal-300/50" />
        <span className="absolute top-[18px] left-[16px] h-[1.5px] w-[1.5px] rounded-full bg-teal-200/40" />
        <span className="absolute top-[12px] left-[24px] h-[1px] w-[1px] rounded-full bg-white/30" />
        <span className="absolute top-[22px] left-[8px] h-[1px] w-[1px] rounded-full bg-teal-400/30" />
      </span>

      {/* Sliding indicator (thumb) */}
      <span
        className="relative z-10 flex h-[28px] w-[28px] items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: isDark ? 'translateX(34px)' : 'translateX(0px)',
          background: isDark
            ? 'linear-gradient(145deg, #1e3a37 0%, #162e2b 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f5f5f0 100%)',
          boxShadow: isDark
            ? '0 2px 8px rgba(0,0,0,0.5), 0 0 12px rgba(94,234,212,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 2px 6px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Sun icon */}
        <Sun
          className={`absolute h-[15px] w-[15px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark
              ? 'rotate-[90deg] scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100 text-amber-500'
          }`}
          strokeWidth={2.5}
        />

        {/* Moon icon */}
        <Moon
          className={`absolute h-[14px] w-[14px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark
              ? 'rotate-0 scale-100 opacity-100 text-teal-300'
              : '-rotate-[90deg] scale-0 opacity-0'
          }`}
          strokeWidth={2.5}
        />
      </span>

      {/* Refined Tooltip */}
      <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-semibold opacity-0 shadow-lg transition-all duration-200 delay-100 group-hover:opacity-100 group-hover:-bottom-10"
        style={{
          backgroundColor: isDark ? '#e4edea' : '#0f1f1b',
          color: isDark ? '#0f1f1b' : '#e4edea',
        }}
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
