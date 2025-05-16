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
    <button @click="openEditPayment" class="text-sm text-blue-600 font-medium">
        Upravit bankovní účet
    </button>

    <PaymentModal
        v-model="showAddPaymentModal"
        :payment="editingPayment"
        @createPayment="onCreatePayment"
    />

</template>

<script setup>
import { onMounted, ref } from "vue";
import PaymentModal from "@/components/PaymentModal.vue";
import { usePaymentMethodStore } from "@/stores/PaymentMethodStore.js";
import { storeToRefs } from "pinia";

const props = defineProps({
    invoice: {
        type: Object,
        required: true
    },
})

const paymentMethodStore = usePaymentMethodStore();
const { paymentMethods } = storeToRefs(paymentMethodStore);

const showAddPaymentModal = ref(false);

function onCreatePayment(payment) {
    paymentMethods.value.push({ ...payment });
    props.invoice.paymentMethod = { ...payment };
    Object.keys(payment).forEach(key => payment[key] = '');
}

const editingPayment = ref(null);
function openEditPayment() {
    editingPayment.value = { ...props.invoice.paymentMethod };
    showAddPaymentModal.value = true;
}

onMounted(() => {
    if (paymentMethods.value.length > 0) {
        props.invoice.paymentMethod = paymentMethods.value[0];
    }
});
</script>