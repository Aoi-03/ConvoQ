/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          text: '#150e0f',
          bg: '#fcfafb',
          primary: '#9b6d77',
          'primary-hover': '#865b64',
          'primary-light': '#f4ecee',
          secondary: '#b1cab2',
          'secondary-light': '#eaf2eb',
          'secondary-dark': '#48684a',
          accent: '#87ada2',
          'accent-light': '#edf4f2',
          'accent-dark': '#3a6357',
          border: '#e8dfe2',
          'border-dark': '#ded1d5',
          panel: '#ffffff',
          'panel-subtle': '#f9f5f6',
          muted: '#6f5e63',
          subtle: '#948388',
        }
      }
    },
  },
  plugins: [],
}
