import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { getLeetcodeStatsToSave } from "./utils";
import cron from "node-cron"
import dontenv from "dotenv"
import crons from "./crons"
import {getLCAccount} from "leetcode-public-api"
dontenv.config();
// *=========================== CONFIG ===========================*
const AGE  = Number(process.env.UPDATE_AGE) || 3600
const LIMIT  = Number(process.env.UPDATE_LIMIT) || 20
const TIMEOUT  = Number(process.env.UPDATE_TIMEOUT) || 200
const CRON_STRING = process.env.CRON_STRING || crons.everyHour
// *==============================================================*



const db = new PrismaClient();
let isFunctionRunning = false;



const updateQueue = async (age = AGE, limit = LIMIT, timeout = TIMEOUT) => {
  console.log(`age: ${age}, limit: ${limit}, timeout: ${timeout}`)
  let updatedUsers = [];
  try {
    const usersToUpdate = await db.user.findMany({
      where: {
        lastUpdated: {
          lte: dayjs().subtract(age, "seconds").toDate(),
        },
      },
      select: {
        lastAccessed: true,
        lastUpdated: true,
        leetcodeUsername: true,
        id: true,
      },
      orderBy: {
        lastUpdated: "asc",
      },
      take: limit,
    });

console.log(`Currently processing ${usersToUpdate.length} users:  `, usersToUpdate.map(u=>u.leetcodeUsername));

    for (let user of usersToUpdate) {
      const leetcodeStatsData = await getLCAccount(user.leetcodeUsername);
     

      const leetcodeStatsToSave = getLeetcodeStatsToSave(leetcodeStatsData.data);

      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastUpdated: dayjs().toDate(),
          ...(leetcodeStatsData.status == 200
            ? {
                leetcodeStats: {
                  upsert: {
                    update: leetcodeStatsToSave,
                    create: leetcodeStatsToSave,
                  },
                },
              }
            : {}),
        },
      });
      updatedUsers.push({
        username: user.leetcodeUsername,
        success: leetcodeStatsData.status == 200,
        status: leetcodeStatsData.status
      });
      await new Promise((resolve) => setTimeout(resolve, timeout));
    }
  } catch (error) {
    console.log(error);
  }
  console.log("Done ✅")
};

cron.schedule(CRON_STRING, async ()=> {
  console.log(`[${dayjs().format("mm:hh a, DD-MMM-YYYY")}] Triggering CRON JOB ⏲!`)
  
  if(isFunctionRunning) {
    console.log("⚠️ Job skipped: ALREADY RUNNING")
  };
 isFunctionRunning = true;

 await updateQueue(AGE, LIMIT, Math.floor(200+Math.random()*100))
 isFunctionRunning = false;


})
cron.getTasks().forEach((_,x)=>console.log("cron scheduled:", x))