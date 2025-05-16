import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore('user', () => {
    const user = ref({
        name: '',
        ic: '',
        dic: '',
        address: '',
        email: '',
    });

    return {
        user
    };
}, { persist: true });
