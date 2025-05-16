import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
    optimizeDeps: {
        include: ['jspdf', 'jspdf-autotable', 'qrcode']
    },
    plugins: [
        vue(),
        vueDevTools(),

    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            buffer: 'buffer',
        }
    },
    define: {
        'process.env': {},
    },
})
