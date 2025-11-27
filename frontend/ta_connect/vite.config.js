import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-axios': ['axios'],
          
          // Feature chunks
          'pages-auth': ['./src/pages/main/LoginPage.jsx', './src/pages/main/RegisterPage.jsx'],
          'pages-ta': ['./src/pages/ta/TAPage.jsx', './src/pages/ta/ManageCourses.jsx', './src/pages/ta/AnalyticsDashboard.jsx'],
          'pages-student': ['./src/pages/student/BookPage.jsx', './src/pages/student/studentHomePage.jsx'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Source maps for production debugging
    sourcemap: true,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})

