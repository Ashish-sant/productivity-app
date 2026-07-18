module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#007A33",
          hover: "#006A2C",
          soft: "#009B77",
        },
        mint: {
          DEFAULT: "#A8E6CE",
          light: "#C4EFDD",
        },
        sage: {
          DEFAULT: "#D0E8D0",
          light: "#E4F1E4",
          lighter: "#F1F7F0",
        },
        peach: {
          DEFAULT: "#FFCCBC",
          dark: "#F4A98F",
        },
        ink: {
          DEFAULT: "#1A2E23",
          soft: "#4A5D52",
          muted: "#7C8B82",
        },
        danger: {
          DEFAULT: "#C4553D",
          soft: "#F5D9D1",
        },
        line: {
          DEFAULT: "#DCE7DD",
          strong: "#C2D6C4",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0 4px 12px rgba(26, 46, 35, 0.06)",
        "card-hover": "0 8px 20px rgba(26, 46, 35, 0.10)",
      },
    },
  },
  plugins: [],
};