import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex h-9 w-9 items-center justify-center rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun Icon (Visible in Light Mode) */}
      <Sun 
        className={`absolute h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isDark 
            ? 'rotate-[90deg] scale-0 opacity-0 text-slate-500' 
            : 'rotate-0 scale-100 opacity-100 text-amber-500'
          }`}
      />

      {/* Moon Icon (Visible in Dark Mode) */}
      <Moon 
        className={`absolute h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isDark 
            ? 'rotate-0 scale-100 opacity-100 text-blue-400' 
            : '-rotate-[90deg] scale-0 opacity-0 text-slate-500'
          }`}
      />
      
      {/* Refined Tooltip (Only visible on hover, centered) */}
      <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity delay-100 duration-200 group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;