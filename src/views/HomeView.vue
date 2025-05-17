<template>
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Faktury</h2>
        <button @click="goToInvoiceForm"
                class="bg-jade-600 text-white px-4 py-2 rounded-xl hover:bg-jade-700 transition text-sm shadow">
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
            <tr v-for="invoice in sortedInvoices" :key="invoice.number" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">{{ invoice.number }}</td>
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
                <td class="px-6 py-4 max-w-[150px] truncate">{{ invoice.customer?.name }}</td>
                <td class="px-6 py-4">{{ invoice.issueDate }}</td>
                <td class="px-6 py-4">{{ invoice.dueDate }}</td>
                <td class="px-6 py-4">{{ formatAmount(invoice.amount) }}</td>
                <td class="px-6 py-4 flex items-center space-x-2">
                    <button @click="editInvoice(invoice.number)"
                            class="text-gray-500 hover:text-blue-600"
                            title="Upravit">✏️
                    </button>
                    <button @click="duplicateInvoice(invoice.number)"
                            class="text-gray-500 hover:text-yellow-600"
                            title="Duplikovat">📄
                    </button>
                    <button @click="goToInvoicePreview(invoice)"
                            class="text-gray-500 hover:text-red-600"
                            title="Export do PDF">📥
                    </button>
                    <button @click="deleteInvoice(invoice.number)"
                            class="text-gray-500 hover:text-red-600"
                            title="Smazat">🗑️
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { useInvoiceStore } from '@/stores/InvoiceStore.js';
import { storeToRefs } from 'pinia';
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { computed } from "vue";


const invoiceStore = useInvoiceStore();
const { invoices } = storeToRefs(invoiceStore);
const sortedInvoices = computed(() => {
    return [...invoices.value].sort((a, b) => Number(b.number) - Number(a.number));
});

const router = useRouter();
const goToInvoiceForm = () => router.push({ name: 'InvoiceForm' });
const goToInvoicePreview = (invoice) => router.push({ name: 'InvoicePreview', params: { number: invoice.number } });
const editInvoice = (number) => router.push({ name: 'InvoiceForm', params: { number } });

const duplicateInvoice = (number) => {
    const originalInvoice = invoiceStore.invoices.find(invoice => invoice.number === number);
    if (originalInvoice) {
        const newInvoice = { ...originalInvoice, number: invoiceStore.generateUniqueInvoiceNumber() };
        invoiceStore.invoices.push(newInvoice);
    }
}
const deleteInvoice = (number) => {
    Swal.fire({
        title: "Opravdu chcete smazat tuto fakturu?",
        text: "Nebudete ji moci vrátit zpět!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: '#00bd7e', // jade-500
        cancelButtonText: "Zrušit",
        confirmButtonText: "Ano, smazat"
    }).then((result) => {
        if (result.isConfirmed) {
            invoiceStore.invoices = invoiceStore.invoices.filter(invoice => invoice.number !== number);
        }
    });
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