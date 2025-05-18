<template>
    <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold">Položky</h3>
            <span class="text-gray-400 text-sm">({{ items.length }})</span>
        </div>
        <button @click="openClickupModal"
                class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition">ClickUp
        </button>
    </div>
    <div class="overflow-auto">
        <table class="min-w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
                <th class="px-4 py-2"></th>
                <th class="px-4 py-2">Položka</th>
                <th class="px-4 py-2">
                    Cena
                    <button @click="showPriceMenu = !showPriceMenu" class="ml-1 text-gray-500 hover:text-jade-600">
                        <span class="text-xs">⚙️</span>
                    </button>
                    <div v-if="showPriceMenu"
                         class="absolute mt-1 bg-white shadow-lg rounded-md border border-gray-200 p-3 z-10">
                        <div class="text-xs font-normal mb-2">Nastavit výchozí cenu</div>
                        <div class="flex gap-2 items-center">
                            <input
                                type="number"
                                v-model="defaultPrice"
                                class="border rounded px-2 py-1 w-24"
                                placeholder="0.00"
                            />
                            <button
                                @click="applyDefaultPrice"
                                class="bg-jade-600 text-white px-2 py-1 rounded text-xs"
                            >
                                Použít
                            </button>
                        </div>
                    </div>
                </th>
                <th class="px-4 py-2 cursor-pointer select-none" @click="sortBy('quantity')">
                    Množství
                    <span v-if="sortKey === 'quantity'">
                        <span v-if="sortOrder === 1">▲</span>
                        <span v-else>▼</span>
                    </span>
                </th>
                <th class="px-4 py-2">Celkem</th>
                <th class="px-4 py-2">Akce</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-100" ref="itemsTableBody">
            <ItemRow
                v-for="(item, index) in props.items"
                :key="item.id || index"
                :item="item"
                :index="index"
                :defaultPrice="defaultPrice"
                @dragStart="prepareForDrag"
                @remove="removeItem(index)"
            />
            </tbody>
        </table>
    </div>
    <button @click="addItem" class="mt-2 text-jade-600 font-bold">+ Přidat řádek</button>

    <ModalWindow v-model="showClickupModal">
        <template #header>
            <h3 class="text-lg leading-6 font-medium text-gray-900">Import z ClickUp</h3>
        </template>
        <template #body>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Datum od</label>
                    <input
                        type="date"
                        v-model="startDate"
                        class="border rounded w-full px-3 py-2"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Datum do</label>
                    <input
                        type="date"
                        v-model="endDate"
                        class="border rounded w-full px-3 py-2"
                    />
                </div>
            </div>
        </template>
        <template #footer>
            <button
                @click="getFromClickup"
                class="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
                Importovat
            </button>
            <button
                @click="showClickupModal = false"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
                Zrušit
            </button>
        </template>
    </ModalWindow>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import ItemRow from "@/components/ItemRow.vue";
import ModalWindow from "@/components/ModalWindow.vue";
import { useDraggableTable } from "@/composables/useDraggableTable.js";
import { getTimeEntries } from "@/services/clickup.js";

const props = defineProps({ items: Object });
const emit = defineEmits(['update:items']);

const { itemsTableBody, prepareForDrag } = useDraggableTable(props.items);
const showPriceMenu = ref(false);
const defaultPrice = ref(0);

const showClickupModal = ref(false);
const startDate = ref(getFirstDayOfPrevMonth());
const endDate = ref(getLastDayOfPrevMonth());

function getFirstDayOfPrevMonth() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1, 1);
    return date.toISOString().split('T')[0];
}

function getLastDayOfPrevMonth() {
    const date = new Date();
    date.setDate(0);
    return date.toISOString().split('T')[0];
}

function openClickupModal() {
    showClickupModal.value = true;
}

function addItem(newItem = {}) {
    emit('update:items', [...props.items, newItem]);
}

function removeItem(index) {
    const updated = props.items.slice();
    updated.splice(index, 1);
    emit('update:items', updated);
}

function applyDefaultPrice() {
    const updated = props.items.map(item => {
        if (!item.price || item.price === '' || item.price === 0) {
            return { ...item, price: Number(defaultPrice.value) };
        }
        return item;
    });
    emit('update:items', updated);
    showPriceMenu.value = false;
}

function handleClickOutside(event) {
    if (showPriceMenu.value && !event.target.closest('button[class*="ml-1"]') &&
        !event.target.closest('div[class*="absolute mt-1"]')) {
        showPriceMenu.value = false;
    }
}

async function getFromClickup() {
    const timeEntries = await getTimeEntries(startDate.value, endDate.value);
    const newItems = [];
    for (const entry of Object.values(timeEntries)) {
        newItems.push({
            name: entry.name,
            price: defaultPrice.value || 0,
            quantity: entry.hours,
        });
    }
    emit('update:items', [...props.items, ...newItems]);
    showClickupModal.value = false;
}

const sortKey = ref(null);
const sortOrder = ref(1);

function sortBy(key) {
    if (sortKey.value === key) {
        sortOrder.value *= -1;
    } else {
        sortKey.value = key;
        sortOrder.value = 1;
    }
    const itemsToSort = [...props.items];
    itemsToSort.sort((a, b) => {
        const aVal = a[key] ?? 0;
        const bVal = b[key] ?? 0;
        return (aVal - bVal) * sortOrder.value;
    });
    emit('update:items', itemsToSort);
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>