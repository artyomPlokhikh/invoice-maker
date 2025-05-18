<template>
    <label class="block text-sm font-medium text-gray-700">Moje platební údaje</label>
    <div class="flex gap-2">
        <select
            v-model="selectedPM"
            class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm"
        >
            <option value="">Vyberte platební údaje</option>
            <option v-for="method in paymentMethodStore.paymentMethods" :key="method.iban" :value="method.iban">
                {{ method.name }}
            </option>
        </select>

        <button
            @click="openAddPayment"
            class="px-3 py-2 text-sm bg-jade-600 text-white hover:bg-jade-700 rounded-md"
        >+ Přidat
        </button>
    </div>

    <div v-if="paymentMethod">
        <div class="text-xs text-gray-500 mt-2 space-y-1">
            <div><span class="font-medium">Číslo účtu:</span> {{ paymentMethod.accountNumber }}</div>
            <div><span class="font-medium">IBAN:</span> {{ paymentMethod.iban }}</div>
            <div><span class="font-medium">SWIFT:</span> {{ paymentMethod.swift }}</div>
        </div>
        <button @click="openEditPayment" class="text-sm text-jade-600 font-medium">
            Upravit bankovní účet
        </button>
    </div>

    <PaymentModal
        v-model="showAddPaymentModal"
        :payment="editingPayment"
        @createPayment="onCreatePayment"
        @editPayment="onEditPayment"
    />

</template>

<script setup>
import { computed, ref } from "vue";
import PaymentModal from "@/components/PaymentModal.vue";
import { usePaymentMethodStore } from "@/stores/PaymentMethodStore.js";

const props = defineProps({ paymentMethod: Object });
const emit = defineEmits(['update:paymentMethod']);

const paymentMethodStore = usePaymentMethodStore();

const showAddPaymentModal = ref(false);
const editingPayment = ref(null);

const selectedPM = computed({
    get: () => props.paymentMethod?.iban || "",
    set: (iban) => {
        const pm = paymentMethodStore.findPaymentMethodByIban(iban) || null;
        emit('update:paymentMethod', pm);
    }
});

function openAddPayment() {
    editingPayment.value = {
        name: '',
        accountNumber: '',
        currency: 'CZK',
        iban: '',
        swift: ''
    };
    showAddPaymentModal.value = true;
}

function openEditPayment() {
    editingPayment.value = props.paymentMethod;
    showAddPaymentModal.value = true;
}

function onCreatePayment(payment) {
    const existing = paymentMethodStore.findPaymentMethodByIban(payment.iban);
    if (existing) {
        // New payment method with the same IBAN - update the existing one
        paymentMethodStore.updatePaymentMethod(payment);
    } else {
        // New payment method - add it to the store
        paymentMethodStore.addPaymentMethod(payment);
    }
    emit('update:paymentMethod', payment);
}

function onEditPayment(payment) {
    const existing = paymentMethodStore.findPaymentMethodByIban(payment.iban);
    if (existing) {
        // Update existing payment method
        paymentMethodStore.updatePaymentMethod(payment);
    } else {
        // iban changed - remove the old one and add the new one
        paymentMethodStore.addPaymentMethod(payment);
        paymentMethodStore.deletePaymentMethod(props.paymentMethod.iban);
    }
    emit('update:paymentMethod', payment);
}
</script>