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
                <div class="relative">
                    <label class="block text-sm font-medium text-gray-700 mb-1">IČ</label>
                    <input type="text" v-model="newCustomer.ic"
                           @input="handleIcInput"
                           class="w-full border border-gray-300 rounded-md px-3 py-2"/>
                    <div v-if="aresSuggestion && !isLoading"
                         class="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow max-h-40 overflow-y-auto w-full text-sm">
                        <div @mousedown.capture="fillFromSuggestion"
                             class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                            {{ aresSuggestion.name }}
                        </div>
                    </div>
                    <div v-if="isLoading" class="text-sm text-gray-500 mt-1">
                        Načítání dat...
                    </div>
                    <div v-if="error" class="text-sm text-red-500 mt-1">
                        {{ error }}
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Jméno/Název</label>
                    <input type="text" v-model="newCustomer.name"
                           class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-400 cursor-not-allowed"
                           disabled
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                    <input type="text" v-model="newCustomer.address"
                              class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-400 cursor-not-allowed"
                           disabled
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">DIČ</label>
                    <input type="text" v-model="newCustomer.dic"
                           class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-400 cursor-not-allowed"
                           disabled
                    />
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
import { reactive, ref } from "vue";
import { getSubjectByICO } from "@/services/ares";

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

const aresSuggestion = ref(null);
const isLoading = ref(false);
const error = ref('');
let debounceTimeout = null;

function createCustomer() {
    if (!newCustomer.ic) return;

    const customerPayload = { ...newCustomer };

    Object.keys(newCustomer).forEach(key => newCustomer[key] = '');
    aresSuggestion.value = null;

    emit('update:modelValue', false);

    emit('createCustomer', customerPayload);
}

function handleIcInput() {
    aresSuggestion.value = null;
    error.value = '';

    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (newCustomer.ic.length !== 8) return;

    isLoading.value = true;
    debounceTimeout = setTimeout(async () => {
        try {
            aresSuggestion.value = await getSubjectByICO(newCustomer.ic);
        } catch (err) {
            error.value = 'Nepodařilo se načíst data z ARES';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }, 500);
}

function fillFromSuggestion() {
    if (aresSuggestion.value) {
        newCustomer.name = aresSuggestion.value.name;
        newCustomer.dic = aresSuggestion.value.dic;
        newCustomer.address = aresSuggestion.value.address;
        aresSuggestion.value = null;
    }
}
</script>