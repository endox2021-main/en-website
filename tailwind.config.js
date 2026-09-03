/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ice: {
          DEFAULT: '#F0F4F8',
          light: '#F8FAFC',
          surface: '#EBF2F8',
          border: '#D6E2EE'
        },
        navy: {
          DEFAULT: '#1A2536',
          heading: '#101724',
          muted: '#5A6B82',
          subtle: '#8C9BAE',
          border: '#CBD7E3'
        },
        cobalt: {
          DEFAULT: '#7000FF',
          hover: '#5D00D6',
          light: 'rgba(112, 0, 255, 0.08)',
          glow: 'rgba(112, 0, 255, 0.25)',
          deep: '#4A00B3'
        },
        purple: {
          DEFAULT: '#7000FF',
          hover: '#5D00D6',
          light: 'rgba(112, 0, 255, 0.08)',
          glow: 'rgba(112, 0, 255, 0.25)',
          deep: '#4A00B3'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Thai"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        thai: ['"Noto Sans Thai"', 'sans-serif']
      },
      letterSpacing: {
        widest: '.2em',
        ultra: '.3em'
      },
      boxShadow: {
        'cobalt-glow': '0 4px 24px rgba(112, 0, 255, 0.25)',
        'cobalt-glow-lg': '0 8px 36px rgba(112, 0, 255, 0.35)',
        'ice-card': '0 4px 20px rgba(26, 37, 54, 0.04)',
        'ice-hover': '0 12px 32px rgba(112, 0, 255, 0.12)'
      }
    },
  },
  plugins: [],
}





