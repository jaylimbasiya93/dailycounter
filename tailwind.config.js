/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Primary Vibrant Accent (Electric Indigo)
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        surface: {
          light: '#F8FAFC',
          lightCard: '#FFFFFF',
          dark: '#09090B',
          darkCard: '#141417',
          darkBorder: '#27272A',
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#ECFDF5',
          darkBg: '#064E3B',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FFFBEB',
          darkBg: '#78350F',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: '#FEF2F2',
          darkBg: '#7F1D1D',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.04), 0 1px 4px -1px rgba(0, 0, 0, 0.02)',
        'soft-md': '0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 16px 40px -8px rgba(0, 0, 0, 0.08), 0 8px 20px -4px rgba(0, 0, 0, 0.04)',
        'accent-glow': '0 12px 32px -4px rgba(99, 102, 241, 0.35)',
        'floating': '0 20px 48px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
