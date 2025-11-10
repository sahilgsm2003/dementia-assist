/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#E02478",
          hover: "#C01E66",
          light: "rgba(224, 36, 120, 0.15)",
          dark: "rgba(224, 36, 120, 0.85)",
        },
        background: {
          DEFAULT: "#05060a",
          surface: "rgba(255, 255, 255, 0.05)",
          "surface-hover": "rgba(255, 255, 255, 0.10)",
          "surface-elevated": "rgba(255, 255, 255, 0.08)",
        },
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.10)",
          hover: "rgba(255, 255, 255, 0.20)",
          light: "rgba(255, 255, 255, 0.05)",
        },
        text: {
          primary: "rgba(255, 255, 255, 1)",
          secondary: "rgba(255, 255, 255, 0.70)",
          tertiary: "rgba(255, 255, 255, 0.60)",
          muted: "rgba(255, 255, 255, 0.50)",
          disabled: "rgba(255, 255, 255, 0.40)",
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
