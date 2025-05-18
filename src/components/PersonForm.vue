<template>
    <div class="space-y-4">
        <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">IČ</label>
            <input
                type="text"
                v-model="person.ic"
                :placeholder="initialData.ic || 'Zadejte IČ'"
                @focus="$event.target.select()"
                @input="handleIcInput"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <div
                v-if="aresSuggestion && !isLoading"
                class="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow max-h-40 overflow-y-auto w-full text-sm"
            >
                <div
                    @mousedown.capture="fillFromSuggestion"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
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
            <input
                type="text"
                v-model="person.name"
                :placeholder="initialData.name"
                class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
                disabled
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
            <input
                type="text"
                v-model="person.address"
                :placeholder="initialData.address"
                class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
                disabled
            />
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">DIČ</label>
            <input
                type="text"
                v-model="person.dic"
                :placeholder="initialData.dic"
                class="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
                disabled
            />
        </div>
    </div>

</template>

<script setup>
import { reactive, ref, defineProps, watch } from "vue";
import { getSubjectByICO } from "@/services/ares";

const props = defineProps({
    initialData: {
        type: Object,
        default: () => ({
            name: "",
            ic: "",
            dic: "",
            address: "",
        }),
    },
});

const emit = defineEmits(['update']);

const person = reactive({ ...props.initialData });
const aresSuggestion = ref(null);
const isLoading = ref(false);
const error = ref("");
let debounceTimeout = null;

watch(person, () => {
    emit('update', { ...person });
}, { deep: true });

function handleIcInput() {
    aresSuggestion.value = null;
    error.value = "";

    person.name = "";
    person.dic = "";
    person.address = "";

    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (person.ic.length !== 8) return;

    isLoading.value = true;
    debounceTimeout = setTimeout(async () => {
        try {
            aresSuggestion.value = await getSubjectByICO(person.ic);
        } catch (err) {
            error.value = "Nepodařilo se načíst data z ARES";
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }, 500);
}

function fillFromSuggestion() {
    if (aresSuggestion.value) {
        person.name = aresSuggestion.value.name;
        person.dic = aresSuggestion.value.dic;
        person.address = aresSuggestion.value.address;
        aresSuggestion.value = null;
        emit('update', { ...person });
    }
}

function getPersonData() {
    return { ...person };
}

defineExpose({
    getPersonData,
});
</script>