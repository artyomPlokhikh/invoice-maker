import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
    return {
        base: mode === 'production'
            ? '/invoice-maker/'
            : '/',
        optimizeDeps: {
            include: ['jspdf', 'jspdf-autotable', 'qrcode']
        },
        plugins: [
            vue(),
            vueDevTools(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico'],
                manifest: {
                    name: 'Invoice Maker',
                    short_name: 'Invoice Maker',
                    description: 'Nástroj pro vystavení faktury',
                    theme_color: '#ffffff',
                    icons: [
                        {
                            src: 'pwa-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: 'pwa-512x512.png',
                            sizes: '512x512',
                            type: 'image/png',
                            purpose: 'any maskable'
                        }
                    ]
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4}'],
                    runtimeCaching: [{
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365
                            }
                        }
                    }]
                }
            })
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            }
        },
        define: {
            'process.env': {},
        },
        server: {
            port: 5173
        }
    }
})
