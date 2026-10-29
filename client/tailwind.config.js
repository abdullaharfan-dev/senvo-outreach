/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#3A506B',
          600: '#475569',
        },
        senvo: {
          primary: '#2563EB', // SENVO electric blue
          accent: '#06B6D4',  // Cyan accent
          dark: '#0F172A',
          card: '#FFFFFF',
          border: '#E2E8F0',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          subtle: '#F8FAFC',
        }
      }
    },
  },
  plugins: [],
}
