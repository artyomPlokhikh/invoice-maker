// import axios from 'axios';
// import type { TaskLine } from '@/types/types';
//
// export interface TimeEntryOpts {
//     teamId: string;
//     token: string;
//     start: number;
//     end: number;
//     rateCZK: number;
// }
//
// export async function getTimeEntries({ teamId, token, start, end, rateCZK, }: TimeEntryOpts): Promise<TaskLine[]> {
//     const url = `https://api.clickup.com/api/v2/team/${teamId}/time_entries`;
//     const { data } = await axios.get(url, {
//         params: { start_date: start, end_date: end }, headers: { Authorization: token },
//     });
//
//     return data.data.map((row: any): TaskLine => ({
//         id: row.task?.id,
//         name: row.task?.name,
//         qty: +(row.duration / 3600000).toFixed(2),
//         unitPrice: rateCZK,
//     }));
// }
