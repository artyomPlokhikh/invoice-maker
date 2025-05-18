<template>
    <h2 class="text-2xl font-bold">{{ isEditing ? 'Úprava faktury' : 'Faktura vydaná' }} č.
        <template v-if="isEditing">
            <input
                v-model="invoice.number"
                class="border border-gray-300 rounded px-2 py-1 w-32 text-xl font-bold ml-1"
            />
        </template>
        <template v-else>
            {{ invoice.number }}
        </template>
    </h2>

    <section class="bg-white p-6 rounded-xl shadow space-y-6">
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
import { ref, reactive, watch } from 'vue';
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
        customer: customers.value[0] || null,
        paymentMethod: paymentMethods.value[0] || null,
        variableSymbol: uniqueNumber,
        currency: 'CZK',
        items: [],
        amount: 0,
    };
}

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
