/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "inverse-surface": "#2f3131", "on-surface": "#1a1c1c", "outline-variant": "#c5c5d3",
        "surface-tint": "#4059aa", "on-primary": "#ffffff", "on-background": "#1a1c1c",
        "outline": "#757682", "background": "#f9f9f9", "surface": "#f9f9f9",
        "surface-container-lowest": "#ffffff", "on-surface-variant": "#444651",
        "error": "#ba1a1a", "secondary": "#516072", "primary-container": "#1e3a8a",
        "primary": "#00236f", "surface-container-high": "#e8e8e8",
      },
      fontFamily: {
        "body-md": ["Hanken Grotesk", "sans-serif"],
        "label-sm": ["Geist", "sans-serif"],
        "headline-md": ["Bodoni Moda", "serif"],
        "display-lg": ["Bodoni Moda", "serif"]
      },
      spacing: {
        "margin-desktop": "80px", "gutter": "24px", "section-padding": "120px",
        "margin-mobile": "20px", "base": "8px"
      }
    },
  },
  plugins: [],
}