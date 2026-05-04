/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#ef233c',
          'red-dark': '#c1121f',
          'red-light': '#ff4d6d',
        },
        surface: {
          DEFAULT: '#080808',
          card: '#0e0e0e',
          elevated: '#161616',
          border: '#1e1e1e',
          hover: '#1a1a1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'red-glow': 'radial-gradient(ellipse at center, rgba(239,35,60,0.15) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'sidebar-active': 'linear-gradient(90deg, rgba(239,35,60,0.15) 0%, rgba(239,35,60,0.03) 100%)',
      },
      boxShadow: {
        'red-sm':  '0 0 12px rgba(239,35,60,0.2)',
        'red-md':  '0 0 24px rgba(239,35,60,0.25)',
        'red-lg':  '0 0 40px rgba(239,35,60,0.3)',
        'card':    '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5)',
        'glass':   'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':   'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)',
        'pulse-red':  'pulseRed 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:{ from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseRed: { '0%,100%': { boxShadow: '0 0 0 0 rgba(239,35,60,0)' }, '50%': { boxShadow: '0 0 0 6px rgba(239,35,60,0.1)' } },
        shimmer:  { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
