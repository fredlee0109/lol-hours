import { RiotAPI, RiotAPITypes, PlatformId } from "@fightmegg/riot-api";
import type { NextApiRequest, NextApiResponse } from "next";
import "dotenv/config";

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
  duration?: number;
  data?: RiotAPITypes.MatchV5.MatchDTO[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    console.log("process.env.NODE_ENV", process.env.NODE_ENV);
    console.log("process.env.RIOT_API_KEY", process.env.RIOT_API_KEY);
    console.log("rAPI", rAPI);

    let quota: number = parseInt(process.env.QUOTA as string);
    const { region, cluster } = getRegion(req.query.region as string);

    console.log("region", region);
    console.log("cluster", cluster);

    // https://developer.riotgames.com/apis#summoner-v4/GET_getBySummonerName
    const summoner: RiotAPITypes.Summoner.SummonerDTO =
      await rAPI.summoner.getBySummonerName({
        region: region,
        summonerName: req.query.id as string,
      });
    quota--;

    console.log("summoner", summoner);

    // https://developer.riotgames.com/apis#match-v5/GET_getMatchIdsByPUUID
    const matches: string[] = await rAPI.matchV5.getIdsbyPuuid({
      cluster: cluster,
      puuid: summoner.puuid,
      params: {
        count: 100, // 100 is maximum.
      },
    });
    quota--;

    console.log("matches", matches);

    let firstGameTime: Date;
    let matchesComputed = 0;
    let duration = 0;
    await Promise.all(
      matches
        .filter((_match, index) => index < quota)
        .map(async (matchId, index, { length }) => {
          matchesComputed++;
          // https://developer.riotgames.com/apis#match-v5/GET_getMatch
          const res: RiotAPITypes.MatchV5.MatchDTO =
            await rAPI.matchV5.getMatchById({
              cluster: cluster,
              matchId: matchId,
            });
          console.log("FRED creation", index, new Date(res.info.gameCreation));
          duration += res.info.gameDuration;
          if (index + 1 === length) {
            firstGameTime = new Date(res.info.gameCreation);
            console.log("FRED FOUND IT", new Date(res.info.gameCreation));
          }
        })
    );
    console.log("FRED firstGameTime", firstGameTime!);

    res
      .status(200)
      .send({ matchesComputed: matchesComputed, duration: duration });
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
