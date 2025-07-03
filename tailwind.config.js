/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8E5F0',
          100: '#C3BBD6',
          200: '#9D91BC',
          300: '#7767A3',
          400: '#3A2B61',
          500: '#2C204D', // This is your wallet-bg color
          600: '#251B40',
          700: '#1F1633',
          800: '#181226',
          900: '#100D1A',
          950: '#08060D',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Light Green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        success: {
          500: '#10b981',
        },
        warning: {
          500: '#f59e0b',
        },
        error: {
          500: '#ef4444',
        },
        bottomNav: { // New custom colors for the bottom navigation
          bg: '#2C204D', // Dark purple from image
          active: '#4A3B7A', // Lighter purple for active state
        },
        wallet: {
          bg: '#2C204D', // Dark purple for wallet card
          accent: '#4A3B7A', // Accent color for wallet card
        },
        shop: {
          yellow: '#FFF8E1', // Light yellow background for product cards
          green: '#F1F8E9', // Light green background for product cards
          purple: '#F3E5F5', // Light purple background for product cards
          blue: '#E3F2FD', // Light blue background for product cards
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '80%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};