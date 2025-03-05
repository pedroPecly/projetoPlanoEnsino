/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2b9f3f',
        'primary-hover': '#248a35',
      },
    },
  },
  plugins: [],
};
