import crons from "./utils/crons";

const CONFIG = {
    UPDATE_QUEUE_AGE : Number(process.env.UPDATE_AGE) || 3600,
    UPDATE_QUEUE_LIMIT: Number(process.env.UPDATE_LIMIT) || 20,
    UPDATE_QUEUE_TIMEOUT: Number(process.env.UPDATE_TIMEOUT) || 200,
    CRON_STRING: process.env.CRON_STRING || crons.everyHour,
    MAX_FAILED_RETRIES: Number(process.env.MAX_FAILED_RETRIES) || 7
}
export default CONFIG;