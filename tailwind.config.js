/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F1420",
        surface: "#171E2E",
        "surface-hover": "#1E2740",
        border: "#2A3350",
        accent: "#D9A441",
        secondary: "#4FA3A3",
        ink: "#E8E6DF",
        muted: "#8B92A8",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
