import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AlphaCreative brand palette — Navy Blue
        brand: {
          50:  '#f0f4fa',
          100: '#dce8f5',
          200: '#b8d0eb',
          300: '#85aed8',
          400: '#4f86bf',
          500: '#2b64a3',
          600: '#1a4d87',
          700: '#001D3D', // Navy Blue — primary brand color
          800: '#001630',
          900: '#000F1F', // Deep Navy
          950: '#000912',
        },
        // Alpha Gold accent
        accent: {
          50:  '#fffdf0',
          100: '#fef9d3',
          200: '#fef0a0',
          300: '#fde168',
          400: '#fccf30',
          500: '#FCBA12', // Alpha Gold — primary accent
          600: '#e0a40e',
          700: '#c48f0b',
          800: '#a87909',
          900: '#8c6407',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Nunito"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
