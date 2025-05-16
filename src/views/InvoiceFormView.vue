<template>
    <h2 class="text-2xl font-bold">{{ isEditing ? 'Úprava faktury' : 'Faktura vydaná' }} č. {{ invoice.number }}</h2>

    <section class="bg-white p-6 rounded-xl shadow space-y-6">
        <CustomerSection
            :invoice="invoice"
        />

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Popis</label>
            <textarea rows="3"
                      v-model="invoice.description"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y shadow-sm focus:outline-none focus:ring focus:ring-blue-200 min-h-[100px]"
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
            <PaymentSection
                :invoice="invoice"
            />
        </div>

        <div class="flex justify-center">
            <button @click="showAdditionalInfo = !showAdditionalInfo" class="text-sm text-blue-600 font-medium">
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
                    <label class="block text-sm font-medium text-gray-700 mb-1">Konstantní symbol</label>
                    <input v-model="invoice.constantSymbol"
                           type="text"
                           class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Měna</label>
                    <select v-model="invoice.currency"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm"
                    >
                        <option v-for="currency in ['CZK', 'EUR', 'USD']" :key="currency" :value="currency">{{ currency }}</option>
                    </select>
                </div>
            </div>
        </div>
    </section>

    <section class="bg-white p-6 rounded-xl shadow space-y-4">
        <ItemTable
            :items="invoice.items"
            @addItem="(item) => invoice.items.push(item)"
            @removeItem="(index) => invoice.items.splice(index, 1)"
        />
    </section>

    <div class="flex justify-between items-center mt-8">
        <div class="text-lg font-semibold">Cena celkem: {{ formatPrice(totalPrice) }} {{ invoice.currency }}</div>
        <div class="space-x-2">
            <button @click="cancel" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">Zrušit
            </button>
            <button @click="saveAndGoToList" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {{ isEditing ? 'Uložit změny' : 'Uložit' }}
            </button>
            <button @click="exportToPdf" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Exportovat do PDF
            </button>
        </div>
    </div>


</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import CustomerSection from "@/components/CustomerSection.vue";
import ItemTable from "@/components/ItemTable.vue";
import { calculateTotals, formatPrice } from "@/utils/priceUtils.js";
import PaymentSection from "@/components/PaymentSection.vue";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { useInvoiceStore } from "@/stores/InvoiceStore.js";
import Swal from "sweetalert2";
import isEqual from 'lodash/isEqual';
import { usePaymentMethodStore } from "@/stores/PaymentMethodStore.js";
import { storeToRefs } from "pinia";
import { useCustomerStore } from "@/stores/CustomerStore.js";


const router = useRouter();
const route = useRoute();
const invoiceStore = useInvoiceStore();

const paymentMethodStore = usePaymentMethodStore();
const { paymentMethods } = storeToRefs(paymentMethodStore);

const customerStore = useCustomerStore();
const { customers } = storeToRefs(customerStore);

const defaultInvoice = {
    number: invoiceStore.generateUniqueInvoiceNumber(),
    status: 'unpaid',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer: customers.value.length > 0 ? customers.value[0] : null,
    paymentMethod: paymentMethods.value.length > 0 ? paymentMethods.value[0] : null,
    variableSymbol: '',
    constantSymbol: '',
    currency: 'CZK',
    items: [],
    amount: 0,
};

const invoice = reactive({ ...defaultInvoice });

const isEditing = ref(false);
const originalInvoice = ref(null);
const showAdditionalInfo = ref(false);
const totalPrice = ref(0);

onMounted(() => {
    const number = route.params.number;
    if (number) {
        const foundInvoice = invoiceStore.invoices.find(inv => inv.number === number);
        if (foundInvoice) {
            originalInvoice.value = foundInvoice;
            Object.assign(invoice, JSON.parse(JSON.stringify(foundInvoice)));
            isEditing.value = true;
        }
    } else {
        invoice.number = invoiceStore.generateUniqueInvoiceNumber();
    }

    totalPrice.value = calculateTotals(invoice);
});

watch(() => invoice.items, () => {
    totalPrice.value = calculateTotals(invoice);
}, { deep: true });

function save() {
    if (isEditing.value) {
        const index = invoiceStore.invoices.findIndex(inv => inv.id === invoice.id);
        if (index !== -1) {
            invoice.amount = totalPrice.value;
            invoiceStore.invoices[index] = { ...invoice };
        }
    } else {
        invoice.amount = totalPrice.value;
        invoiceStore.invoices.push({ ...invoice });
    }
    originalInvoice.value = JSON.parse(JSON.stringify(invoice));
}

function saveAndGoToList() {
    save();
    goToInvoiceList();
}

function exportToPdf() {
    console.log('Exporting invoice to PDF');
}

function cancel() {
    if (isEditing.value && JSON.stringify(invoice) === JSON.stringify(originalInvoice.value)) {
        goToInvoiceList();
        return;
    }

    Swal.fire({
        title: "Chcete změny uložit?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Uložit",
        denyButtonText: `Neukládat`
    }).then((result) => {
        if (result.isConfirmed) {
            saveAndGoToList();
        } else if (result.isDenied) {
            goToInvoiceList();
        }
    });
}

onBeforeRouteLeave((to, from, next) => {
    const reference = isEditing.value ? originalInvoice.value : defaultInvoice;
    if (!isEqual(invoice, reference)) {
        Swal.fire({
            title: "Chcete změny uložit?",
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: "Uložit",
            denyButtonText: `Neukládat`
        }).then((result) => {
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
