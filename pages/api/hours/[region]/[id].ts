import { PlatformId, RiotAPI, RiotAPITypes } from "@fightmegg/riot-api";
import "dotenv/config";
import moment, { Moment } from "moment";
import type { NextApiRequest, NextApiResponse } from "next";

console.log("process.env.NODE_ENV", process.env.NODE_ENV);
console.log("process.env.RIOT_API_KEY", process.env.RIOT_API_KEY);

const rAPI = new RiotAPI(process.env.RIOT_API_KEY!, {
  debug: process.env.NODE_ENV === "development",
  cache: {
    cacheType: "local",
    ttls: {
      byMethod: {
        [RiotAPITypes.METHOD_KEY.MATCH_V5.GET_MATCH_BY_ID]: 1000 * 60 * 10, // 10min in ms
        [RiotAPITypes.METHOD_KEY.SUMMONER.GET_BY_SUMMONER_NAME]: 1000 * 60 * 10, // 10min in ms
        [RiotAPITypes.METHOD_KEY.MATCH_V5.GET_IDS_BY_PUUID]: 1000 * 60 * 10, // 10min in ms
      },
    },
  },
});

type ResponseData = {
  matchesComputed?: number;
  timeSpent?: number;
  data?: RiotAPITypes.MatchV5.MatchDTO[];
  firstGameTime?: Moment;
  daysSinceFirstGame?: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    let quota: number = parseInt(process.env.QUOTA as string);
    const { region, cluster } = getRegion(req.query.region as string);

    // https://developer.riotgames.com/apis#summoner-v4/GET_getBySummonerName
    const summoner: RiotAPITypes.Summoner.SummonerDTO =
      await rAPI.summoner.getBySummonerName({
        region: region,
        summonerName: req.query.id as string,
      });
    quota--;

    // https://developer.riotgames.com/apis#match-v5/GET_getMatchIdsByPUUID
    const matches: string[] = await rAPI.matchV5.getIdsbyPuuid({
      cluster: cluster,
      puuid: summoner.puuid,
      params: {
        count: 100, // 100 is maximum.
      },
    });
    quota--;

    let firstGameTime: Moment;
    let matchesComputed = 0;
    let timeSpent = 0;
    await Promise.all(
      matches
        .filter((_match, index) => index < quota)
        .map(async (matchId, index, { length }) => {
          matchesComputed++;
          // https://developer.riotgames.com/apis#match-v5/GET_getMatch
          try {
            const match: RiotAPITypes.MatchV5.MatchDTO =
              await rAPI.matchV5.getMatchById({
                cluster: cluster,
                matchId: matchId,
              });

            timeSpent += match.info.gameDuration;
            if (index + 1 === length) {
              firstGameTime = moment(match.info.gameCreation);
            }
          } catch (error) {
            console.error("ERROR in matchv5.getMatchById", error);
          }
        })
    );

    const daysSinceFirstGame = moment().diff(moment(firstGameTime!), "d");

    res.status(200).send({
      matchesComputed: matchesComputed,
      timeSpent: timeSpent,
      firstGameTime: firstGameTime!,
      daysSinceFirstGame: daysSinceFirstGame,
    });
  } catch (error) {
    console.error("api.ts ERROR: ", error, typeof error);
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
