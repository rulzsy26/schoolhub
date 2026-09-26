/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#102A72',
        blue: '#1769FF',
        sky: '#EAF4FF',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(27, 73, 132, 0.08)',
      },
    },
  },
  plugins: [],
};
