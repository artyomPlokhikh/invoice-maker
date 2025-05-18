import { defineStore } from "pinia";
import { ref } from "vue";

export const useCustomerStore = defineStore('customers', () => {
    const customers = ref([]);

    function findCustomerByIc(ic) {
        return customers.value.find(customer => customer.ic === ic);
    }

    function addCustomer(customer) {
        if (findCustomerByIc(customer.ic)) return;
        customers.value.push(customer);
    }

    function deleteCustomer(ic) {
        const index = customers.value.findIndex(customer => customer.ic === ic);
        if (index !== -1) {
            customers.value.splice(index, 1);
        }
    }

    return {
        customers,
        findCustomerByIc,
        addCustomer,
        deleteCustomer,
    };
}, { persist: true });
