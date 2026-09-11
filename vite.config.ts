import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import { products } from './src/data/products';

const SITE_URL = process.env.SITE_URL || '';

function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    apply: 'build',
    closeBundle() {
      if (!SITE_URL) return;
      const staticPaths = ['/', '/collection/all', '/collection/bridal', '/collection/evening', '/about', '/contact', '/appointment', '/style-quiz', '/faq'];
      const productPaths = products.map(p => `/product/${p.id}`);
      const urls = [...staticPaths, ...productPaths]
        .map(route => `  <url><loc>${SITE_URL}${route}</loc><changefreq>weekly</changefreq></url>`)
        .join('\n');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml });
      const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkout\nDisallow: /profile\nDisallow: /auth\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sitemapPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'motion', 'date-fns'],
          recharts: ['recharts'],
          'model-viewer': ['@google/model-viewer'],
        },
      },
    },
  },
});
