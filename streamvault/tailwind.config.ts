import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0C0A0A",
          2: "#150F0F",
          3: "#1D1414",
          4: "#271A1A",
          5: "#33201F",
        },
        marquee: {
          DEFAULT: "#D62839",
          bright: "#FF3B4E",
        },
        ticket: {
          DEFAULT: "#F3EADA",
          2: "#B8AC98",
          3: "#7A6F5D",
          4: "#453D30",
        },
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;