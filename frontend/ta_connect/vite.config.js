import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

// Custom plugin to replace APP_URL in HTML and generate SEO files
function seoUrlPlugin(appUrl, googleVerification) {
  // Generate Google verification meta tag only if code is provided
  const googleVerificationTag = googleVerification 
    ? `<meta name="google-site-verification" content="${googleVerification}" />`
    : '<!-- Google Search Console: Set VITE_GOOGLE_SITE_VERIFICATION in .env -->';

  return {
    name: 'seo-url-replace',
    transformIndexHtml(html) {
      return html
        .replace(/%VITE_APP_URL%/g, appUrl)
        .replace(/%VITE_GOOGLE_VERIFICATION_TAG%/g, googleVerificationTag);
    },
    closeBundle() {
      // Generate sitemap.xml with correct URL
      const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${appUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${appUrl}/login</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${appUrl}/register</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${appUrl}/about</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${appUrl}/contact</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${appUrl}/book</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${appUrl}/forgot-password</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00+00:00</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
      
      // Generate robots.txt with correct URL
      const robotsContent = `User-agent: *
Allow: /
Allow: /login
Allow: /register
Allow: /forgot-password
Allow: /about
Allow: /contact
Allow: /book

# Disallow backend API paths
Disallow: /api/

# Disallow authenticated frontend routes
Disallow: /ta/
Disallow: /student/
Disallow: /verify-email
Disallow: /reset-password
Disallow: /select-user-type
Disallow: /auth/

# Crawl delay for respectful crawling
Crawl-delay: 1

Sitemap: ${appUrl}/sitemap.xml`;

      try {
        writeFileSync(resolve('dist', 'sitemap.xml'), sitemapContent);
        writeFileSync(resolve('dist', 'robots.txt'), robotsContent);
        console.log(`✅ Generated sitemap.xml and robots.txt for: ${appUrl}`);
      } catch (error) {
        console.warn('⚠️ Could not generate SEO files:', error.message);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode`
  const env = loadEnv(mode, process.cwd(), '');
  const appUrl = env.VITE_APP_URL || 'https://taconnect.netlify.app';
  const googleVerification = env.VITE_GOOGLE_SITE_VERIFICATION || '';

  return {
    plugins: [
      react(),
      seoUrlPlugin(appUrl, googleVerification),
    ],
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
  };
})

