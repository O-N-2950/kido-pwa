/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FAFAF7', dark: '#F0EFE8' },
        teal:  { 50: '#F0FDFA', 100: '#CCFBF1', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 900: '#134E4A' },
        amber: { DEFAULT: '#F59E0B', dark: '#D97706' },
        slate: { 50: '#F8FAFC', 100: '#F1F5F9', 800: '#1E293B', 900: '#0F172A' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      boxShadow: {
        'card': '0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
        'teal': '0 4px 24px rgba(13,148,136,0.25)',
      },
    },
  },
  plugins: [],
};
