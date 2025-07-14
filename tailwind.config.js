/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'noto': ['Noto Sans', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'shake': 'shake 0.5s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'combo-glow': 'combo-glow 2s ease-in-out',
        'score-pop': 'score-pop 1.5s ease-out',
        'firework-explode': 'firework-explode 1.5s ease-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' },
        },
        'combo-glow': {
          '0%': { 
            transform: 'scale(0.5) rotate(-10deg)',
            opacity: '0',
            filter: 'brightness(1)'
          },
          '50%': { 
            transform: 'scale(1.1) rotate(5deg)',
            opacity: '1',
            filter: 'brightness(1.5) drop-shadow(0 0 20px rgba(255, 165, 0, 0.8))'
          },
          '100%': { 
            transform: 'scale(1) rotate(0deg)',
            opacity: '0',
            filter: 'brightness(1)'
          },
        },
        'score-pop': {
          '0%': { 
            transform: 'translateY(0) scale(0.8)',
            opacity: '0'
          },
          '20%': { 
            transform: 'translateY(-20px) scale(1.1)',
            opacity: '1'
          },
          '80%': { 
            transform: 'translateY(-50px) scale(1)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateY(-60px) scale(0.9)',
            opacity: '0'
          },
        },
        'firework-explode': {
          '0%': { 
            transform: 'scale(0)',
            opacity: '1'
          },
          '50%': { 
            transform: 'scale(1.5)',
            opacity: '0.8'
          },
          '100%': { 
            transform: 'scale(2)',
            opacity: '0'
          },
        },
      },
    },
  },
  plugins: [],
}

 