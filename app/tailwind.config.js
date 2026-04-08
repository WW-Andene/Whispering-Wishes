/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // ═══════════════════════════════════════════════════════════════════════
    // ENCAPSULATED: Desktop layout is disabled. Mobile is the only layout.
    // The lg:/xl:/2xl: breakpoint classes still exist in source code but
    // never activate because these screens are set to unreachable widths.
    // To re-enable desktop layout, restore:
    //   lg: '1024px', xl: '1280px', '2xl': '1536px'
    // ═══════════════════════════════════════════════════════════════════════
    screens: {
      'sm': '640px',    // small phone → wider phone (active, mobile-responsive)
      'md': '768px',    // phone → tablet (active, mobile-responsive)
      'lg': '99999px',  // ENCAPSULATED — desktop layout disabled
      'xl': '99999px',  // ENCAPSULATED — desktop layout disabled
      '2xl': '99999px', // ENCAPSULATED — desktop layout disabled
    },
    extend: {
      // D-TYPE-0: Unified font-size scale backed by CSS variables (kuro.css)
      fontSize: {
        '2xs': 'var(--font-2xs)',   // 9px
        'sm':  'var(--font-sm)',    // 12px
        'base':'var(--font-base)',  // 15px
        'md':  'var(--font-md)',    // 18px
        'lg':  'var(--font-lg)',    // 21px
        'xl':  'var(--font-xl)',    // 24px
        '2xl': 'var(--font-2xl)',   // 27px
        '3xl': 'var(--font-3xl)',   // 30px
        '4xl': 'var(--font-4xl)',   // 33px
        '5xl': 'var(--font-5xl)',   // 36px
        '6xl': 'var(--font-6xl)',   // 48px
      },
      // D-TYPE-1: Display + data font families for cyberpunk-luxe character
      fontFamily: {
        display: ['Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        data: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Unify font-mono with the data font so Tailwind `font-mono` === `--font-data`
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
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
