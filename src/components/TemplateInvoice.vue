<template>
    <div class="font-sans text-sm text-black p-6 space-y-6">
        <h1 class="text-xl font-bold text-center">Faktura č. {{ invoice.number }}</h1>

        <div class="grid grid-cols-2 gap-8">
            <div>
                <p class="font-semibold">Dodavatel:</p>
                <p>{{ user.name }}</p>
                <p>{{ user.address }}</p>
                <p>IČO: {{ user.ic }}</p>
                <p v-if="user.dic">DIČ: {{ user.dic }}</p>
            </div>
            <div>
                <p class="font-semibold">Odběratel:</p>
                <p>{{ invoice.customer.name }}</p>
                <p>{{ invoice.customer.address }}</p>
                <p>IČO: {{ invoice.customer.ic }}</p>
                <p v-if="invoice.customer.dic">DIČ: {{ invoice.customer.dic }}</p>
            </div>
        </div>

        <div class="flex justify-between">
            <div>Datum vystavení: {{ invoice.issueDate }}</div>
            <div>Splatnost: {{ invoice.dueDate }}</div>
        </div>

        <table class="w-full border-collapse mt-4">
            <thead>
            <tr class="bg-gray-100">
                <th class="border p-2 text-left">Položka</th>
                <th class="border p-2 text-right">Množství</th>
                <th class="border p-2 text-right">Cena</th>
                <th class="border p-2 text-right">Celkem</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, i) in invoice.items" :key="i">
                <td class="border p-2">{{ item.name }}</td>
                <td class="border p-2 text-right">{{ item.quantity }}</td>
                <td class="border p-2 text-right">{{ item.price.toFixed(2).replace('.', ',') }}</td>
                <td class="border p-2 text-right">{{ (item.price * item.quantity).toFixed(2).replace('.', ',') }}</td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
                <td colspan="3" class="text-right font-bold border p-2">Celkem</td>
                <td class="border p-2 text-right font-bold">
                    {{ invoice.amount.toFixed(2).replace('.', ',') }} {{ invoice.currency }}
                </td>
            </tr>
            </tfoot>
        </table>

        <div class="mt-6">
            <img
                v-if="qrCode"
                :src="qrCode"
                alt="QR Platba"
                class="w-32"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { generateQrPlatbaString } from '@/utils/paymentUtils.js'
import { useUserStore } from "@/stores/UserStore.js";

const props = defineProps({
    invoice: Object,
})

const { user } = useUserStore();

const qrCode = ref(null)

onMounted(async () => {
    const qrString = generateQrPlatbaString({
        iban: props.invoice.paymentMethod.iban,
        swift: props.invoice.paymentMethod.swift,
        amount: props.invoice.amount,
        currency: props.invoice.currency,
        dueDate: props.invoice.paymentMethod.dueDate,
        message: props.invoice.description,
        vs: props.invoice.number,
    })

    qrCode.value = await QRCode.toDataURL(qrString)
})
</script>
