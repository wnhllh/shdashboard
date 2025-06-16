import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'three',
      'react-globe.gl',
      'three-globe', // react-globe.gl depends on this
      // 'echarts', // echarts usually handles itself well
      // 'echarts-gl'
    ],
    // If the issue persists, we might need to exclude three and handle it manually
    // exclude: ['three'] 
  },
}) 