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