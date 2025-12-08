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
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
          
          // Feature chunks
          if (id.includes('/pages/main/LoginPage') || id.includes('/pages/main/RegisterPage')) {
            return 'pages-auth';
          }
          if (id.includes('/pages/ta/TAPage') || id.includes('/pages/ta/ManageCourses') || id.includes('/pages/ta/AnalyticsDashboard')) {
            return 'pages-ta';
          }
          if (id.includes('/pages/student/BookPage') || id.includes('/pages/student/studentHomePage')) {
            return 'pages-student';
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Source maps for production debugging
    sourcemap: true,
    // Minification handled by rolldown-vite's default minifier
  },
})

