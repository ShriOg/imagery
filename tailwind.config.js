/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        workspace: '#121214',
        studio: {
          dark: '#18181B',
          panel: 'rgba(24, 24, 27, 0.75)',
          floating: 'rgba(32, 32, 36, 0.92)',
          border: 'rgba(63, 63, 70, 0.4)',
          borderLight: 'rgba(255, 255, 255, 0.1)',
        },
        amber: {
          gold: '#F59E0B',
          deep: '#D97706',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
        cream: '#F5F5F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'floating': '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)',
        'canvas': '0 30px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'amber-glow': '0 0 20px -2px rgba(245, 158, 11, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      }
    },
  },
  plugins: [],
};
