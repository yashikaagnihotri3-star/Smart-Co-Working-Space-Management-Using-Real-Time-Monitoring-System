/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14181F',
        paper: '#F3F4F0',
        line: '#DEDCD3',
        brand: {
          DEFAULT: '#1F6F5C',
          dark: '#16503F',
          light: '#E4F0EC',
        },
        amber: {
          DEFAULT: '#E8A33D',
          light: '#FCEDD4',
        },
        coral: {
          DEFAULT: '#C1493B',
          light: '#F6E2DF',
        },
        leaf: {
          DEFAULT: '#2F9E6B',
          light: '#E1F3EA',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(20,24,31,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,24,31,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '24px 24px',
      },
    },
  },
  plugins: [],
};
