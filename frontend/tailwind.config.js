/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        fadeInGrow: {
          '0%': { opacity: '0', transform: 'scale(0) translate(1150px, 100px)' },
          '100%': { opacity: '1', transform: 'scale(1) translate(1150px, 100px)' },
        }
      },
      animation: {
        fadeInGrow: 'fadeInGrow 1s ease-out',
      }
    },
  },
  plugins: [],
};
