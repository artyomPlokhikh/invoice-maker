<template>
    <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">Odběratel</label>
        <div class="relative">
            <input type="text" placeholder="Zadejte jméno firmy nebo osoby"
                   v-model="customerSearchQuery"
                   @focus="showCustomerDropdown = true"
                   @blur="showCustomerDropdown = false"
                   @input="filterCustomers"
                   class="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 shadow-sm focus:outline-none focus:ring focus:ring-blue-200 text-sm"
            />

            <button class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    @click="showCustomerDropdown = !showCustomerDropdown"
                    title="Rozbalit">
                {{ showCustomerDropdown ? '▲' : '▼' }}
            </button>

            <div v-if="showCustomerDropdown && filteredCustomers.length > 0"
                 class="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow max-h-40 overflow-y-auto w-full text-sm"
            >

                <div v-for="(customer, index) in filteredCustomers"
                     :key="index"
                     @mousedown.capture="selectCustomer(customer)"
                     class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    {{ customer.name }}
                </div>
            </div>
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
import { onMounted, ref, watch } from "vue";
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

const customerSearchQuery = ref('');
const filteredCustomers = ref([]);
const showCustomerDropdown = ref(false);
const showAddCustomerModal = ref(false);


function filterCustomers() {
    if (!customerSearchQuery.value) {
        filteredCustomers.value = customers.value;
        return;
    }

    const query = customerSearchQuery.value.toLowerCase();
    filteredCustomers.value = customers.value.filter(
        customer => customer.name.toLowerCase().includes(query)
    );
}

watch(() => customerSearchQuery.value, filterCustomers);

function selectCustomer(customer) {
    props.invoice.customer = customer;
    customerSearchQuery.value = customer.name;
    showCustomerDropdown.value = false;
}

function onCreateCustomer(newCustomer) {
    customers.value.push({ ...newCustomer });
    props.invoice.customer = { ...newCustomer };
    customerSearchQuery.value = newCustomer.name;
}

onMounted(() => {
    filterCustomers();
});
</script>