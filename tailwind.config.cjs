/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#5A9F8A',
        'dark': '#000000',
        'gray-custom': '#2d2d2d',
      },
      fontFamily: {
        'manrope': ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        'remote': '40px',
      }
    },
  },
  plugins: [],
}

