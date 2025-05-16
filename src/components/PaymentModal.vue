<template>
    <ModalWindow
        :model-value="props.modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
    >
        <template #header>
            <h3 class="text-xl font-bold">{{ props.payment.accountNumber ? 'Editovat platební metodu' : 'Přidat platební metodu' }}</h3>
        </template>

        <template #body>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Název účtu</label>
                    <input type="text" v-model="newPayment.name"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Číslo účtu</label>
                    <input type="text" v-model="newPayment.accountNumber"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Kód banky</label>
                    <select class="w-full border border-gray-300 rounded-md px-3 py-2" v-model="newPayment.code">
                        <option value="">– Kód banky –</option>
                        <option v-for="bank in bankCodes" :key="bank.code" :value="bank.code">
                            {{ `${bank.code} (${bank.name})` }}
                        </option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Měna</label>
                    <select class="w-full border border-gray-300 rounded-md px-3 py-2" v-model="newPayment.currency">
                        <option value="CZK">CZK</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <button @click="emit('update:modelValue', false)" class="px-4 py-2 border border-gray-300 rounded-md">
                    Zrušit
                </button>
                <button @click="createPayment" class="px-4 py-2 bg-jade-600 text-white rounded-md">Přidat</button>
            </div>
        </template>
    </ModalWindow>
</template>

<script setup>
import ModalWindow from "@/components/ModalWindow.vue";
import { bankCodes } from '@/data/bankCodes';
import { reactive, watch } from "vue";
import { generateCzechIban, getSwiftByBankCode } from "@/utils/paymentUtils.js";

const props = defineProps({
    modelValue: Boolean,
    payment: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['createPayment', 'update:modelValue']);

const newPayment = reactive({
    name: '',
    accountNumber: '',
    currency: 'CZK',
    iban: '',
    swift: '',
    code: ''
});

watch(() => props.payment, (val) => {
    if (val) {
        Object.assign(newPayment, val);
    }
});

function createPayment() {
    if (!newPayment.name || !newPayment.accountNumber || !newPayment.code) return;

    const paymentPayload = {
        ...newPayment,
        iban: generateCzechIban(newPayment.accountNumber, newPayment.code),
        swift: getSwiftByBankCode(newPayment.code),
    };

    Object.keys(newPayment).forEach(key => newPayment[key] = '');

    emit('update:modelValue', false);

    emit('createPayment', paymentPayload);
}
</script>