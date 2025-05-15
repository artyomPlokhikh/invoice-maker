<template>
    <h3 class="text-lg font-semibold">Položky</h3>
    <div class="overflow-auto">
        <table class="min-w-full text-sm text-left">
            <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
                <th class="px-4 py-2"></th>
                <th class="px-4 py-2">Položka</th>
                <th class="px-4 py-2">Cena</th>
                <th class="px-4 py-2">Množství</th>
                <th class="px-4 py-2">Celkem</th>
                <th class="px-4 py-2">Akce</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-100" ref="itemsTableBody">
            <ItemRow
                v-for="(item, index) in items"
                :key="item.id || index"
                :item="item"
                :index="index"
                @dragStart="prepareForDrag"
                @remove="emit('removeItem', index)"
            />
            </tbody>
        </table>
    </div>
    <button @click="onAddItem" class="mt-2 text-blue-600 font-bold">+ Přidat řádek</button>
</template>

<script setup>
import { onMounted } from "vue";
import ItemRow from "@/components/ItemRow.vue";
import { useDraggableTable } from "@/composables/useDraggableTable.js";

const props = defineProps({
    items: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['removeItem', 'addItem']);

const { itemsTableBody, prepareForDrag } = useDraggableTable(props.items);

function onAddItem() {
    emit('addItem', {
        name: '',
        price: 0,
        quantity: 0
    });
}

onMounted(() => {
    if (props.items.length === 0) onAddItem();
});

</script>

<style scoped>
@keyframes pulse {
    0% {
        background-color: rgba(219, 234, 254, 0.5);
    }
    50% {
        background-color: rgba(191, 219, 254, 0.8);
    }
    100% {
        background-color: rgba(219, 234, 254, 0.5);
    }
}

.animate-pulse {
    animation: pulse 1s infinite;
}

table td {
    box-sizing: border-box;
    vertical-align: middle;
}

.cursor-move {
    user-select: none;
}

tr {
    transition: background-color 0.2s ease;
}
</style>