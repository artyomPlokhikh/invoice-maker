<template>
    <ModalWindow
        :model-value="props.modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
    >
        <template #header>
            <h3 class="text-xl font-bold">Přidat platební metodu</h3>
        </template>

        <template #body>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Název</label>
                    <input type="text" v-model="newPayment.name"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Číslo účtu</label>
                    <input type="text" v-model="newPayment.accountNumber"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <button @click="emit('update:modelValue', false)" class="px-4 py-2 border border-gray-300 rounded-md">
                    Zrušit
                </button>
                <button @click="createPayment" class="px-4 py-2 bg-blue-600 text-white rounded-md">Přidat</button>
            </div>
        </template>
    </ModalWindow>
</template>

<script setup>
import ModalWindow from "@/components/ModalWindow.vue";
import { reactive } from "vue";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['createPayment', 'update:modelValue']);

const newPayment = reactive({
    name: '',
    accountNumber: '',
    iban: '',
    swift: ''
});

function createPayment() {
    if (!newPayment.accountNumber) return;

    const paymentPayload = { ...newPayment };

    Object.keys(newPayment).forEach(key => newPayment[key] = '');

    emit('update:modelValue', false);

    emit('createPayment', paymentPayload);
}
</script>