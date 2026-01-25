import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Smart Initialization: Check LocalStorage -> Then System Preference -> Default to Dark
  const [isDark, setIsDark] = useState(() => {
    // Check if we are in a browser environment
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      
      // User has an explicit preference saved
      if (saved) {
        return saved === 'dark';
      }
      
      // No saved preference, check OS system settings
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Fallback for non-browser environments (or default)
    return true;
  });

  // 2. Synchronize DOM classes
  // useLayoutEffect runs synchronously immediately after DOM updates but before the browser paints.
  // This prevents the "white flash" glitch on refresh.
  useLayoutEffect(() => {
    const root = window.document.documentElement;
    
    // Clean up classes to avoid conflicts
    root.classList.remove('light', 'dark');
    
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark'; // Helps scrollbars turn dark in supported browsers
    } else {
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // 3. System Preference Listener (Optional Polish)
  // If the user changes their OS theme while browsing, we can listen for it.
  // (Disabled here to avoid overriding user manual toggle, but good to know it exists)

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setIsDark(theme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};