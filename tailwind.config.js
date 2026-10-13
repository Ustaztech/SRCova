/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#075B40',
          dark: '#003B2B',
          emerald: '#138A63',
          gold: '#D5AC49',
          'gold-light': '#F6EECD',
          'gold-dark': '#B88F28',
          bg: '#F7F9F8',
          surface: '#FFFFFF',
          text: '#202B28',
          muted: '#62726C',
          border: '#E1E7E4',
          subtle: '#EEF3F0'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(7, 91, 64, 0.08), 0 2px 6px -1px rgba(7, 91, 64, 0.04)',
        'brand-lg': '0 10px 30px -4px rgba(7, 91, 64, 0.12), 0 4px 12px -2px rgba(7, 91, 64, 0.06)',
        'gold': '0 4px 20px -2px rgba(213, 172, 73, 0.25)',
      }
    },
  },
  plugins: [],
}
