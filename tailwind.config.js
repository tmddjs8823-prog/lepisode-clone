/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/admin/src/**/*.{html,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        sidebar: {
          bg: '#0f172a',
          hover: '#1e293b',
          active: '#1e40af',
          border: '#1e293b',
          text: '#94a3b8',
          'text-active': '#f1f5f9',
        },
        surface: {
          DEFAULT: '#1e293b',
          2: '#0f172a',
          3: '#334155',
        },
      },
      boxShadow: {
        sidebar: '2px 0 8px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
