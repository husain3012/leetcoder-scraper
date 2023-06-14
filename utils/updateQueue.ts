import dayjs from "dayjs";
import { getLeetcodeStatsToSave} from "./leetcode";
import CONFIG from "../config";
import {initializeDB} from "../db"
import { getLCAccount } from "leetcode-public-api";


export const updateQueue = async ({age = CONFIG.UPDATE_QUEUE_AGE, limit = CONFIG.UPDATE_QUEUE_LIMIT}) => {
    const db = initializeDB();
    console.log(`age: ${age}, limit: ${limit}`)
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
  
      console.log(`Currently processing ${usersToUpdate.length} users:  `, usersToUpdate.map(u => u.leetcodeUsername));
  
      for (let user of usersToUpdate) {
        const leetcodeStatsData = await getLCAccount(user.leetcodeUsername);
        if(!leetcodeStatsData.data){
          console.log(`Could not find data for ${user.leetcodeUsername} : ${[leetcodeStatsData.status]} ${leetcodeStatsData.statusText}`)
        }else{
          console.log(`Fetched for ${leetcodeStatsData.data.username} (${leetcodeStatsData.data.profile.realName}), ranking: ${leetcodeStatsData.data.profile.ranking}`)
        }
  

  
        const leetcodeStatsToSave = (leetcodeStatsData.status==200 && leetcodeStatsData.data)?getLeetcodeStatsToSave(leetcodeStatsData.data):null;
  
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            lastUpdated: dayjs().toDate(),
            ...(leetcodeStatsToSave!=null
              ? {
                leetcodeStats: {
                  upsert: {
                    update: leetcodeStatsToSave,
                    create: leetcodeStatsToSave,
                  },
                },
                failedRetries: 0
              }
              : {
                failedRetries: {
                  increment: 1
                }
              }),
          },
        });
        updatedUsers.push({
          username: user.leetcodeUsername,
          success: leetcodeStatsData.status == 200,
          status: leetcodeStatsData.status
        });
        const randomTimeout= Math.floor(1000 + Math.random() * 1000)
        console.log(`Waiting for ${randomTimeout} ms`);
        await new Promise((resolve) => setTimeout(resolve,  randomTimeout));
      }
    } catch (error) {
      console.log(error);
    }
    console.log("Done ✅")
  };