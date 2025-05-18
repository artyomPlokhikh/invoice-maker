<template>
    <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
            <h3 class="text-lg font-semibold">Položky</h3>
            <span class="text-gray-400 text-sm">({{ items.length }})</span>
        </div>
        <ClickupImport @import="addItems"/>
    </div>
    <div class="overflow-auto">
        <table class="min-w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
                <th class="px-4 py-2"></th>
                <th class="px-4 py-2">Položka</th>
                <th class="px-4 py-2">
                    <div class="flex items-center">
                        Cena
                        <button
                            @click="showPriceMenu = !showPriceMenu"
                            class="ml-1 text-gray-500 align-bottom"
                            title="Nastavit výchozí cenu"
                        >
                            <IconGear class="icon"/>
                        </button>
                    </div>
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
                    <span v-if="sortKey === 'quantity'" title="Seřadit podle množství">
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
            <template v-if="props.items.length === 0">
                <tr>
                    <td colspan="6" class="text-center text-gray-400 pt-4">
                        Žádné položky k zobrazení.
                    </td>
                </tr>
            </template>
            </tbody>
        </table>
    </div>
    <button @click="addItem" class="mt-2 text-jade-600 font-bold">+ Přidat řádek</button>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import ItemRow from "@/components/ItemRow.vue";
import { useDraggableTable } from "@/composables/useDraggableTable.js";
import IconGear from "@/components/svg/IconGear.vue";
import ClickupImport from "@/components/ClickupImport.vue";

const props = defineProps({ items: Object });
const emit = defineEmits(['update:items']);

const { itemsTableBody, prepareForDrag } = useDraggableTable(props.items);
const showPriceMenu = ref(false);
const defaultPrice = ref(0);

function addItem(newItem = {}) {
    newItem = {
        name: '',
        price: defaultPrice.value || 0,
        quantity: 0,
        ...newItem,
    };
    emit('update:items', [...props.items, newItem]);
}

function addItems(arr) {
    const updatedArr = arr.map(item => ({
        ...item,
        price: (!item.price && defaultPrice.value) ? Number(defaultPrice.value) : item.price
    }));
    emit('update:items', [...props.items, ...updatedArr]);
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