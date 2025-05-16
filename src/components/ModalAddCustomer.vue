<template>
    <ModalWindow
        :model-value="props.modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
    >
        <template #header>
            <h3 class="text-xl font-bold">Přidat nového odběratele</h3>
        </template>

        <template #body>
            <CustomerForm ref="customerForm" @update="updateCustomerData"/>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <button @click="emit('update:modelValue', false)" class="px-4 py-2 border border-gray-300 rounded-md">
                    Zrušit
                </button>
                <button @click="createCustomer" class="px-4 py-2 bg-jade-600 text-white rounded-md">Přidat</button>
            </div>
        </template>
    </ModalWindow>
</template>

<script setup>
import ModalWindow from "@/components/ModalWindow.vue";
import CustomerForm from "@/components/PersonForm.vue";
import { ref } from "vue";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['createCustomer', 'update:modelValue']);
const customerForm = ref(null);
const customerData = ref({});

function updateCustomerData(data) {
    customerData.value = data;
}

function createCustomer() {
    if (!customerData.value.ic) return;

    emit('createCustomer', {
        ...customerData.value,
        id: crypto.randomUUID()
    });
    emit('update:modelValue', false);
}
</script>