import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090B0A",
        moss: "#19251C",
        acid: "#B8FF3C",
        mint: "#68F7B3",
        ember: "#FF7A3D",
        shell: "#F7F8EF"
      },
      boxShadow: {
        glow: "0 0 80px rgba(184, 255, 60, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
