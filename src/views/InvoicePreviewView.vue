<template>
    <div v-if="invoice" class="invoice-print max-w-[210mm] mx-auto bg-white shadow print:shadow-none p-10">

        <section class="grid grid-cols-[auto_1fr_auto] gap-x-6">
            <div class="w-8 flex items-center justify-center
                  text-jade-900 font-semibold text-xs tracking-widest
                  whitespace-nowrap rotate-180 [writing-mode:vertical-rl]">
                IDENTIFIKAČNÍ&nbsp;ÚDAJE
            </div>

            <div class="grid grid-cols-2 gap-x-8">
                <div>
                    <p class="font-semibold leading-tight">
                        Dodavatel<br/>{{ user.name }}
                    </p>
                    <p class="mt-2 leading-snug text-sm">
                            <span v-for="(line, i) in user.address.split(',')" :key="i">
                              {{ line.trim() }}<br v-if="i < user.address.split(',').length - 1"/>
                            </span>
                        <br>
                        <span v-if="user.ic">IČ: {{ user.ic }}<br/></span>
                        <span v-if="user.dic">DIČ: {{ user.dic }}<br/></span>
                    </p>
                </div>

                <div class="text-right">
                    <p class="font-semibold leading-tight text-left">
                        Odběratel<br/>{{ invoice.customer.name }}
                    </p>
                    <p class="mt-2 leading-snug text-sm text-left">
                            <span v-for="(line, i) in invoice.customer.address.split(',')" :key="i">
                                {{ line.trim() }}<br v-if="i < invoice.customer.address.split(',').length - 1"/>
                            </span>
                        <br>
                        <span v-if="invoice.customer.ic">IČ: {{ invoice.customer.ic }}&nbsp;&nbsp;&nbsp;<br/></span>
                        <span v-if="invoice.customer.dic">DIČ: {{ invoice.customer.dic }}</span>
                    </p>
                </div>
            </div>
        </section>

        <section class="mt-8 text-sm flex gap-10">
            <span>Datum vystavení: <strong>{{ formatDate(invoice.issueDate) }}</strong></span>
            <span v-if="invoice.dueDate">Datum splatnosti: <strong>{{ formatDate(invoice.dueDate) }}</strong></span>
        </section>

        <section class="mt-8 grid grid-cols-[auto_1fr]">
            <div
                class="w-8 bg-jade-500 flex items-center justify-center text-white font-semibold text-xs tracking-widest whitespace-nowrap rotate-180 [writing-mode:vertical-rl]">
                PLATEBNÍ&nbsp;ÚDAJE
            </div>

            <div
                class="bg-jade-500 text-white px-8 py-5 grid grid-cols-[250px_190px_auto] gap-x-10 gap-y-2 text-[13px] leading-tight">

                <div>
                    <p class="font-semibold mb-2">Bankovní účet</p>
                    <p>{{ `${invoice.paymentMethod.accountNumber}/${invoice.paymentMethod.code}` }}</p>
                    <p class="mt-1">IBAN: {{ invoice.paymentMethod.iban }}</p>
                    <p class="mt-1">SWIFT: {{ invoice.paymentMethod.swift }}</p>
                </div>

                <div>
                    <p class="font-semibold mb-2">Symbol</p>
                    <p class="mt-1">variabilní:&nbsp;{{ invoice.number }}</p>
                    <p class="mt-1">konstantní:&nbsp;0308</p>
                </div>

                <div class="row-span-5 flex flex-col items-end justify-between">
                    <div class="text-right">
                        <p class="font-semibold mb-1">K úhradě</p>
                        <p class="text-lg font-extrabold whitespace-nowrap">
                            {{ formatNumber(invoice.amount) }}&nbsp;Kč
                        </p>
                    </div>

                    <div class="flex flex-col items-end mt-4">
                        <img v-if="qrCode" :src="qrCode" alt="QR Platba" class="w-24 h-24 mb-2"/>
                    </div>
                </div>

            </div>
        </section>


        <section class="mt-6 grid grid-cols-[auto_1fr] gap-x-6">
            <div class="w-8 flex items-center justify-center
                  text-jade-900 font-semibold text-xs tracking-widest
                  whitespace-nowrap rotate-180 [writing-mode:vertical-rl]">
                FAKTURUJEME&nbsp;VÁM
            </div>

            <div>
                <p class="mb-6 text-sm">Fakturujeme Vám za dodané služby:</p>
                <table class="w-full text-sm border-collapse">
                    <thead class="bg-gray-100">
                    <tr>
                        <th class="border px-2 py-1 text-left">Popis</th>
                        <th class="border px-2 py-1 text-right">Čas</th>
                        <th class="border px-2 py-1 text-right">Cena</th>
                        <th class="border px-2 py-1 text-right">Celkem</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in invoice.items" :key="item.id" class="even:bg-gray-50">
                        <td class="border px-2 py-1">{{ item.name }}</td>
                        <td class="border px-2 py-1 text-right">{{ formatTimeValue(item.quantity) }}</td>
                        <td class="border px-2 py-1 text-right">{{ formatNumber(item.price) }}</td>
                        <td class="border px-2 py-1 text-right font-semibold">
                            {{ formatItemTotal(item) }}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <div class="mt-10 text-right bg-jade-500 text-white font-semibold px-6 py-3">
            Celkem k úhradě:
            <span class="ml-4 text-lg font-bold">
                    {{ formatNumber(invoice.amount) }}&nbsp;Kč
                </span>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/UserStore.js';
import { useInvoiceStore } from '@/stores/InvoiceStore.js';
import QRCode from 'qrcode';
import { generateQrPlatbaString } from '@/utils/paymentUtils.js';
import { calculateItemTotal } from "@/utils/priceUtils.js";
import { formatTimeValue } from "../utils/formatters.js";

const invoice = ref(null);
const qrCode = ref(null);
const route = useRoute();
const invoiceStore = useInvoiceStore();
const { user } = useUserStore();

const nf = new Intl.NumberFormat("cs-CZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});
const formatNumber = (n) => nf.format(+n);
const formatDate = (d) =>
    new Date(d).toLocaleDateString("cs-CZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
const formatItemTotal = (item) => formatNumber(calculateItemTotal(item));

onMounted(async () => {
    const number = route.params.number;
    const found = invoiceStore.invoices.find(inv => inv.number === number);
    if (!found) return;
    invoice.value = found;

    const data = invoice.value;
    const pm = data.paymentMethod || {};
    const qrString = generateQrPlatbaString({
        iban: pm.iban || '',
        swift: pm.swift || '',
        amount: data.amount,
        currency: data.currency,
        dueDate: data.dueDate,
        message: data.description,
        vs: data.number,
    });

    qrCode.value = await QRCode.toDataURL(qrString);
})
</script>

<style>
@media print {

    @page {
        size: A4 portrait;
        margin: 12mm 15mm;
    }

    html, body {
        width: 210mm;
        height: 297mm;
        padding: 0;
        margin: 0;
    }

    body * {
        visibility: hidden !important;
    }

    .invoice-print,
    .invoice-print * {
        visibility: visible !important;
    }

    .invoice-print {
        position: absolute;
        inset: 0 auto auto 0;
        width: 100%;
        box-shadow: none !important;
        padding-bottom: 0 !important;
        margin-bottom: 0 !important;
        page-break-after: avoid;
        page-break-inside: avoid;
    }
}
</style>