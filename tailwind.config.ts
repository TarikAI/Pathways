import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#2F4156",
          teal: "#567C8D",
          sky: "#C8D9E6",
          beige: "#F5EFEB",
          white: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
