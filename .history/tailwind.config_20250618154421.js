/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tech-blue': '#0a192f', // 深蓝色背景
        'cyber-blue': '#00d9ff', // 更鲜亮的科技蓝
        'cyber-accent': '#00f7ff', // 更亮的强调色
        'cyber-highlight': '#41ffd2', // 荧光绿蓝
        'cyber-purple': '#ae00ff', // 未来感紫色
        'dark-navy': '#061528', // 暗深蓝
        'midnight': '#0c1b2c', // 深夜蓝
        'glow-blue': 'rgba(0, 217, 255, 0.5)', // 发光蓝
        'glow-end': 'rgba(0, 217, 255, 0)',
        'neon-orange': '#ff7b00', // 霓虹橙
        'neon-yellow': '#ffff00', // 霓虹黄
      },
      fontFamily: {
        'sans': ['"Rajdhani"', '"Orbitron"', '"Roboto"', 'sans-serif'], // 更具科技感的字体
        'mono': ['"Space Mono"', '"Consolas"', 'monospace'], // 更具未来感的等宽字体
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(0, 217, 255, 0.4)',
        'glow': '0 0 15px rgba(0, 217, 255, 0.5)',
        'glow-lg': '0 0 25px rgba(0, 217, 255, 0.5)',
        'glow-xl': '0 0 35px rgba(0, 217, 255, 0.6)',
        'glow-purple': '0 0 15px rgba(174, 0, 255, 0.5)',
        'inner-glow': 'inset 0 0 15px rgba(0, 217, 255, 0.3)',
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(to right, rgba(30, 58, 95, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 58, 95, 0.1) 1px, transparent 1px)',
        'glow-radial': 'radial-gradient(circle at center, rgba(0, 217, 255, 0.2) 0%, rgba(0, 217, 255, 0) 70%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s infinite',
        'float': 'float 5s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'data-flow': 'data-flow 4s linear infinite',
        'cyber-pulse': 'cyber-pulse 2s ease-in-out infinite',
        'hologram': 'hologram 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { filter: 'brightness(100%) drop-shadow(0 0 8px rgba(0, 217, 255, 0.5))' },
          '50%': { filter: 'brightness(120%) drop-shadow(0 0 15px rgba(0, 217, 255, 0.8))' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'cyber-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(6, 182, 212, 0.5), inset 0 0 5px rgba(6, 182, 212, 0.2)',
            borderColor: 'rgba(6, 182, 212, 0.3)'
          },
          '50%': {
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.8), inset 0 0 10px rgba(6, 182, 212, 0.4)',
            borderColor: 'rgba(6, 182, 212, 0.6)'
          },
        },
        'hologram': {
          '0%, 100%': { opacity: '0.8', filter: 'brightness(100%)' },
          '33%': { opacity: '1', filter: 'brightness(110%)' },
          '66%': { opacity: '0.9', filter: 'brightness(95%)' },
        }
      },
      fontSize: {
        'xxs': '0.65rem',
      },
      borderWidth: {
        '1': '1px',
      },
    },
  },
  plugins: [],
} 