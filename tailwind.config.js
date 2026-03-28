/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This covers everything in src
    "./pages/**/*.{js,jsx}",      // Add this if pages is outside src
    "./services/**/*.{js,jsx}",   // Add this if services is outside src
  ],
  theme: {
    extend: {
      // Add a custom animation for that 2026 feel
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}