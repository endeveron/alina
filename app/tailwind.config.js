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
    },
  },
  plugins: [],
};
