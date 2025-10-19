/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#05060A",
        surface: "#0B0E17",
        "surface-elevated": "#161A29",
        accent: "#E5BB4A",
        "accent-soft": "#F4CF73",
        "accent-secondary": "#4EC5F1",
        muted: "#A2A9B8",
        "muted-strong": "#CBD1DE",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(120% 120% at 20% 20%, rgba(228,187,74,0.16) 0%, rgba(5,6,10,0) 60%), radial-gradient(80% 80% at 80% -10%, rgba(78,197,241,0.18) 0%, rgba(5,6,10,0) 55%)",
        "surface-pattern":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.35)",
        glass: "0 25px 60px rgba(0,0,0,0.45)",
        glow: "0 0 35px rgba(229,187,74,0.35)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
      keyframes: {
        "float-up": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "float-up": "float-up 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      opacity: {
        15: "0.15",
      },
    },
  },
  plugins: [],
};
