import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'invoice',
            component: HomeView
        },
        {
            path: '/invoice',
            name: 'InvoiceForm',
            component: () => import('@/views/InvoiceFormView.vue')
        }
    ]
})

export default router
