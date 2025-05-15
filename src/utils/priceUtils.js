export function formatPrice(price) {
    return price.toFixed(2).replace('.', ',');
}

export function calculateItemTotal(item) {
    const price = typeof item.price === 'string'
        ? parseFloat(item.price.replace(',', '.')) || 0
        : parseFloat(item.price) || 0;

    const quantity = typeof item.quantity === 'string'
        ? parseFloat(item.quantity.replace(',', '.')) || 0
        : parseFloat(item.quantity) || 0;

    return price * quantity;
}

export function calculateTotals(invoice) {
    return invoice.items.reduce((total, item) => {
        const priceValue = typeof item.price === 'string'
            ? item.price.replace(/\s/g, '').replace(',', '.')
            : String(item.price);

        return total + (parseFloat(priceValue) * item.quantity);
    }, 0);
}