<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title"
                 role="dialog" aria-modal="true"
            >
                <div class="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0"
                >
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                         @click="closeOnBackdrop && emit('update:modelValue', false)"
                    ></div>

                    <div
                        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    >
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b">
                            <slot name="header">
                                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Modal Title
                                </h3>
                            </slot>
                        </div>

                        <div class="bg-white px-4 py-5 sm:p-6">
                            <slot name="body">
                                <p class="text-sm text-gray-500">
                                    Modal content goes here.
                                </p>
                            </slot>
                        </div>

                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
                            <slot name="footer">
                                <button type="button"
                                        @click="emit('update:modelValue', false)"
                                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Zavřít
                                </button>
                            </slot>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    closeOnBackdrop: {
        type: Boolean,
        default: true
    },
    closeOnEsc: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue']);

function handleKeyDown(event) {
    if (event.key === 'Escape' && props.closeOnEsc && props.modelValue) {
        emit('update:modelValue', false);
    }
}

watch(() => props.modelValue, (value) => {
    if (value) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.classList.add('modal-open');
    } else {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.classList.remove('modal-open');
    }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.modal-enter-from .transform,
.modal-leave-to .transform {
    transform: scale(0.95);
    opacity: 0;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

:global(body.modal-open) {
    overflow: hidden;
}
</style>
