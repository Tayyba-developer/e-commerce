/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14161F",
          700: "#1B1E2B",
          600: "#242739",
        },
        paper: "#F7F5EF",
        panel: "#FFFFFF",
        slate: {
          950: "#2B2D3A",
          500: "#6B6E82",
          400: "#8A8D9F",
          200: "#E4E2DA",
        },
        amber: {
          DEFAULT: "#E8A33D",
          600: "#C98420",
          100: "#FBEBD1",
        },
        teal: {
          DEFAULT: "#1F6F63",
          100: "#DCEEE9",
        },
        rust: {
          DEFAULT: "#C1462F",
          100: "#F7E1DB",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,22,31,0.06), 0 1px 0 rgba(20,22,31,0.04)",
      },
      borderRadius: {
        DEFAULT: "10px",
      },
    },
  },
  plugins: [],
};
