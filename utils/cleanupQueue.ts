import dayjs from "dayjs";
import { getLeetcodeStatsToSave } from "./leetcode";
import CONFIG from "../config";
import { initializeDB } from "../db"


export const failedRetriesRemoval = async ({ max_retries = CONFIG.MAX_FAILED_RETRIES }) => {
    const db = initializeDB();

    try {
        const users_to_delete = await db.user.deleteMany({
            where: {
                failedRetries: {
                    gt: max_retries
                },
            },
        })
        console.log(users_to_delete)
        console.log("DELETED INACTIVE USERS")

    } catch (error) {
        console.log(error)

    }



};