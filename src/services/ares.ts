import axios from 'axios';
import type { Party } from '@/types/types';

export async function getSubjectByICO(ico: string): Promise<Partial<Party>> {
    const endpoint = `https://ares.gov.cz/ekonomicke-subjekty-v-be/v1/subjects/${ico}`;
    const { data } = await axios.get(endpoint, { headers: { Accept: 'application/json' } });
    const b = data.basic;
    return {
        ico,
        name: b.tradeName || b.name,
        address: `${b.street ?? ''} ${b.houseNumber ?? ''}, ${b.postalCode ?? ''} ${b.city ?? ''}`.trim(),
        country: 'CZ',
        dic: b.vatId ?? '',
    };
}
