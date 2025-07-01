/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'mobile': {'max': '768px'},
        'tablet': {'min': '769px', 'max': '1024px'},
        'desktop': {'min': '1025px'},
      },
      fontFamily: {
        'effra': ['Effra', 'sans-serif'],
        'noto-arabic': ['Noto Sans Arabic', 'sans-serif'],
        'cairo': ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's reset to avoid conflicts with custom SCSS
  },
}
