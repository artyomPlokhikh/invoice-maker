<template>
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Faktury</h2>
        <button @click="goToAddInvoice" class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm shadow">
            + Nová faktura
        </button>
    </div>

    <div class="overflow-auto rounded-xl shadow bg-white border border-gray-200">
        <table class="min-w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
                <th v-for="col in tableColumns" class="px-6 py-4 border-b border-gray-200">
                    {{ col }}
                </th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
            <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{{ invoice.invoiceNumber }}</td>
                <td class="px-6 py-4">
                    <div
                        :class="getStatusColor(invoice.status)"
                        class="w-3 h-3 rounded-full"
                        :title="getStatusText(invoice.status)">
                    </div>
                </td>
                <td class="px-6 py-4 max-w-[150px] truncate" :title="invoice.description">
                    {{ invoice.description }}
                </td>
                <td class="px-6 py-4 max-w-[150px] truncate">{{ invoice.customer }}</td>
                <td class="px-6 py-4">{{ invoice.issueDate }}</td>
                <td class="px-6 py-4">{{ invoice.dueDate }}</td>
                <td class="px-6 py-4">{{ formatAmount(invoice.amount) }}</td>
                <td class="px-6 py-4 flex items-center space-x-2">
                    <button class="text-gray-500 hover:text-blue-600" title="Upravit">✏️</button>
                    <button class="text-gray-500 hover:text-yellow-600" title="Duplikovat">📄</button>
                    <button class="text-gray-500 hover:text-red-600" title="Export do PDF">📥</button>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { useInvoiceStore } from '@/stores/invoiceStore';
import { storeToRefs } from 'pinia';
import { useRouter } from "vue-router";

const invoiceStore = useInvoiceStore();
const { invoices } = storeToRefs(invoiceStore);

const router = useRouter();

const goToAddInvoice = () => {
    router.push({ name: 'InvoiceForm' });
};

const tableColumns = ['Číslo dokladu', 'Stav', 'Popis', 'Odběratel', 'Vystaveno', 'Splatnost', 'Cena', 'Akce'];

const getStatusColor = (status) => {
    switch (status) {
        case 'paid':
            return 'bg-green-500';
        case 'unpaid':
            return 'bg-yellow-400';
        case 'overdue':
            return 'bg-red-500';
        default:
            return 'bg-gray-300';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'paid':
            return 'Uhrazeno';
        case 'unpaid':
            return 'Neuhrazeno';
        case 'overdue':
            return 'Po splatnosti';
        default:
            return 'Neznámý stav';
    }
};

const formatAmount = (amount) => {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
        minimumFractionDigits: 0
    }).format(amount);
};
</script>