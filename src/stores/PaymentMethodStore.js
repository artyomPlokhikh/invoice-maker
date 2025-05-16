import { defineStore } from "pinia";
import { ref } from "vue";

export const usePaymentMethodStore = defineStore('paymentMethods', () => {
    const paymentMethods = ref([
        {
            name: 'Fio banka CZK',
            accountNumber: '123456789/2010',
            iban: 'CZ65 2010 0000 0012 3456 7890',
            swift: 'FIOBCZPPXXX'
        },
        {
            name: 'ČSOB EUR',
            accountNumber: '987654321/0300',
            iban: 'CZ55 0300 0000 0009 8765 4321',
            swift: 'CEKOCZPP'
        }
    ]);


    return {
        paymentMethods
    };
}, { persist: true });
