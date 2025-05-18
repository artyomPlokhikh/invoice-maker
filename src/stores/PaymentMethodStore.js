import { defineStore } from "pinia";
import { ref } from "vue";

export const usePaymentMethodStore = defineStore('paymentMethods', () => {
    const paymentMethods = ref([]);

    function findPaymentMethodByIban(iban) {
        return paymentMethods.value.find(pm => pm.iban === iban);
    }

    function addPaymentMethod(pm) {
        if (findPaymentMethodByIban(pm.iban)) return;
        paymentMethods.value.push(pm);
    }

    function updatePaymentMethod(updated) {
        const index = paymentMethods.value.findIndex(pm =>
            pm.iban === updated.iban
        );
        if (index !== -1) Object.assign(paymentMethods.value[index], updated);
    }

    function deletePaymentMethod(iban) {
        const index = paymentMethods.value.findIndex(pm => pm.iban === iban);
        if (index !== -1) paymentMethods.value.splice(index, 1);
    }

    return {
        paymentMethods,
        findPaymentMethodByIban,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
    };
}, { persist: true });
