/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        body: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#d4f53c',
          hover: '#e5ff5c',
          dim: 'rgba(212,245,60,0.15)',
          glow: 'rgba(212,245,60,0.08)',
          text: '#c8e636',
          dark: '#9ab82a',
        },
        bg: {
          root: '#0a0a0f',
          surface: '#111118',
          elevated: '#16161f',
          card: 'rgba(255,255,255,0.025)',
          glass: 'rgba(14,14,20,0.75)',
          'glass-heavy': 'rgba(10,10,15,0.92)',
        },
        score: {
          high: '#22c55e',
          mid: '#fbbf24',
          low: '#ef4444',
        },
      },
      backgroundImage: {
        'card-helldivers': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'card-baldur': 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
        'card-stellar': 'linear-gradient(135deg, #4a0080 0%, #7b2d8b 50%, #c2185b 100%)',
        'card-rdr2': 'linear-gradient(135deg, #3d1a00 0%, #7c3303 50%, #c56000 100%)',
        'card-hades': 'linear-gradient(135deg, #1a0533 0%, #5c1a8e 50%, #8b0000 100%)',
        'card-ghost': 'linear-gradient(135deg, #0d1b2a 0%, #1b4332 50%, #2d6a4f 100%)',
        'card-witcher': 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #6b3a00 100%)',
        'card-hollow': 'linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #2d0045 100%)',
        'card-cyberpunk': 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #ff00ff22 100%)',
        'card-nier': 'linear-gradient(135deg, #1a1a0a 0%, #2a2a15 50%, #3d3d20 100%)',
        'card-starfield': 'linear-gradient(135deg, #000814 0%, #001d3d 50%, #003566 100%)',
        'card-wukong': 'linear-gradient(135deg, #1a0a00 0%, #4a1500 50%, #8b2500 100%)',
        'card-ac': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,245,60,0.05)' },
          '50%': { boxShadow: '0 0 30px rgba(212,245,60,0.12)' },
        },
      },
    },
  },
  plugins: [],
};
