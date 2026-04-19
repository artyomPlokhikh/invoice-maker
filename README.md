# Invoice Maker

A web application for creating, managing, and exporting professional invoices - built for Czech freelancers and small businesses.

**[Live Demo →](https://artyomplokhikh.github.io/invoice-maker/)**

---

## Features

- **Invoice management** - create, edit, duplicate, and delete invoices with status tracking (paid / unpaid / overdue)
- **PDF export** - generates a professional A4-formatted invoice ready to print or send
- **QR Platba** - auto-generates a Czech QR payment code from invoice details
- **ARES integration** - look up company name and address instantly by entering a Czech business ID (IČ)
- **ClickUp import** - pull time entries from ClickUp and convert them into invoice line items
- **Flexible time input** - enter quantities as hours/minutes (`2h 30m`, `1h+45m`, `2.5`) with auto-formatting
- **Drag-and-drop items** - reorder invoice line items with drag handles
- **Payment method management** - store multiple bank accounts with auto-calculated IBAN and SWIFT
- **Customer management** - save and reuse customer profiles
- **Persistent storage** - all data lives in `localStorage` via Pinia (no backend required)
- **PWA support** - installable as a desktop/mobile app, works offline

---

## Tech Stack

| Category | Libraries |
|---|---|
| Framework | Vue 3, Vue Router |
| State | Pinia + pinia-plugin-persistedstate |
| Build | Vite |
| Styling | Tailwind CSS, SASS |
| PDF | html2pdf.js, jsPDF, jspdf-autotable |
| QR / Payments | qrcode, @craynic/qr-platba |
| HTTP | axios |
| Utilities | dayjs, lodash, @vueuse/core |
| Modals | SweetAlert2 |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build
```
