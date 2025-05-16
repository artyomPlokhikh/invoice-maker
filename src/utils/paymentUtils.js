import { bankCodes } from '@/data/bankCodes'

/**
 * @param {string} fullAccount - Can include prefix, e.g. '19-1234567890'
 * @returns {{prefix: string, number: string}}
 */
export function parseAccountNumber(fullAccount) {
    const clean = fullAccount.replace(/\s/g, '')
    const parts = clean.split('-')
    const prefix = parts.length === 2 ? parts[0] : ''
    const number = parts.length === 2 ? parts[1] : parts[0]
    return {
        prefix: prefix.padStart(6, '0'),
        number: number.padStart(10, '0')
    }
}

/**
 * @param {string} accountNumber - full account number string, e.g. '19-1234567890'
 * @param {string} bankCode - 4-digit bank code (e.g. '0800')
 * @returns {string} - IBAN in Czech format
 */
export function generateCzechIban(accountNumber, bankCode) {
    if (!accountNumber || !bankCode) return ''

    const { prefix, number } = parseAccountNumber(accountNumber)
    const bban = `${bankCode}${prefix}${number}`
    const numericCountry = '1235' // C=12, Z=35
    const checkBase = `${bban}${numericCountry}00`
    const mod = mod97(checkBase)
    const checkDigits = String(98 - mod).padStart(2, '0')
    return `CZ${checkDigits}${bban}`
}

/**
 * @param {string} input - numerical string for IBAN mod check
 * @returns {number}
 */
function mod97(input) {
    let remainder = input
    while (remainder.length > 2) {
        const block = remainder.substring(0, 9)
        remainder = (parseInt(block, 10) % 97) + remainder.substring(block.length)
    }
    return parseInt(remainder, 10) % 97
}

/**
 * @param {string} bankCode - e.g. '0800'
 * @returns {string} - BIC/SWIFT or empty string
 */
export function getSwiftByBankCode(bankCode) {
    const bank = bankCodes.find(b => b.code === bankCode)
    return bank?.bic || ''
}


export function generateQrPlatbaString(
    {
        iban,
        swift,
        amount,
        currency,
        dueDate,
        message,
        vs,
    }) {
    if (!iban) throw new Error('IBAN is required');
    if (amount == null) throw new Error('Amount is required');
    if (!currency) throw new Error('Currency is required');

    const fields = ['SPD*1.0'];

    // Required
    let acc = `ACC:${(iban)}`;
    if (swift) acc += `+${swift}`;
    fields.push(acc);

    fields.push(`AM:${Number(amount).toFixed(2)}`);
    fields.push(`CC:${currency}`);

    // Optional
    if (dueDate) fields.push(`DT:${formatDateYYYYMMDD(dueDate)}`);
    if (message) fields.push(`MSG:${sanitize(message)}`);
    if (vs) fields.push(`X-VS:${vs}`);

    return fields.join('*');
}

function formatDateYYYYMMDD(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function sanitize(str) {
    return String(str).replace(/\*/g, '').trim()
}