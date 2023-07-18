import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
import { getLeetcodeStatsToSave } from "./utils";
import cron from "node-cron"
import dontenv from "dotenv"
import crons from "./utils/crons"
import { getLCAccount } from "leetcode-public-api"
import CONFIG from "./config";
import { updateQueue } from "./utils/updateQueue";
import { failedRetriesRemoval } from "./utils/cleanupQueue";
dontenv.config();


const db = new PrismaClient();
let isUpdateQueueRunning = false;
let isUserCLeanupQueueRunning = false;






const checkDBConnection = async () => {
  try {
    await db.$connect();
    console.log(`Connected to DataBase`)
  } catch (error) {
    console.log(`Could not connect to DataBase`, error)
    console.log('Closing cron jobs!')
    
    cron.getTasks().forEach((task,name)=>{
      console.log(`🛑 Stopping ${name}`)
      task.stop();
    })
    
  }finally{
    await db.$disconnect();
    console.log(`Testing connection closed`)
  }
  
}

checkDBConnection();

cron.schedule(CONFIG.CRON_STRING, async () => {
  console.log(`[${dayjs().format("mm:hh a, DD-MMM-YYYY")}] Triggering CRON JOB ⏲!`)

  if (isUpdateQueueRunning) {
    console.log("⚠️ Job skipped: ALREADY RUNNING")
  };
  isUpdateQueueRunning = true;

  await updateQueue({})
  isUpdateQueueRunning = false;


})

cron.schedule(crons.everyDayAtMidnight, async () => {
  console.log(`[${dayjs().format("mm:hh a, DD-MMM-YYYY")}] Triggering CRON JOB ⏲!`)

  if (isUserCLeanupQueueRunning) {
    console.log("⚠️ Job skipped: ALREADY RUNNING")
  };
  isUserCLeanupQueueRunning = true;

  await failedRetriesRemoval({})
  isUserCLeanupQueueRunning = false;


})


const main = async () =>{
  await updateQueue({})
  await failedRetriesRemoval({})
  cron.getTasks().forEach((_, x) => console.log("cron scheduled:", x))
}

main();