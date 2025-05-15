<template>
    <tr :class="rowClasses" :data-index="index">
        <td class="px-4 py-2 cursor-move" title="Přesunout" @mousedown="onDragStart">☰</td>
        <td class="px-4 py-2">
            <input type="text" v-model="item.name"
                   class="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
        </td>
        <td class="px-4 py-2">
            <input type="text" v-model="item.price"
                   class="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                   placeholder="23,00"
            />
        </td>
        <td class="px-4 py-2">
            <input type="text" v-model="item.quantity"
                   class="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                   placeholder="23h 30m"
            />
        </td>
        <td class="px-4 py-2">{{ formattedTotal }}</td>
        <td class="px-4 py-2">
            <button @click="onRemoveClick" class="text-red-600 hover:text-red-800" title="Smazat">🗑️</button>
        </td>
    </tr>
</template>

<script setup>
import { computed } from 'vue';
import { calculateItemTotal, formatPrice } from "@/utils/priceUtils";
import { useDraggableTable } from "@/composables/useDraggableTable.js";

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
});

const emit = defineEmits(['remove', 'dragStart']);

const { draggedItemIndex, isDragTarget } = useDraggableTable(props);

const rowClasses = computed(() => ({
    'hover:bg-gray-50': draggedItemIndex !== props.index,
    'bg-blue-50': draggedItemIndex === props.index,
    'animate-pulse bg-gray-100': isDragTarget === props.index
}));

const formattedTotal = computed(() => {
    return formatPrice(calculateItemTotal(props.item));
});

function onDragStart(event) {
    emit('dragStart', props.index, event);
}

function onRemoveClick() {
    emit('remove', props.index);
}
</script>