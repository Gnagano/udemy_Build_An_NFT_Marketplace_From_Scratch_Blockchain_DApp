/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  options: {
    safelist: {
      standard: [/^bg-/,/^text-/]
    }
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
