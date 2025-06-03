/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          bg: "var(--tg-theme-bg-color, #ffffff)",
          "secondary-bg": "var(--tg-theme-secondary-bg-color, #f1f1f1)",
          text: "var(--tg-theme-text-color, #000000)",
          hint: "var(--tg-theme-hint-color, #707579)",
          link: "var(--tg-theme-link-color, #2481cc)",
          button: "var(--tg-theme-button-color, #2481cc)",
          "button-text": "var(--tg-theme-button-text-color, #ffffff)"
        }
      }
    }
  },
  plugins: []
};
