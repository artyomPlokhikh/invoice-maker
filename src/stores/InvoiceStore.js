import { defineStore } from "pinia";
import { ref } from "vue";

export const useInvoiceStore = defineStore('invoices', () => {
    const invoices = ref([]);

    function generateUniqueInvoiceNumber() {
        const currentYear = (new Date().getFullYear()).toString();

        let maxNumber = 0;
        invoices.value.forEach(inv => {
            if (inv.number.startsWith((currentYear))) {
                const numPart = parseInt(inv.number.substring(4), 10);
                if (!isNaN(numPart) && numPart > maxNumber) {
                    maxNumber = numPart;
                }
            }
        });

        return `${currentYear}${(maxNumber + 1).toString().padStart(4, '0')}`;
    }

    return {
        invoices,
        generateUniqueInvoiceNumber,
    };
}, { persist: true });