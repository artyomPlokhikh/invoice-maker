<template>
    <div class="container mx-auto py-6 px-4">
        <div class="bg-white p-6 rounded-xl shadow">
            <h2 class="text-2xl font-bold mb-6">Nastavení účtu</h2>

            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-4">Údaje o uživateli</h3>
                <div class="max-w-md">
                    <CustomerForm
                        ref="userForm"
                        :initialData="originalUser"
                    />
                    <div class="mt-4">
                        <button
                            @click="saveUserData"
                            class="px-4 py-2 bg-jade-600 text-white rounded-md hover:bg-jade-700"
                        >
                            Uložit údaje
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import CustomerForm from "@/components/PersonForm.vue";
import { useUserStore } from "@/stores/UserStore.js";
import Swal from "sweetalert2";
import { onBeforeRouteLeave, useRouter } from "vue-router";


const userStore = useUserStore();
const originalUser = ref(JSON.parse(JSON.stringify(userStore.user)));


const userForm = ref(null);

const router = useRouter();


function saveUserData() {
    if (userForm.value) {
        userStore.user = userForm.value.getPersonData();
        originalUser.value = { ...userStore.user };

        Swal.fire({
            title: "Údaje byly aktualizovány",
            icon: "success",
            confirmButtonColor: '#00bd7e' // jade-500
        }).then(() => {
            router.push({ name: 'Home' });
        });
    }
}

const hasUnsavedChanges = computed(() => {
    const currentData = JSON.stringify(userForm.value?.getPersonData?.() || {});
    const originalData = JSON.stringify(originalUser.value);
    return currentData !== originalData;
});

onBeforeRouteLeave((to, from, next) => {
    if (hasUnsavedChanges.value) {
        Swal.fire({
            title: "Chcete změny uložit?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Uložit",
            confirmButtonColor: '#00bd7e', // jade-500
            denyButtonText: `Neukládat`
        }).then((result) => {
            if (result.isConfirmed) {
                saveUserData();
                next();
            } else if (result.isDenied) {
                next();
            } else {
                next(false);
            }
        });
    } else {
        next();
    }
});
</script>