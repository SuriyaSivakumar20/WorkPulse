/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B0F26',
          900: '#0F1432', // Primary Navy background
          850: '#13193C',
          800: '#171D3B', // Surface Card
          750: '#1B2245',
          700: '#202744', // Elevated surface
          600: '#29314F', // Hover / lighter surface
          500: '#343957', // Border default
          400: '#464E72',
        },
        gold: {
          400: '#FFBB33',
          500: '#FFAA00', // Crows Gold accent
          600: '#E69900',
          900: '#3D2A00',
        },
        red: {
          400: '#FF334B',
          500: '#FF001E', // Crows Red accent
          600: '#D9001A',
          900: '#3D0007',
        },
        cream: {
          100: '#FBF9F5',
          200: '#F4F2EA', // Primary off-white text
          300: '#E5E2D6',
        },
        slate: {
          350: '#A7ADC3', // Secondary text
          450: '#7F87A3',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Oswald', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'geometric-gold': '2px 2px 0px 0px #FFAA00',
        'geometric-red': '2px 2px 0px 0px #FF001E',
        'geometric-navy': '3px 3px 0px 0px #0B0F26',
        'subtle-glow': '0 0 15px -3px rgba(255, 170, 0, 0.15)',
        'red-glow': '0 0 15px -3px rgba(255, 0, 30, 0.2)',
      }
    },
  },
  plugins: [],
}

