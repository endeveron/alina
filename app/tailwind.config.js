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
        // // Heading
        // mlight: ['Merriweather-Light', 'serif'], // 300
        // mregular: ['Merriweather-Regular', 'serif'], // 400
        // mbold: ['Merriweather-Bold', 'serif'], // 700
        // mblack: ['Merriweather-Black', 'serif'], // 900
        // Paragraph
        pthin: ['Poppins-Thin', 'sans-serif'], // 100
        pextralight: ['Poppins-ExtraLight', 'sans-serif'], // 200
        plight: ['Poppins-Light', 'sans-serif'], // 300
        pregular: ['Poppins-Regular', 'sans-serif'], // 400
        pmedium: ['Poppins-Medium', 'sans-serif'], // 500
        psemibold: ['Poppins-SemiBold', 'sans-serif'], // 600
        pbold: ['Poppins-Bold', 'sans-serif'], // 700
        pextrabold: ['Poppins-ExtraBold', 'sans-serif'], // 800
        pblack: ['Poppins-Black', 'sans-serif'], // 900
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
          '0%, 20%, 100%': { opacity: '1' },
          '10%': { opacity: '.5' },
          '60%': { opacity: '.7' },
        },
      },
    },
  },
  plugins: [],
};
