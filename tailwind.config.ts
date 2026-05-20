import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        principal: "#001A55",
        texto: "#001A55",
        secundario: "#002699",
        enfasis: "#13DAFB",
        azulMedio: "#0966EF",
        rojoRompe: "#BC0202",
        blanco: "#FFFFFF",
        grisMuyClaro: "#F4F9FD",
        grisTextos: "#8A8989",
        grisMedio: "#B0B0B0",
        ink: "#001A55",
        moss: "#002699",
        sage: "#8A8989",
        linen: "#F4F9FD",
        clay: "#BC0202",
        gold: "#13DAFB"
      }
    }
  },
  plugins: []
};

export default config;
