/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eef9ff',
          100: '#d9f1ff',
          200: '#bce7ff',
          300: '#8ed8ff',
          400: '#59c1ff',
          500: '#33a4fc',
          600: '#1b85f1',
          700: '#146dde',
          800: '#1759b4',
          900: '#194c8e',
          950: '#142f57',
        },
        surface: {
          DEFAULT: '#0a0f1e',
          card:    '#0f1629',
          border:  '#1e2d4a',
          hover:   '#162038',
        },
        accent: {
          cyan:   '#06d6f7',
          purple: '#a855f7',
          amber:  '#f59e0b',
          green:  '#10b981',
          red:    '#ef4444',
        }
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, #1e2d4a 1px, transparent 1px)",
        'hero-glow': "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(51,164,252,0.15), transparent)",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up': 'slideUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.8s ease forwards',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      }
    },
  },
  plugins: [],
}
