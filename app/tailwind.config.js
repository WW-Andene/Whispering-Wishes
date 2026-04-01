/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // D-TYPE-1: Display + data font families for cyberpunk-luxe character
      fontFamily: {
        display: ['Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        data: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      // D-COLOR-1: Cool-tinted gray scale to match the app's blue-tinted surfaces
      // Replaces Tailwind's neutral grays with chromatic cool variants
      colors: {
        gray: {
          50: '#f5f7fa',
          100: '#e8ecf2',
          200: '#d2d8e3',
          300: '#c5ccda',
          400: '#8f99ab',
          500: '#646e7f',
          600: '#4a5364',
          700: '#374050',
          800: '#252d3b',
          900: '#171d29',
          950: '#0c1018',
        },
      },
    },
  },
  plugins: [],
}
