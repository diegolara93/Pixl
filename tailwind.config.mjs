/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  daisyui: {
    themes: [
      {
        catppuccinmocha: {
          
"primary": "#f2cdcd",
          
"secondary": "#f5e0dc",
          
"accent": "#f5c2e7",
          
"neutral": "#74c7ec",
          
"base-100": "#11111b",
          
"info": "#f9e2af",
          
"success": "#a6e3a1",
          
"warning": "#fab387",
          
"error": "#f38ba8",
          },
        },
      ],
    },
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require('daisyui')
  ],
};
