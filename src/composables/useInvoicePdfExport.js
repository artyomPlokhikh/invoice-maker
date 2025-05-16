import html2pdf from 'html2pdf.js';
import { createApp, h, nextTick } from 'vue';
import TemplateInvoice from '@/components/TemplateInvoice.vue';

export function useInvoicePdfExport() {
    async function exportInvoiceToPDF(invoice, user) {
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'absolute',
            top: '0',
            left: '-10000px',
            width: '210mm',
            background: 'white',
            pointerEvents: 'none',
            zIndex: '-1',
        });
        document.body.appendChild(container);

        const app = createApp({
            render: () => h(TemplateInvoice, { invoice, user })
        });
        app.mount(container);

        await nextTick();
        await new Promise(res => setTimeout(res, 300));

        await html2pdf()
            .set({
                margin:       10,
                filename:     `faktura-${invoice.number}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(container)
            .save();

        app.unmount();
        document.body.removeChild(container);
    }

    return { exportInvoiceToPDF };
}
