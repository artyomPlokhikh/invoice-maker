export function formatTimeValue(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '';

    const hours = Math.floor(num);
    const minutes = Math.round((num - hours) * 60);

    return [
        hours ? `${hours}h` : '',
        minutes ? `${minutes}m` : ''
    ].filter(Boolean).join(' ');
}

function parseTimeInput(input) {
    if (!input) return 0;

    const hourMatch = input.match(/(\d+)\s*h/i);
    const minuteMatch = input.match(/(\d+)\s*m/i);

    let hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    let minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

    if (!hourMatch && !minuteMatch) {
        const numValue = parseFloat(input.replace(',', '.'));
        if (!isNaN(numValue)) {
            hours = Math.floor(numValue);
            minutes = Math.round((numValue - hours) * 60);
        }
    }

    return hours + (minutes / 60);
}

export function evaluateTimeExpression(input) {
    if (!input) return 0;
    let normalized = input.replace(',', '.').replace(/\s+/g, '');
    const parts = normalized.split(/([+-])/).filter(Boolean);

    let total = 0;
    let currentOp = '+';
    for (let part of parts) {
        if (part === '+' || part === '-') {
            currentOp = part;
        } else {
            let value = parseTimeInput(part);
            total = currentOp === '+' ? total + value : total - value;
        }
    }
    return total;
}