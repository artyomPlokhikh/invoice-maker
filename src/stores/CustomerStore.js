import { defineStore } from "pinia";
import { ref } from "vue";

export const useCustomerStore = defineStore('customers', () => {
    const customers = ref([
        {
            name: 'TechFirma s.r.o.',
            ic: '12345678',
            dic: 'CZ12345678',
            address: 'Ulice 12, Praha'
        },
        {
            name: 'Jan Novák',
            ic: '87654321',
            dic: 'CZ87654321',
            address: 'Náměstí 1, Brno'
        }, {
            name: 'Startup XYZ',
            ic: '11223344',
            dic: 'CZ11223344',
            address: 'Dlouhá 42, Ostrava'
        }
    ]);


    return {
        customers
    };
}, { persist: true });
