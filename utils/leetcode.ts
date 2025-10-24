import {ILeetCodeUser} from "leetcode-public-api/types"

export const getLeetcodeStatsToSave = (leetcodeUser: ILeetCodeUser) => {
  return {
    easySolved: leetcodeUser.submitStatsGlobal.acSubmissionNum.find(
      (s) => s.difficulty == "Easy"
    )?.count ?? 0,
    mediumSolved: leetcodeUser.submitStatsGlobal.acSubmissionNum.find(
      (s) => s.difficulty == "Medium"
    )?.count ?? 0,
    hardSolved: leetcodeUser.submitStatsGlobal.acSubmissionNum.find(
      (s) => s.difficulty == "Hard"
    )?.count ?? 0,
    ranking: leetcodeUser.profile.ranking,
    streak: leetcodeUser.userCalendar.streak,
    avatar: leetcodeUser.profile.userAvatar,
    contestAttended: leetcodeUser.contestAttended,
    contestRanking: leetcodeUser.contestRanking,
    contestRating: leetcodeUser.contestRating,
  };
};
