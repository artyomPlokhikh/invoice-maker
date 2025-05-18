<template>
    <h2 class="text-2xl font-bold">
        {{ isEditing ? 'Úprava faktury' : 'Faktura vydaná' }} č.
        <template v-if="editingNumber">
            <span class="relative ml-1 inline-block align-bottom">
                <input
                    v-model="editedNumber"
                    @input="editedNumber = editedNumber.replace(/\D/g, '')"
                    @blur="tryUpdateNumber"
                    @keyup.enter="tryUpdateNumber"
                    class="border border-gray-300 rounded w-32 font-inherit"
                    :class="{ 'border-red-500': numberExists }"
                />
                <span
                    v-if="numberExists"
                    class="absolute left-0 w-max text-red-500 text-xs mt-1"
                    style="top:100%;"
                >Toto číslo již existuje
                </span>
            </span>
        </template>
        <template v-else>
            <span class="ml-1">{{ invoice.number }}</span>
        </template>
        <button
            @click="editingNumber ? tryUpdateNumber() : startEditingNumber()"
            class="ml-2 inline-flex items-center justify-center text-gray-500 hover:text-jade-600 disabled:text-gray-300 disabled:cursor-not-allowed"
            title="Upravit číslo"
            :disabled="numberExists"
        >
            <IconEdit class="inline w-5 h-5 align-middle"/>
        </button>
    </h2>

    <section class="bg-white p-6 rounded-xl shadow space-y-6">
        <div class="flex items-center gap-4">
            <label class="block text-sm font-medium text-gray-700">Stav faktury</label>
            <select v-model="invoice.status"
                    class="border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm">
                <option value="unpaid">Neuhrazeno</option>
                <option value="paid">Uhrazeno</option>
                <option value="overdue">Po splatnosti</option>
            </select>
        </div>

        <CustomerSection v-model:customer="invoice.customer"/>

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Popis</label>
            <textarea rows="3"
                      v-model="invoice.description"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y shadow-sm focus:outline-none focus:ring focus:ring-jade-200 min-h-[100px]"
                      placeholder="Např. konzultace, vývoj, údržba..."
            ></textarea>
        </div>
    </section>

    <section class="bg-white p-6 rounded-xl shadow space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Vystaveno</label>
                <input type="date" v-model="invoice.issueDate"
                       class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Splatnost</label>
                <input v-model="invoice.dueDate"
                       type="date"
                       class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm"
                />
            </div>
        </div>

        <div class="space-y-2">
            <PaymentSection v-model:paymentMethod="invoice.paymentMethod"/>
        </div>

        <div class="flex justify-center">
            <button @click="showAdditionalInfo = !showAdditionalInfo" class="text-sm text-jade-600 font-medium">
                {{ showAdditionalInfo ? 'Skrýt detaily' : 'Zobrazit více detailů' }}
            </button>
        </div>

        <div v-show="showAdditionalInfo" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Variabilní symbol</label>
                    <input v-model="invoice.variableSymbol"
                           type="text"
                           class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Měna</label>
                    <select v-model="invoice.currency"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm"
                    >
                        <option v-for="currency in ['CZK', 'EUR', 'USD']" :key="currency" :value="currency">{{
                                currency
                            }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
    </section>

    <section class="bg-white p-6 rounded-xl shadow space-y-4">
        <ItemTable v-model:items="invoice.items"/>
    </section>

    <div class="flex justify-between items-center mt-8">
        <div class="text-lg font-semibold">Cena celkem: {{ formatPrice(invoice.amount) }} {{ invoice.currency }}</div>
        <div class="space-x-2">
            <button @click="goToInvoiceList()" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
                Zrušit
            </button>
            <button @click="save(); goToInvoiceList();"
                    class="px-4 py-2 bg-jade-600 text-white rounded-md hover:bg-jade-700">
                {{ isEditing ? 'Uložit změny' : 'Uložit' }}
            </button>
        </div>
    </div>


</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import CustomerSection from "@/components/CustomerSection.vue";
import ItemTable from "@/components/ItemTable.vue";
import { calculateTotals, formatPrice } from "@/utils/priceUtils.js";
import PaymentSection from "@/components/PaymentSection.vue";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { useInvoiceStore } from "@/stores/InvoiceStore.js";
import isEqual from 'lodash/isEqual';
import { usePaymentMethodStore } from "@/stores/PaymentMethodStore.js";
import { storeToRefs } from "pinia";
import { useCustomerStore } from "@/stores/CustomerStore.js";
import { confirmSaveDialog } from "@/utils/swal.js";
import IconEdit from "../components/svg/IconEdit.vue";


const router = useRouter();
const route = useRoute();

const invoiceStore = useInvoiceStore();
const paymentMethodStore = usePaymentMethodStore();
const { paymentMethods } = storeToRefs(paymentMethodStore);
const customerStore = useCustomerStore();
const { customers } = storeToRefs(customerStore);

const isEditing = ref(false);
const showAdditionalInfo = ref(false);

// Invoice initialization
const invoice = reactive(createDefaultInvoice());
const initInvoice = ref(JSON.parse(JSON.stringify(invoice)));
if (route.params.number) {
    const found = invoiceStore.findInvoiceByNumber(route.params.number);
    if (found) {
        Object.assign(invoice, found);
        isEditing.value = true;
    }
}
initInvoice.value = JSON.parse(JSON.stringify(invoice));

function createDefaultInvoice() {
    const uniqueNumber = invoiceStore.generateUniqueInvoiceNumber();
    return {
        number: uniqueNumber,
        status: 'unpaid',
        description: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customer: customers.value.length === 1 ? customers.value[0] : null,
        paymentMethod: paymentMethods.value.length === 1 ? paymentMethods.value[0] : null,
        variableSymbol: uniqueNumber,
        currency: 'CZK',
        items: [],
        amount: 0,
    };
}

// Invoice number editing
const editingNumber = ref(false);
const editedNumber = ref(invoice.number);

function startEditingNumber() {
    editingNumber.value = true;
}

function tryUpdateNumber() {
    if (!numberExists.value && editedNumber.value) {
        invoice.number = editedNumber.value;
        editingNumber.value = false;
    }
}

const numberExists = computed(() => {
    return invoiceStore.invoices.some(inv =>
        inv.number === editedNumber.value && (!isEditing.value || inv.number !== route.params.number)
    );
});

function save() {
    if (isEditing.value) {
        invoiceStore.updateInvoice(invoice);
    } else {
        invoiceStore.addInvoice(invoice)
    }
    initInvoice.value = JSON.parse(JSON.stringify(invoice)); // update original to avoid confirmation dialog
}

watch(
    () => (Array.isArray(invoice.items) ? invoice.items.map(item => [item.price, item.quantity]) : []),
    () => {
        invoice.amount = calculateTotals(invoice);
    },
);

onBeforeRouteLeave((to, from, next) => {
    const reference = initInvoice.value;
    if (!isEqual(invoice, reference)) {
        confirmSaveDialog().then((result) => {
            if (result.isConfirmed) {
                save();
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

function goToInvoiceList() {
    router.push({ name: 'Home' });
}
</script>
