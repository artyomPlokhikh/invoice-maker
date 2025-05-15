import { defineStore } from "pinia";
import { ref } from "vue";

export const useInvoiceStore = defineStore('invoices', () => {
    const invoices = ref([
        {
            id: '1',
            invoiceNumber: '2025-0001',
            status: 'unpaid',
            description: 'Údržba serveru a správa',
            customer: 'TechFirma s.r.o.',
            issueDate: '2025-05-10',
            dueDate: '2025-05-20',
            amount: 15000
        },
        {
            id: '2',
            invoiceNumber: '2025-0002',
            status: 'paid',
            description: 'Vývoj webové aplikace',
            customer: 'Digital Solutions a.s.',
            issueDate: '2025-04-15',
            dueDate: '2025-04-30',
            amount: 32500
        },
        {
            id: '3',
            invoiceNumber: '2025-0003',
            status: 'overdue',
            description: 'Konzultace IT infrastruktury',
            customer: 'MarketPro s.r.o.',
            issueDate: '2025-03-20',
            dueDate: '2025-04-03',
            amount: 8750
        },
        {
            id: '4',
            invoiceNumber: '2025-0004',
            status: 'unpaid',
            description: 'Implementace API rozhraní',
            customer: 'E-commerce Plus',
            issueDate: '2025-05-02',
            dueDate: '2025-05-16',
            amount: 24000
        },
        {
            id: '5',
            invoiceNumber: '2025-0005',
            status: 'paid',
            description: 'Školení zaměstnanců',
            customer: 'Výrobní Podnik a.s.',
            issueDate: '2025-04-22',
            dueDate: '2025-05-06',
            amount: 12500
        }
    ]);

    return {
        invoices
    };
}, {
    persist: true
});