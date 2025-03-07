/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './app/(tabs)/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './core/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // Paragraph
        pthin: ['MontserratAlt-Thin', 'sans-serif'], // 100
        pextralight: ['MontserratAlt-ExtraLight', 'sans-serif'], // 200
        plight: ['MontserratAlt-Light', 'sans-serif'], // 300
        pregular: ['MontserratAlt-Regular', 'sans-serif'], // 400
        pmedium: ['MontserratAlt-Medium', 'sans-serif'], // 500
        psemibold: ['MontserratAlt-SemiBold', 'sans-serif'], // 600
        pbold: ['MontserratAlt-Bold', 'sans-serif'], // 700
        pextrabold: ['MontserratAlt-ExtraBold', 'sans-serif'], // 800
        pblack: ['MontserratAlt-Black', 'sans-serif'], // 900
      },
      fontSize: {
        '2xl': [
          '1.375rem' /* 22px */,
          {
            lineHeight: '2.125rem' /* 34px */,
            letterSpacing: '-0.01em',
          },
        ],
        '3xl': [
          '2rem' /* 32px */,
          {
            lineHeight: '2.75rem' /* 44px */,
            letterSpacing: '-0.02em',
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
