/** @type {import('tailwindcss').Config} */
// Colours come from the CSS variables in src/index.css (light values on :root, dark values on .dark),
// written as "r g b" so opacity modifiers such as bg-ink/50 keep working.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: v('ink'),
        paper: v('paper'),
        surface: v('surface'),
        sidebar: v('sidebar'),
        pine: { DEFAULT: v('pine'), dark: v('pine-dark'), light: v('pine-light'), hover: v('pine-hover') },
        'on-pine': v('on-pine'),
        signal: { DEFAULT: v('signal'), light: v('signal-light') },
        line: v('line'),
        muted: v('muted'),
        danger: { DEFAULT: v('danger'), light: v('danger-light') },
        'on-danger': v('on-danger'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '10px' },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow) / 0.06), 0 4px 14px rgb(var(--shadow) / 0.05)',
      },
    },
  },
  plugins: [],
};
