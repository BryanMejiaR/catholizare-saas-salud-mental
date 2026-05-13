import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211d",
        moss: "#2f5d50",
        sage: "#8aa39b",
        linen: "#f7f2ea",
        clay: "#b76e52",
        gold: "#c9a45c"
      }
    }
  },
  plugins: []
};

export default config;
