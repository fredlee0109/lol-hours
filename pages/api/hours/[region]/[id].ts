import { PlatformId, RiotAPI, RiotAPITypes } from "@fightmegg/riot-api";
import "dotenv/config";
import moment, { Moment } from "moment";
import type { NextApiRequest, NextApiResponse } from "next";

console.log("process.env.RIOT_API_KEY", process.env.RIOT_API_KEY);

const rAPI = new RiotAPI(process.env.RIOT_API_KEY!, {
  debug: process.env.NODE_ENV === "development",
  cache: {
    cacheType: "local",
    ttls: {
      byMethod: {
        [RiotAPITypes.METHOD_KEY.MATCH_V5.GET_MATCH_BY_ID]: 1000 * 60 * 60, // 1hr in ms
        [RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME]: 1000 * 60 * 60, // 1hr in ms
        [RiotAPITypes.METHOD_KEY.MATCH_V5.GET_IDS_BY_PUUID]: 1000 * 60 * 60, // 1hr in ms
      },
    },
  },
});

type ResponseData = {
  totalHoursSpent?: number;
  dailyAverageHoursSpent?: number;
  firstGameDate?: Moment;
  matchesPlayed?: number;
  profileIcon?: string;
  summonerName?: string;
  summonerLevel?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const { region, cluster } = getRegion(req.query.region as string);

    // https://developer.riotgames.com/apis#summoner-v4/GET_getBySummonerName
    const summoner: RiotAPITypes.Summoner.SummonerDTO =
      await rAPI.summoner.getBySummonerName({
        region: region,
        summonerName: req.query.id as string,
      });
    const profileIconsPromise = rAPI.ddragon.profileIcons();

    let matchesPlayed = 0;
    let firstMatchId = "";
    let firstGameDate: Moment;
    const batchCount = 100; // 100 is maximum.
    for (let i = 0; i < 100; i++) {
      // https://developer.riotgames.com/apis#match-v5/GET_getMatchIdsByPUUID
      const matches: string[] = await rAPI.matchV5.getIdsbyPuuid({
        cluster: cluster,
        puuid: summoner.puuid,
        params: {
          count: batchCount,
          start: batchCount * i,
        },
      });
      if (matches.length) {
        matchesPlayed += matches.length;
        console.log("matchesPlayed", matchesPlayed);
        firstMatchId = matches[matches.length - 1];
      } else {
        break;
      }
    }

    if (firstMatchId) {
      // https://developer.riotgames.com/apis#match-v5/GET_getMatch
      try {
        const match: RiotAPITypes.MatchV5.MatchDTO =
          await rAPI.matchV5.getMatchById({
            cluster: cluster,
            matchId: firstMatchId!,
          });
        firstGameDate = moment(match.info.gameCreation);
        console.log(
          "first match",
          moment(firstGameDate),
          match.info.gameName,
          match.info.gameMode,
          match.info.gameType,
          match.info.gameVersion,
          match.info.mapId,
          match.info.queueId
        );
      } catch (error) {
        // Happened with summoner name = "test"
        console.error("getMatchById ERROR", error);
      }
    }

    const profileIcons = await profileIconsPromise;
    const totalHoursSpent = matchesPlayed * 0.5;
    res.status(200).send({
      totalHoursSpent: totalHoursSpent,
      dailyAverageHoursSpent:
        totalHoursSpent / moment().diff(firstGameDate!, "d"),
      firstGameDate: firstGameDate!,
      matchesPlayed: matchesPlayed,
      profileIcon: `http://ddragon.leagueoflegends.com/cdn/${
        profileIcons.version
      }/img/profileicon/${
        profileIcons.data[summoner.profileIconId].image.full
      }`,
      summonerName: summoner.name,
      summonerLevel: summoner.summonerLevel,
    });
  } catch (error) {
    console.error("api.ts ERROR: ", error);
    res.status(500).send({});
  }
}

function getRegion(region: string): {
  region: RiotAPITypes.LoLRegion;
  cluster: RiotAPITypes.Cluster;
} {
  switch (region.toLowerCase()) {
    case PlatformId.NA1:
      return {
        region: PlatformId.NA1,
        cluster: PlatformId.AMERICAS,
      };
    default:
      //TODO: Handle other region cases
      return {
        region: PlatformId.NA1,
        cluster: PlatformId.AMERICAS,
      };
  }
}
