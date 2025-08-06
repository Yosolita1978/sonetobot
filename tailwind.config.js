/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
      extend: {
        colors: {
          talavera: {
            green:  '#3e8672',
            orange: '#ffa93a',
            red:    '#af3f23',
            blue:   '#7caaf0',
            indigo: '#303162',
          }
        }
      }
    },
    plugins: [],
  }