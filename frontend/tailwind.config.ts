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
        spheronix: {
          dark: '#071A45',
          navy: '#0E3A8C',
          blue: '#1956C2',
          lightBlue: '#E8F2FD',
          cyan: '#06B6D4',
          purple: '#7C3AED',
          purpleDark: '#581C87',
          grayBg: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
