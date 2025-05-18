<template>
    <div class="container mx-auto px-4 py-6">
        <div class="bg-white shadow rounded-xl divide-y divide-gray-100">

            <header class="p-6">
                <h2 class="text-2xl font-bold">Nastavení účtu</h2>
            </header>

            <!-- user data --------------------------------------------------------->
            <section aria-labelledby="heading-user" class="p-6">
                <h3 id="heading-user" class="text-xl font-semibold mb-4">
                    Údaje o uživateli
                </h3>

                <div class="max-w-md space-y-4">
                    <PersonForm ref="userForm" :initialData="originalUser"/>

                    <button
                        @click="saveUserData"
                        :disabled="!hasUserChanges"
                        class="w-max px-4 py-2 rounded-md bg-jade-600 text-white hover:bg-jade-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Uložit údaje
                    </button>
                </div>
            </section>

            <!-- customers --------------------------------------------------------->
            <section aria-labelledby="heading-customers" class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 id="heading-customers" class="text-xl font-semibold">
                        Správa zákazníků
                    </h3>

                    <button
                        @click="startAddCustomer"
                        class="mt-1 text-jade-600 font-bold"
                    >+ Přidat zákazníka
                    </button>
                </div>

                <ul class="space-y-2">
                    <li
                        v-for="customer in customers"
                        :key="customer.ic"
                        class="flex items-center justify-between"
                    >
                        <span>{{ customer.name }} ({{ customer.ic }})</span>
                        <button
                            @click="deleteCustomer(customer.ic)"
                            class="delete-btn p-1 rounded transition-colors"
                            title="Smazat"
                        >
                            <IconDelete class="icon icon-delete "/>
                        </button>
                    </li>
                </ul>

                <ModalAddCustomer
                    :model-value="showAddCustomerModal"
                    @update:modelValue="showAddCustomerModal = $event"
                    @createCustomer="addCustomer"
                />
            </section>

            <!-- payment methods --------------------------------------------------->
            <section aria-labelledby="heading-payments" class="p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 id="heading-payments" class="text-xl font-semibold">
                        Platební metody
                    </h3>

                    <button
                        @click="startAddPaymentMethod"
                        class="mt-1 text-jade-600 font-bold"
                    >+ Přidat platební metodu
                    </button>
                </div>

                <ul class="space-y-2">
                    <li
                        v-for="pm in paymentMethodStore.paymentMethods"
                        :key="pm.iban"
                        class="flex items-center justify-between"
                    >
                        <span>{{ pm.name }} ({{ pm.iban }})</span>
                        <div class="flex gap-2">
                            <button
                                @click="editPaymentMethod(pm)"
                                class="edit-btn p-1 rounded transition-colors"
                                title="Upravit"
                            >
                                <IconEdit class="icon icon-edit "/>
                            </button>
                            <button
                                @click="deletePaymentMethod(pm.iban)"
                                class="delete-btn p-1 rounded transition-colors"
                                title="Smazat"
                            >
                                <IconDelete class="icon icon-delete "/>
                            </button>
                        </div>
                    </li>
                </ul>

                <PaymentModal
                    :model-value="showAddPaymentModal"
                    :payment="editingPayment"
                    @update:modelValue="showAddPaymentModal = $event"
                    @createPayment="onCreatePayment"
                />
            </section>

            <!-- ClickUp ----------------------------------------------------------->
            <section aria-labelledby="heading-clickup" class="p-6">
                <h3 id="heading-clickup" class="text-xl font-semibold mb-4 flex items-center gap-2">
                ClickUp Integration
                    <span class="relative group">
                        <IconQuestion class="text-gray-400 cursor-pointer"/>
                        <span class="absolute left-1/2 -translate-x-1/2 mt-2 w-64 p-2 rounded bg-gray-800 text-xs text-white opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            Pro získání ClickUp API tokenu otevřete Nastavení &gt; Aplikace &gt; Vygenerovat token.<br>
                            Team ID najdete v URL svého workspace za /team/.
                        </span>
                    </span>
                </h3>

                <form class="max-w-md space-y-4" @submit.prevent="saveClickupData">
                    <div>
                        <label
                            for="apiToken"
                            class="block mb-1 text-sm font-medium text-gray-700"
                        >
                            API Token
                        </label>
                        <input
                            id="apiToken"
                            type="password"
                            v-model="clickupForm.apiToken"
                            class="w-full border border-gray-300 rounded-md px-3 py-2"
                            :placeholder="clickupStore.apiToken"
                        />
                    </div>

                    <div>
                        <label
                            for="teamId"
                            class="block mb-1 text-sm font-medium text-gray-700"
                        >
                            Team ID
                        </label>
                        <input
                            id="teamId"
                            type="text"
                            v-model="clickupForm.teamId"
                            class="w-full border border-gray-300 rounded-md px-3 py-2"
                            :placeholder="clickupStore.teamId"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="!hasClickupChanges"
                        class="w-max px-4 py-2 rounded-md bg-jade-600 text-white hover:bg-jade-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Uložit ClickUp údaje
                    </button>
                </form>
            </section>
        </div>
    </div>
</template>


<script setup>
import { computed, ref } from 'vue';
import PersonForm from "@/components/PersonForm.vue";
import { useUserStore } from "@/stores/UserStore.js";
import { useCustomerStore } from "@/stores/CustomerStore.js";
import { usePaymentMethodStore } from "@/stores/PaymentMethodStore.js";
import { onBeforeRouteLeave } from "vue-router";
import { confirmDeleteDialog, confirmSaveDialog, dataUpdatedDialog } from "@/utils/swal.js";
import ModalAddCustomer from "@/components/ModalAddCustomer.vue";
import PaymentModal from "@/components/PaymentModal.vue";
import { useClickupStore } from "@/stores/ClickupStore.js";
import IconDelete from "@/components/svg/IconDelete.vue";
import IconEdit from "@/components/svg/IconEdit.vue";
import IconQuestion from "@/components/svg/IconQuestion.vue";


// --- General ---
function handleSaveIfNeeded() {
    if (hasUserChanges.value) saveUserData();
    if (hasClickupChanges.value) saveClickupData();
}

onBeforeRouteLeave(async (to, from, next) => {
    if (!(hasUserChanges.value || hasClickupChanges.value)) {
        next();
        return;
    }
    const result = await confirmSaveDialog();
    if (result.isConfirmed) {
        handleSaveIfNeeded();
        next();
    } else if (result.isDenied) {
        next();
    } else {
        next(false);
    }
});


// --- User Data Management ---
const userStore = useUserStore();
const originalUser = ref(JSON.parse(JSON.stringify(userStore.user)));
const userForm = ref(null);

function saveUserData() {
    if (userForm.value) {
        userStore.user = userForm.value.getPersonData();
        originalUser.value = { ...userStore.user };
        dataUpdatedDialog();
    }
}

const hasUserChanges = computed(() => {
    const currentData = JSON.stringify(userForm.value?.getPersonData?.() || {});
    const originalData = JSON.stringify(originalUser.value);
    return currentData !== originalData;
});


// --- Customers Management ---
const customerStore = useCustomerStore();
const customers = computed(() => customerStore.customers);
const showAddCustomerModal = ref(false);

function startAddCustomer() {
    showAddCustomerModal.value = true;
}

function addCustomer(customer) {
    customerStore.addCustomer(customer);
}

async function deleteCustomer(ic) {
    const result = await confirmDeleteDialog();
    if (result.isConfirmed) {
        customerStore.deleteCustomer(ic);
    }
}


// --- Payment Methods Management ---
const paymentMethodStore = usePaymentMethodStore();
const showAddPaymentModal = ref(false);
const editingPayment = ref(null);

function startAddPaymentMethod() {
    editingPayment.value = {
        name: '',
        accountNumber: '',
        code: '',
        currency: 'CZK'
    };
    showAddPaymentModal.value = true;
}

function editPaymentMethod(pm) {
    editingPayment.value = { ...pm };
    showAddPaymentModal.value = true;
}

async function deletePaymentMethod(iban) {
    const result = await confirmDeleteDialog();
    if (result.isConfirmed) {
        paymentMethodStore.deletePaymentMethod(iban);
    }
}

function onCreatePayment(payment) {
    const existing = paymentMethodStore.findPaymentMethodByIban(payment.iban);
    if (existing) {
        paymentMethodStore.updatePaymentMethod(payment);
    } else {
        paymentMethodStore.addPaymentMethod(payment);
    }
    showAddPaymentModal.value = false;
}


// --- Clickup Integration ---
const clickupStore = useClickupStore();
const originalClickup = ref({
    apiToken: clickupStore.apiToken,
    teamId: clickupStore.teamId,
});
const clickupForm = ref({
    apiToken: clickupStore.apiToken,
    teamId: clickupStore.teamId,
});

const hasClickupChanges = computed(() =>
    clickupForm.value.apiToken !== originalClickup.value.apiToken ||
    clickupForm.value.teamId !== originalClickup.value.teamId
);

function saveClickupData() {
    clickupStore.setApiToken(clickupForm.value.apiToken);
    clickupStore.setTeamId(clickupForm.value.teamId);
    originalClickup.value = { ...clickupForm.value };
    dataUpdatedDialog();
}

</script>
