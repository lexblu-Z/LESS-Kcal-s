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
        dark: {
          bg: '#09090B',
          card: '#121216',
          cardHover: '#18181B',
          border: '#27272A',
          muted: '#71717A',
          text: '#FAFAFA',
          subtext: '#A1A1AA'
        },
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95'
        },
        macro: {
          protein: '#C084FC',
          proteinBg: 'rgba(192, 132, 252, 0.15)',
          carbs: '#38BDF8',
          carbsBg: 'rgba(56, 189, 248, 0.15)',
          fats: '#F472B6',
          fatsBg: 'rgba(244, 114, 182, 0.15)',
          calories: '#8B5CF6',
          caloriesBg: 'rgba(139, 92, 246, 0.15)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
