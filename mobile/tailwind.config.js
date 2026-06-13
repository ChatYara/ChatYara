/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#020617",
        panel: "rgba(15, 23, 42, 0.72)",
        neon: "#38BDF8",
        cyanDeep: "#075985"
      }
    }
  },
  plugins: []
};

