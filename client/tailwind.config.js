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
        brand: {
          black: '#000000',
          dark: '#111111',
          surface: '#18181b',
          border: '#27272a',
          muted: '#71717a',
          light: '#f4f4f5',
          white: '#ffffff',
          accent: '#000000', // Clean monochrome high-fashion aesthetic
          subtle: '#fafafa',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'floating': '0 20px 40px -15px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
