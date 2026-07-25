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
        teal: {
          50:  "#e1f5ee",
          100: "#9fe1cb",
          400: "#1d9e75",
          700: "#0f6e56",
          900: "#04342c",
        },
        purple: {
          50:  "#eeedfe",
          400: "#7f77dd",
          700: "#534ab7",
        },
        coral: {
          50:  "#faece7",
          400: "#d85a30",
          700: "#993c1d",
        },
        amber: {
          50:  "#faeeda",
          400: "#ba7517",
        },
        blue: {
          50:  "#e6f1fb",
          400: "#378add",
        },
        green: {
          50:  "#eaf3de",
          400: "#639922",
        },
        gray: {
          50:  "#f7f6f3",
          100: "#eceae3",
          200: "#d3d1c7",
          400: "#888780",
          600: "#5f5e5a",
          900: "#2c2c2a",
        },
        ink: "#1a1917",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.06)",
        lifted: "0 8px 24px rgba(0,0,0,0.08)",
        focus: "0 0 0 3px rgba(29,158,117,0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "flip": "flip 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        flip: { "0%": { transform: "rotateY(0deg)" }, "100%": { transform: "rotateY(180deg)" } },
      },
    },
  },
  plugins: [],
};

export default config;
