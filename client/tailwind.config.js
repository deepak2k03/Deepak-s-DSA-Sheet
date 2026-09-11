/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out forwards',
        'slideUp': 'slideUp 0.3s ease-out forwards',
        'toggle-sun': 'toggleSun 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'toggle-moon': 'toggleMoon 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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
    },
  },
  plugins: [],
};