/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F4F8FF",
        surface: "#FFFFFF",
        "surface-elevated": "#EAF2FF",
        accent: "#0075FF",
        "accent-soft": "#0A5AD4",
        "accent-secondary": "#00C786",
        muted: "#5C6F8B",
        "muted-strong": "#2E3A4E",
        line: "#D5E2F6",
        red: "#FF385C",
        blue: "#0075FF",
        green: "#00C786",
        ink: "#081126",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "sans-serif"],
        heading: ["var(--font-heading)", "ui-sans-serif", "sans-serif"],
        graffiti: ["var(--font-graffiti)", "cursive"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(120% 140% at 15% -10%, rgba(0,117,255,0.20), transparent 55%), radial-gradient(140% 160% at 85% 5%, rgba(0,199,134,0.18), transparent 58%), radial-gradient(110% 140% at 50% 100%, rgba(255,56,92,0.12), transparent 55%)",
        "surface-pattern":
          "radial-gradient(circle at 1px 1px, rgba(0,117,255,0.15) 1px, transparent 0)",
        "scan-lines":
          "linear-gradient(transparent 0%, rgba(0,117,255,0.05) 45%, rgba(0,199,134,0.04) 100%)",
      },
      backgroundSize: {
        grid: "24px 24px",
      },
      boxShadow: {
        soft: "0 18px 48px rgba(6, 20, 45, 0.08)",
        glass: "0 30px 90px rgba(0, 117, 255, 0.16)",
        glow: "0 0 36px rgba(0, 117, 255, 0.24)",
        "glow-green": "0 0 34px rgba(0, 199, 134, 0.22)",
        "glow-red": "0 0 32px rgba(255, 56, 92, 0.22)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.2rem",
      },
      keyframes: {
        "float-up": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "float-up": "float-up 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        pulse: "pulse 2.5s ease-in-out infinite",
      },
      opacity: {
        15: "0.15",
      },
    },
  },
  plugins: [],
};
