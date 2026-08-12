/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        merah: "#C1272D",
        merahdark: "#8E1B20",
        kertas: "#F5EFE3",
        kertas2: "#EAE0CC",
        tinta: "#2B2620",
        sepia: "#6B5B47",
        emas: "#B8894B",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        body: ['"Instrument Sans"', "system-ui", "sans-serif"],
        stamp: ['"Space Grotesk"', "monospace"],
      },
      boxShadow: {
        arsip: "0 20px 50px -20px rgba(43,38,32,0.35)",
      },
    },
  },
  plugins: [],
};
