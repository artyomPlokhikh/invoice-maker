<template>
    <ModalWindow
        :model-value="props.modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
    >
        <template #header>
            <h3 class="text-xl font-bold">{{ isEditing ? 'Editovat platební metodu' : 'Přidat platební metodu' }}</h3>
        </template>

        <template #body>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Název účtu</label>
                    <input type="text" v-model="newPayment.name"
                           :placeholder="payment.name || 'např. Hlavní účet'"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Číslo účtu</label>
                    <input type="text" v-model="newPayment.accountNumber"
                           :placeholder="payment.accountNumber"
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
                <button
                    @click="createPayment"
                    :disabled="!requiredFieldsFilled"
                    class="px-4 py-2 bg-jade-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {{ isEditing ? 'Uložit' : 'Přidat' }}
                </button>
            </div>
        </template>
    </ModalWindow>
</template>

<script setup>
import ModalWindow from "@/components/ModalWindow.vue";
import { bankCodes } from '@/data/bankCodes';
import { computed, reactive, watch } from "vue";
import { generateCzechIban, getSwiftByBankCode } from "@/utils/paymentUtils.js";

const props = defineProps({
    modelValue: Boolean,
    payment: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['createPayment', 'editPayment', 'update:modelValue']);

const isEditing = computed(() => !!props.payment.iban);
const newPayment = reactive({ ...props.payment });
watch(
    () => props.payment,
    (val) => {
        Object.assign(newPayment, val || {});
    },
    { immediate: true }
);

function createPayment() {
    if (!requiredFieldsFilled.value) return;

    const paymentPayload = {
        ...newPayment,
        iban: generateCzechIban(newPayment.accountNumber, newPayment.code),
        swift: getSwiftByBankCode(newPayment.code),
    };

    Object.keys(newPayment).forEach(key => newPayment[key] = '');

    emit('update:modelValue', false);
    emit(isEditing ? 'createPayment' : 'editPayment', paymentPayload);
}

const requiredFieldsFilled = computed(() =>
    !!newPayment.name && !!newPayment.accountNumber && !!newPayment.code && !!newPayment.currency
);
</script>