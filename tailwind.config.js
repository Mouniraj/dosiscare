/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Design tokens from the DosisCare prototype (see src/theme/colors.ts).
        primary: '#2f6bed',
        canvas: { light: '#c9d3e0', dark: '#070a10' },
        bg: { light: '#eef2f8', dark: '#0f141d' },
        surface: { light: '#ffffff', dark: '#182130' },
        outline: { light: '#e4e9f1', dark: '#28303f' },
        ok: '#17a673',
        danger: '#e5484d',
        warn: '#f5931f',
      },
    },
  },
  plugins: [],
};
