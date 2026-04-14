/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Rawline', 'Segoe UI', 'sans-serif'],
        mono:    ['Source Code Pro', 'Courier New', 'monospace'],
      },
      colors: {
        gov: {
          'blue-dark':  '#071D41',
          'blue':       '#1351B4',
          'blue-warm':  '#2670E8',
          'blue-light': '#C5D4EB',
          'blue-bg':    '#EFF3FB',
          'green':      '#168821',
          'green-light':'#DAF0DE',
        },
        risk: {
          low:     '#f4a261',
          mid:     '#e76f51',
          high:    '#c1121f',
          extreme: '#7b0d1e',
        },
        danger: '#E52207',
      },
      animation: {
        'fade-up':   'fadeUp 300ms ease both',
        'fade-in':   'fadeIn 250ms ease both',
        'slide-in':  'slideIn 250ms ease both',
        'count':     'count 600ms ease both',
      },
      keyframes: {
        fadeUp:  { from: { opacity:'0', transform:'translateY(10px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:  { from: { opacity:'0' }, to: { opacity:'1' } },
        slideIn: { from: { opacity:'0', transform:'translateX(16px)' }, to: { opacity:'1', transform:'translateX(0)' } },
        count:   { from: { opacity:'0', transform:'translateY(6px)' }, to: { opacity:'1', transform:'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
