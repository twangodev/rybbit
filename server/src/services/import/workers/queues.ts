import boss from "../../../db/postgres/boss.js";
import { CSV_PARSE_QUEUE, DATA_INSERT_QUEUE } from "./jobs.js";

export const createJobQueues = async () => {
  await boss.createQueue(CSV_PARSE_QUEUE);
  await boss.createQueue(DATA_INSERT_QUEUE);
}
