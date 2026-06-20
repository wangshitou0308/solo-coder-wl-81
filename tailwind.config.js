/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#f0f5fa",
          100: "#dce8f2",
          200: "#b8d1e5",
          300: "#89b3d2",
          400: "#578ebb",
          500: "#3870a1",
          600: "#2b5885",
          700: "#1e3a5f",
          800: "#1a3250",
          900: "#172a43",
          950: "#0f1c2d",
        },
        accent: {
          50: "#effef9",
          100: "#c9fdea",
          200: "#94f9d5",
          300: "#58eebd",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        warning: {
          50: "#fff8ed",
          100: "#ffedd3",
          200: "#ffd7a5",
          300: "#ffb96d",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        serif: ['"Noto Serif SC"', "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, #1e3a5f 0%, #2b5885 50%, #3870a1 100%)",
        "gradient-accent":
          "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)",
        "gradient-glass":
          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(30, 58, 95, 0.1)",
        "glass-hover": "0 12px 40px rgba(30, 58, 95, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
