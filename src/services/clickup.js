import axios from 'axios';
import { useClickupStore } from "@/stores/ClickupStore.js";

const { apiToken: TOKEN, teamId: TEAM_ID } = useClickupStore();

const api = axios.create({
    baseURL: 'https://api.clickup.com/api/v2',
    headers: { Authorization: TOKEN }
});

/**
 * Get summed hours per task for the given window.
 *
 * @param  {Date|string|number} from  start date (Date | ISO | ms)
 * @param  {Date|string|number} to    end   date (Date | ISO | ms)
 * @return {Promise<Record<string,string>>}
 *         e.g. { "My task": "7.33", "Another": "3.50" }
 */
export async function getTimeEntries(from, to) {
    const start = +new Date(from);
    const end = +new Date(to);

    const tasks = {};
    let page = 0;
    const PAGE_SIZE = 1000;

    while (true) {
        const { data } = await api.get(`/team/${TEAM_ID}/time_entries`, {
            params: { start_date: start, end_date: end, page }
        });

        const entries = data?.data ?? [];
        for (const e of entries) {
            const id = e.task.id;
            const name = e.task.name;
            const dur = +e.duration;

            if (!tasks[id]) tasks[id] = { id, name, ms: 0 };
            tasks[id].ms += dur;
        }

        if (entries.length < PAGE_SIZE) break;
        page += 1;
    }

    Object.values(tasks).forEach(t => {
        t.hours = parseFloat((t.ms / 3_600_000).toFixed(2));
        delete t.ms;
    });

    return tasks;
}
