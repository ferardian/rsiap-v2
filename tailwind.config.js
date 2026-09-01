/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false, // Nonaktifkan preflight reset agar Bootstrap style tetap utuh & bekerja 100%
  },
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
