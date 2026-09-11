/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-out forwards',
        'slideUp': 'slideUp 0.8s ease-out forwards',
        'float': 'float 20s ease-in-out infinite',
        'draw': 'draw 8s ease-in-out infinite',
        'blob': 'blob 12s ease-in-out infinite',
        'blob-slow': 'blob 18s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'toggle-sun': 'toggleSun 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'toggle-moon': 'toggleMoon 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '25%': { transform: 'translateY(-20px) translateX(10px)' },
          '50%': { transform: 'translateY(-10px) translateX(-10px)' },
          '75%': { transform: 'translateY(-30px) translateX(5px)' },
        },
        draw: {
          '0%': { strokeDasharray: '0 1000', strokeDashoffset: '0' },
          '50%': { strokeDasharray: '1000 1000', strokeDashoffset: '0' },
          '100%': { strokeDasharray: '1000 1000', strokeDashoffset: '-1000' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -30px) scale(1.05)' },
          '50%': { transform: 'translate(-15px, 15px) scale(0.95)' },
          '75%': { transform: 'translate(10px, 20px) scale(1.02)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        toggleSun: {
          '0%': { transform: 'rotate(90deg) scale(0)', opacity: '0' },
          '100%': { transform: 'rotate(0) scale(1)', opacity: '1' },
        },
        toggleMoon: {
          '0%': { transform: 'rotate(-90deg) scale(0)', opacity: '0' },
          '100%': { transform: 'rotate(0) scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.animation-delay-1000': { 'animation-delay': '1s' },
        '.animation-delay-2000': { 'animation-delay': '2s' },
        '.animation-delay-3000': { 'animation-delay': '3s' },
        '.animation-delay-4000': { 'animation-delay': '4s' },
        '.animation-delay-5000': { 'animation-delay': '5s' },
      });
    },
  ],
};