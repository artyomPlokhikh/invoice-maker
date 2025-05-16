<template>
    <h2 class="text-2xl font-bold">Faktura vydaná č. {{ invoice.number }}</h2>

    <section class="bg-white p-6 rounded-xl shadow space-y-6">
        <CustomerSection
            :invoice="invoice"
        />

        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Popis</label>
            <textarea rows="3"
                      v-model="invoice.description"
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-y shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
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
                        <option v-for="currency in currencies" :key="currency" :value="currency">{{ currency }}</option>
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
            <button @click="saveInvoice" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Uložit
            </button>
            <button @click="exportToPdf" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Exportovat do PDF
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

const invoice = reactive({
    number: '20250001',
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer: null,
    paymentMethod: null,
    variableSymbol: '',
    constantSymbol: '',
    currency: 'CZK',
    items: []
});

const showAdditionalInfo = ref(false);
const totalPrice = ref(0);

const currencies = ['CZK', 'EUR', 'USD'];

watch(() => invoice.items, () => {
    totalPrice.value = calculateTotals(invoice);
}, { deep: true });

function saveInvoice() {
    console.log('Saving invoice:', invoice);
}

function exportToPdf() {
    console.log('Exporting invoice to PDF');
}

function cancel() {
    if (confirm('Opravdu chcete zrušit úpravy?')) {
        console.log('Cancelling changes');
    }
}

</script>


