/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0B7A3E',
          50: '#ECFDF3',
          100: '#D1FADF',
          600: '#0B7A3E',
          700: '#086030',
          800: '#064a25',
        },
        leaf: {
          DEFAULT: '#22C55E',
          light: '#4ADE80',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        ink: 'rgb(var(--content) / <alpha-value>)',
        mist: 'rgb(var(--surface-muted) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--line) / <alpha-value>)',
          subtle: 'rgb(var(--line-subtle) / <alpha-value>)',
        },
        content: {
          DEFAULT: 'rgb(var(--content) / <alpha-value>)',
          muted: 'rgb(var(--content-muted) / <alpha-value>)',
          faint: 'rgb(var(--content-faint) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['PT Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(16, 24, 40, 0.06)',
        card: '0 4px 20px rgba(16, 24, 40, 0.08)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'fade-in': 'fade-in 0.4s ease-out' },
    },
  },
  plugins: [],
};
