<template>
    <label class="block text-sm font-medium text-gray-700">Moje platební údaje</label>
    <div class="flex gap-2">
        <select v-model="invoice.paymentMethod"
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm">
            <option v-for="(method, index) in paymentMethods" :key="index" :value="method">
                {{ method.name }}
            </option>
        </select>
        <button @click="showAddPaymentModal = true"
                class="px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md">+ Přidat
        </button>
    </div>
    <div v-if="invoice.paymentMethod" class="text-xs text-gray-500 mt-2 space-y-1">
        <div><span class="font-medium">Číslo účtu:</span> {{ invoice.paymentMethod.accountNumber }}</div>
        <div><span class="font-medium">IBAN:</span> {{ invoice.paymentMethod.iban }}</div>
        <div><span class="font-medium">SWIFT:</span> {{ invoice.paymentMethod.swift }}</div>
    </div>

    <PaymentModal
        v-model="showAddPaymentModal"
        @createPayment="onCreatePayment"
    />

</template>

<script setup>
import { onMounted, ref } from "vue";
import PaymentModal from "@/components/PaymentModal.vue";

const props = defineProps({
    invoice: {
        type: Object,
        required: true
    },
})

// Dummy data
const paymentMethods = ref([
    {
        name: 'Fio banka CZK',
        accountNumber: '123456789/2010',
        iban: 'CZ65 2010 0000 0012 3456 7890',
        swift: 'FIOBCZPPXXX'
    },
    { name: 'ČSOB EUR', accountNumber: '987654321/0300', iban: 'CZ55 0300 0000 0009 8765 4321', swift: 'CEKOCZPP' }
]);
//

const showAddPaymentModal = ref(false);

function onCreatePayment(payment) {
    paymentMethods.value.push({ ...payment });
    props.invoice.paymentMethod = { ...payment };
    Object.keys(payment).forEach(key => payment[key] = '');
}

onMounted(() => {
    if (paymentMethods.value.length > 0) {
        props.invoice.paymentMethod = paymentMethods.value[0];
    }
});
</script>