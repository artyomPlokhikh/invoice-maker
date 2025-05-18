<template>
    <div class="min-h-screen bg-gray-100 text-gray-800">
        <header class="bg-white shadow border-b border-gray-200">
            <div class="w-[80vw] max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                <RouterLink to="/" class="text-jade-600 hover:text-jade-800">
                    InvoiceApp
                </RouterLink>
                <RouterLink to="/settings" title="Nastavení">
                    <IconGear class="icon w-5 h-5 "/>
                </RouterLink>
            </div>

        </header>
        <main class="w-[80vw] max-w-5xl mx-auto px-4 py-10 space-y-12">
            <RouterView/>
        </main>
    </div>

</template>
<script setup>
import IconGear from "@/components/svg/IconGear.vue";
</script>