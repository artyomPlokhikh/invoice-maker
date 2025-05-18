<template>
    <span class="relative group">
        <button
            @click="showModal = true"
            class="bg-purple-600 text-white rounded hover:bg-purple-700 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="noClickupCredentials"
        >
            ClickUp
        </button>
        <span
            v-if="noClickupCredentials"
            class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 rounded bg-gray-800 text-xs text-white opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 text-center"
        >
            Nejprve nastavte ClickUp API token a Team ID v nastavení.
        </span>
    </span>

    <ModalWindow v-model="showModal">
        <template #header>
            <h3 class="text-lg leading-6 font-medium text-gray-900">Import z ClickUp</h3>
        </template>

        <template #body>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Datum od</label>
                    <input type="date" v-model="startDate" class="border rounded w-full px-3 py-2"/>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Datum do</label>
                    <input type="date" v-model="endDate" class="border rounded w-full px-3 py-2"/>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end gap-2">
                <button
                    @click="showModal = false"
                    class="px-4 py-2 border border-gray-300 rounded-md"
                >Zrušit
                </button>
                <button
                    @click="importFromClickup"
                    class="px-4 py-2 border border-gray-300 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!startDate || !endDate || startDate > endDate || noClickupCredentials"
                >Importovat
                </button>
            </div>
        </template>
    </ModalWindow>
</template>

<script setup>
import { computed, ref } from 'vue';
import ModalWindow from '@/components/ModalWindow.vue';
import { getTimeEntries } from '@/services/clickup';
import { useClickupStore } from '@/stores/ClickupStore.js';

const emit = defineEmits(['import']);

const showModal = ref(false);

const startDate = ref(firstDayPrevMonth());

function firstDayPrevMonth() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1, 1);
    return d.toISOString().split('T')[0];
}

const endDate = ref(lastDayPrevMonth());

function lastDayPrevMonth() {
    const d = new Date();
    d.setDate(0);
    return d.toISOString().split('T')[0];
}

async function importFromClickup() {
    const entries = await getTimeEntries(startDate.value, endDate.value);
    const newItems = Object.values(entries).map(e => ({
        name: e.name,
        price: 0,
        quantity: e.hours
    }));
    emit('import', newItems);
    showModal.value = false;
}

const clickupStore = useClickupStore();
const noClickupCredentials = computed(() => {
    return !clickupStore.apiToken || !clickupStore.teamId;
});
</script>