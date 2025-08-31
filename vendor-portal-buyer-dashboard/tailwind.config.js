module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6A1B9A',
        primaryLight: '#8E24AA',
        bgLight: '#F5F5F5',
        bgLighter: '#FAFAFA',
        textDark: '#212121',
        textDarker: '#333333',
        borderLightGray: '#E0E0E0',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}