import { defineStore } from "pinia";
import { ref } from "vue";

export const useClickupStore = defineStore('clickup', () => {
    const apiToken = ref('');
    const teamId = ref('');

    function setApiToken(token) {
        apiToken.value = token;
    }

    function setTeamId(id) {
        teamId.value = id;
    }

    return {
        apiToken,
        teamId,
        setApiToken,
        setTeamId,
    };
}, { persist: true });