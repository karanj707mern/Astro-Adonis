import { defineConfig, envField, memoryCache } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import node from '@astrojs/node'

export default defineConfig({
  site: process.env.SITE_URL || process.env.PUBLIC_SITE_URL || 'http://localhost:3000',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: [
      'res.cloudinary.com',
      'localhost',
      '127.0.0.1',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  server: { port: Number(process.env.PORT || 3000) },
  experimental: { contentIntellisense: true },
  output: 'static',
  adapter: node({ mode: 'standalone', staticHeaders: true }),
  cache: {
    provider: memoryCache(),
  },
  env: {
    schema: {
      PUBLIC_API_BASE_URL: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_SITE_URL: envField.string({ context: 'client', access: 'public' }),
      PUBLIC_CLOUDINARY_CLOUD_NAME: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GOOGLE_CLIENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_LOG_LEVEL: envField.string({ context: 'server', access: 'public', optional: true }),
      PORT: envField.number({ context: 'server', access: 'public', default: 3000 }),
    },
  },
  security: {
    check: 0,
  },
  session: false,
  routeRules: {
    '/api/*': { CacheControl: 'no-cache' },
    '/admin/*': { CacheControl: 'no-store' },
    '/auth/*': { CacheControl: 'no-store' },
    '/profile': { CacheControl: 'no-store' },
    '/orders/**': { CacheControl: 'no-store' },
    '/cart': { CacheControl: 'no-store' },
    '/wishlist': { CacheControl: 'no-store' },
    '/checkout/**': { CacheControl: 'no-store' },
    '/blog/**': { CacheControl: 'public, max-age=600, stale-while-revalidate=60' },
    '/product/**': { CacheControl: 'public, max-age=300, stale-while-revalidate=60' },
    '/shop': { CacheControl: 'public, max-age=600, stale-while-revalidate=60' },
    '/about-us': { CacheControl: 'public, max-age=3600' },
    '/contact': { CacheControl: 'public, max-age=3600' },
    '/terms': { CacheControl: 'public, max-age=3600' },
    '/privacy-policy': { CacheControl: 'public, max-age=3600' },
    '/returns': { CacheControl: 'public, max-age=3600' },
    '/shipping': { CacheControl: 'public, max-age=3600' },
    '/wellness-journal': { CacheControl: 'public, max-age=3600' },
    '/sitemap.xml': { CacheControl: 'public, max-age=3600' },
    '/robots.txt': { CacheControl: 'public, max-age=86400' },
    '/*': { CacheControl: 'public, max-age=300, stale-while-revalidate=60' },
  },
})
