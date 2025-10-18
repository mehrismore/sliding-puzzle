import type { Config } from "tailwindcss";

// tailwind.config.js or .ts
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
