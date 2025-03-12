/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/components/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        pthin: ['Montserrat-Thin', 'sans-serif'], // 100
        pextralight: ['Montserrat-ExtraLight', 'sans-serif'], // 200
        plight: ['Montserrat-Light', 'sans-serif'], // 300
        pregular: ['Montserrat-Regular', 'sans-serif'], // 400
        pmedium: ['Montserrat-Medium', 'sans-serif'], // 500
        psemibold: ['Montserrat-SemiBold', 'sans-serif'], // 600
        pbold: ['Montserrat-Bold', 'sans-serif'], // 700
        pextrabold: ['Montserrat-ExtraBold', 'sans-serif'], // 800
        pblack: ['Montserrat-Black', 'sans-serif'], // 900
      },
      fontSize: {
        '2xl': [
          '1.375rem' /* 22px */,
          {
            lineHeight: '2.25rem' /* 36px */,
          },
        ],
        '3xl': [
          '2rem' /* 32px */,
          {
            lineHeight: '2.75rem' /* 44px */,
          },
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'fly-ai': 'fly-ai 3s cubic-bezier(0.3,0,0.7,1) infinite',
        'pulse-ai': 'pulse-ai 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fly-ai': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        'pulse-ai': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        },
      },
    },
  },
  plugins: [],
};
