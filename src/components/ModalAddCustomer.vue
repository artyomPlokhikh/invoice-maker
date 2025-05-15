<template>
    <ModalWindow
        :model-value="props.modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
    >
        <template #header>
            <h3 class="text-xl font-bold">Přidat nového odběratele</h3>
        </template>

        <template #body>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">IČ</label>
                    <input type="text" v-model="newCustomer.ic"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Jméno/Název</label>
                    <input type="text" v-model="newCustomer.name"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">DIČ</label>
                    <input type="text" v-model="newCustomer.dic"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                    <textarea v-model="newCustomer.address" rows="2"
                              class="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <button @click="emit('update:modelValue', false)" class="px-4 py-2 border border-gray-300 rounded-md">
                    Zrušit
                </button>
                <button @click="createCustomer" class="px-4 py-2 bg-blue-600 text-white rounded-md">Přidat</button>
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

const emit = defineEmits(['createCustomer', 'update:modelValue']);

const newCustomer = reactive({
    name: '',
    ic: '',
    dic: '',
    address: ''
});

function createCustomer() {
    if (!newCustomer.ic) return;

    const customerPayload = { ...newCustomer };

    Object.keys(newCustomer).forEach(key => newCustomer[key] = '');

    emit('update:modelValue', false);

    emit('createCustomer', customerPayload);
}
</script>