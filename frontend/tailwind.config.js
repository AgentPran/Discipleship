/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fb',
          100: '#e6edf6',
          500: '#3b6cb4',
          600: '#2f5a99',
          700: '#274a80',
        },
      },
    },
  },
  plugins: [],
}
