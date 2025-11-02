/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#1a1a1a',
          secondary: '#2d2d2d',
          tertiary: '#404040',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}