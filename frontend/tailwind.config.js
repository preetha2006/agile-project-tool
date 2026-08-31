/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#F5F0E8',
          secondary: '#EDE5D8',
          surface: '#FFFDF8',
        },
        text: {
          primary: '#3E3A35',
          secondary: '#777067',
          muted: '#9A8F85',
        },
        border: '#DED6C9',
        accent: {
          muted: '#C8B9A6',
          sage: '#B7C4B0',
          rose: '#D8B9B2',
          blue: '#B9C5D0',
          yellow: '#DCCB9A',
        }
      }
    },
  },
  plugins: [],
}
