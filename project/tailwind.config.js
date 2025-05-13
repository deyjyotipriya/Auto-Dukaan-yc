/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3eafd',
          100: '#e4d0fa',
          200: '#cda3f7',
          300: '#b06df2',
          400: '#9c45ee',
          500: '#8A2BE2', // Primary
          600: '#7115c3',
          700: '#5a109c',
          800: '#430d74',
          900: '#320a56',
          950: '#1d0433',
        },
        secondary: {
          50: '#fff0ee',
          100: '#ffdbd5',
          200: '#ffc0b4',
          300: '#ff9c87',
          400: '#ff7f61',
          500: '#FF6347', // Secondary
          600: '#ed4725',
          700: '#c8391c',
          800: '#a5311b',
          900: '#882e1b',
          950: '#4b150b',
        },
        success: {
          500: '#10B981',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 8px rgba(0, 0, 0, 0.05)',
        dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};