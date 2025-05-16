import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: HomeView
        },
        {
            path: '/invoice/:number?',
            name: 'InvoiceForm',
            component: () => import('@/views/InvoiceFormView.vue')
        },
        {
            path: '/settings',
            name: 'Settings',
            component: () => import('@/views/SettingsView.vue')
        },
        {
            path: '/invoice-preview/:number?',
            name: 'InvoicePreview',
            component: () => import('@/views/InvoicePreviewView.vue')
        }
    ]
})

export default router
