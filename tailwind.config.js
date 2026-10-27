/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Stitch "Culinary Operations System" Palette
        primary: {
          DEFAULT: '#091426',
          container: '#1e293b',
          fixed: '#d8e3fb',
          'fixed-dim': '#bcc7de',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#8590a6',
          fixed: '#111c2d',
          'fixed-variant': '#3c475a',
        },
        secondary: {
          DEFAULT: '#904d00',
          container: '#fe932c',
          fixed: '#ffdcc3',
          'fixed-dim': '#ffb77d',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#663500',
          fixed: '#2f1500',
          'fixed-variant': '#6e3900',
        },
        tertiary: {
          DEFAULT: '#00190e',
          container: '#00301e',
          fixed: '#6ffbbe',
          'fixed-dim': '#4edea3',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#00a472',
          fixed: '#002113',
          'fixed-variant': '#005236',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          bright: '#f8f9ff',
          dim: '#cbdbf5',
          container: {
            lowest: '#ffffff',
            low: '#eff4ff',
            DEFAULT: '#e5eeff',
            high: '#dce9ff',
            highest: '#d3e4fe',
          },
          variant: '#d3e4fe',
          tint: '#545f73',
        },
        'on-surface': {
          DEFAULT: '#0b1c30',
          variant: '#45474c',
        },
        outline: {
          DEFAULT: '#75777d',
          variant: '#c5c6cd',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        'inverse-primary': '#bcc7de',

        // Backward compatibility for existing views
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        slate: {
          750: '#1e293b',
          850: '#151f32',
          950: '#0a0f1d',
        },
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Hanken Grotesk', 'Inter', 'sans-serif'],
        sans: [
          'Hanken Grotesk',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        mono: ['Space Grotesk', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
