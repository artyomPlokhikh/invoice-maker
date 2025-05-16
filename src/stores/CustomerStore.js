import { defineStore } from "pinia";
import { ref } from "vue";

export const useCustomerStore = defineStore('customers', () => {
    const customers = ref([]);

    return {
        customers
    };
}, { persist: true });
