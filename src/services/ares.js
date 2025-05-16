import axios from 'axios';

export async function getSubjectByICO(ico) {
    const endpoint = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`;
    const { data } = await axios.get(endpoint, { headers: { Accept: 'application/json' } });
    return {
        ico,
        name: data.obchodniJmeno,
        address: data.sidlo.textovaAdresa,
        dic: data.dic ?? '',
    };
}
