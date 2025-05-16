<template>
    <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Odběratel</label>
        <div>
            <select
                v-model="selectedCustomerId"
                class="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring focus:ring-blue-200 text-sm"
            >
                <option value="">Vyberte zákazníka</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                    {{ customer.name }}
                </option>
            </select>
        </div>
        <button @click="showAddCustomerModal = true" class="mt-1 text-blue-600 font-bold">+ Přidat</button>

        <div v-if="invoice.customer" class="texts-xs text-gray-500 mt-2 space-y-1">
            <div><span class="font-medium">IČ:</span> {{ invoice.customer.ic }}</div>
            <div v-if="invoice.customer.dic"><span class="font-medium">DIČ:</span> {{ invoice.customer.dic }}</div>
            <div><span class="font-medium">Sídlo:</span> {{ invoice.customer.address }}</div>
        </div>
    </div>

    <ModalAddCustomer
        v-model="showAddCustomerModal"
        @createCustomer="onCreateCustomer"
    />
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import ModalAddCustomer from "@/components/ModalAddCustomer.vue";
import { useCustomerStore } from "@/stores/CustomerStore.js";
import { storeToRefs } from "pinia";

const props = defineProps({
    invoice: {
        type: Object,
        required: true
    },
});

const customerStore = useCustomerStore();
const { customers } = storeToRefs(customerStore);

const showAddCustomerModal = ref(false);

const selectedCustomerId = ref(props.invoice.customer?.id || "");

watch(selectedCustomerId, (id) => {
    const customer = customers.value.find(c => c.id === id);
    if (customer) {
        props.invoice.customer = customer;
    }
});

watch(() => props.invoice.customer, (customer) => {
    selectedCustomerId.value = customer?.id || "";
});

function onCreateCustomer(newCustomer) {
    customers.value.push({ ...newCustomer });
    props.invoice.customer = { ...newCustomer };
    selectedCustomerId.value = newCustomer.id;
}

onMounted(() => {
    selectedCustomerId.value = props.invoice.customer?.id || "";
});
</script>