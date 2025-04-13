/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f1ff',
          100: '#b3d4ff',
          200: '#80b7ff',
          300: '#4d9aff',
          400: '#1a7dff',
          500: '#0066e6',
          600: '#0052b3',
          700: '#003d80',
          800: '#00294d',
          900: '#00141a',
        },
        secondary: {
          50: '#e6fff2',
          100: '#b3ffdb',
          200: '#80ffc5',
          300: '#4dffae',
          400: '#1aff98',
          500: '#00e680',
          600: '#00b365',
          700: '#00804a',
          800: '#004d2e',
          900: '#001a0f',
        },
        danger: {
          50: '#ffe6e6',
          100: '#ffb3b3',
          200: '#ff8080',
          300: '#ff4d4d',
          400: '#ff1a1a',
          500: '#e60000',
          600: '#b30000',
          700: '#800000',
          800: '#4d0000',
          900: '#1a0000',
        },
        warning: {
          50: '#fff9e6',
          100: '#ffecb3',
          200: '#ffdf80',
          300: '#ffd24d',
          400: '#ffc61a',
          500: '#e6ad00',
          600: '#b38700',
          700: '#806100',
          800: '#4d3a00',
          900: '#1a1400',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
