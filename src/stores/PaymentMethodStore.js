import { defineStore } from "pinia";
import { ref } from "vue";

export const usePaymentMethodStore = defineStore('paymentMethods', () => {
    const paymentMethods = ref([]);


    return {
        paymentMethods
    };
}, { persist: true });
