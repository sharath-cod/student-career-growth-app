/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211F',
        paper: '#F5F6F2',
        surface: '#FFFFFF',
        pine: { DEFAULT: '#0F5C4D', dark: '#0A3F35', light: '#E3EFEA' },
        signal: { DEFAULT: '#E3A32B', light: '#FBF1DA' },
        line: '#D8DDD6',
        muted: '#5E6B66',
        danger: { DEFAULT: '#B3402F', light: '#FBEAE6' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '10px' },
    },
  },
  plugins: [],
};
