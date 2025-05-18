<template>
    <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Odběratel</label>
        <div>
            <select
                v-model="selectedCustomerId"
                class="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring focus:ring-jade-200 text-sm"
            >
                <option value="">Vyberte zákazníka</option>
                <option v-for="customer in customerStore.customers" :key="customer.ic" :value="customer.ic">
                    {{ customer.name }}
                </option>
            </select>
        </div>
        <button @click="showAddCustomerModal = true" class="mt-1 text-jade-600 font-bold">+ Přidat</button>

        <div v-if="customer" class="texts-xs text-gray-500 mt-2 space-y-1">
            <div><span class="font-medium">IČ:</span> {{ customer.ic }}</div>
            <div v-if="customer.dic"><span class="font-medium">DIČ:</span> {{ customer.dic }}</div>
            <div><span class="font-medium">Sídlo:</span> {{ customer.address }}</div>
        </div>
    </div>

    <ModalAddCustomer
        v-model="showAddCustomerModal"
        @createCustomer="onCreateCustomer"
    />
</template>
<script setup>
import { ref, computed } from "vue";
import ModalAddCustomer from "@/components/ModalAddCustomer.vue";
import { useCustomerStore } from "@/stores/CustomerStore.js";

const props = defineProps({ customer: Object });
const emit = defineEmits(['update:customer']);

const customerStore = useCustomerStore();

const showAddCustomerModal = ref(false);

const selectedCustomerId = computed({
    get: () => props.customer?.ic || "",
    set: (ic) => {
        const customer = customerStore.findCustomerByIc(ic) || null;
        emit('update:customer', customer);
    }
});

function onCreateCustomer(newCustomer) {
    const found = customerStore.findCustomerByIc(newCustomer.ic);
    if (found) {
        emit('update:customer', found);
    } else {
        customerStore.addCustomer(newCustomer);
        emit('update:customer', newCustomer);
    }
}
</script>