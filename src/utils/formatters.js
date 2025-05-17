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

export function parseTimeInput(input) {
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