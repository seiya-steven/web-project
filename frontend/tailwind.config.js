/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        shopee: {
          DEFAULT: "#ee4d2d",
          dark: "#d73211",
          light: "#fff5f4",
        },
      },
    },
  },
  plugins: [],
};
