<template>
    <tr :class="rowClasses" :data-index="index">
        <td class="px-4 py-2 cursor-move" title="Přesunout" @mousedown="onDragStart">☰</td>
        <td class="px-4 py-2">
            <input type="text" v-model="item.name"
                   @focus="$event.target.select()"
                   class="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
        </td>
        <td class="px-4 py-2">
            <input type="text" v-model="priceInput"
                   @focus="$event.target.select()"
                   @blur="formatPriceOnBlur"
                   class="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                   placeholder="0,00"
            />
        </td>
        <td class="px-4 py-2 flex items-center">
            <input type="text" v-model="timeInput"
                   @focus="$event.target.select()"
                   @blur="formatTimeOnBlur"
                   class="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm"
                   placeholder="0h 0m"
            />
            <select class="ml-1 border border-gray-300 rounded-md px-2 py-1 text-sm">
                <option value="h">hodiny</option>
            </select>
        </td>
        <td class="px-4 py-2">{{ formattedTotal }}</td>
        <td class="px-4 py-2">
            <button @click="onRemoveClick" class="text-red-600 hover:text-red-800" title="Smazat">🗑️</button>
        </td>
    </tr>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { calculateItemTotal, formatPrice } from "@/utils/priceUtils";
import { useDraggableTable } from "@/composables/useDraggableTable.js";
import { formatTimeValue, parseTimeInput } from "@/utils/formatters.js";

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    defaultPrice: Number,
});

const emit = defineEmits(['remove', 'dragStart']);

const priceInput = ref(String(props.item.price));

const formatPriceOnBlur = () => {
    const value = parseFloat(priceInput.value.replace(',', '.')) || 0;
    props.item.price = value;
    priceInput.value = value.toLocaleString('cs-CZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const timeInput = ref(formatTimeValue(props.item.quantity));

function formatTimeOnBlur() {
    props.item.quantity = parseTimeInput(timeInput.value);
    timeInput.value = formatTimeValue(props.item.quantity);
}

const formattedTotal = computed(() => {
    return formatPrice(calculateItemTotal(props.item));
});


const { draggedItemIndex, isDragTarget } = useDraggableTable(props);

const rowClasses = computed(() => ({
    'hover:bg-gray-50': draggedItemIndex !== props.index,
    'bg-jade-50': draggedItemIndex === props.index,
    'animate-pulse bg-gray-100': isDragTarget === props.index
}));

function onDragStart(event) {
    emit('dragStart', props.index, event);
}

function onRemoveClick() {
    emit('remove', props.index);
}

watch(() => props.item.quantity, (newVal) => {
    timeInput.value = formatTimeValue(newVal);
});

watch(
    () => props.item.price,
    (newVal) => {
        priceInput.value = (newVal ?? 0).toLocaleString('cs-CZ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
);
</script>