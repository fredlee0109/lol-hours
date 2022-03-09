// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { RiotAPI, RiotAPITypes, PlatformId } from "@fightmegg/riot-api";
import type { NextApiRequest, NextApiResponse } from "next";
import "dotenv/config";

type ResponseData = {
  data?: RiotAPITypes.MatchV5.MatchDTO[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const platform: RiotAPITypes.LoLRegion = req.query
      .request as unknown as RiotAPITypes.LoLRegion;
    const rAPI = new RiotAPI(process.env.RIOT_API_KEY!);
    const summoner: RiotAPITypes.Summoner.SummonerDTO =
      await rAPI.summoner.getBySummonerName({
        // region: platform,
        region: PlatformId.NA1,
        summonerName: req.query.id as string,
      });
    const matches: string[] = await rAPI.matchV5.getIdsbyPuuid({
      cluster: PlatformId.AMERICAS,
      puuid: summoner.puuid,
      params: {
        count: 5,
      },
    });

    const matchDtos: RiotAPITypes.MatchV5.MatchDTO[] = await Promise.all(
      matches.map(async (matchId) => {
        return await rAPI.matchV5.getMatchById({
          cluster: PlatformId.AMERICAS,
          matchId: matchId,
        });
      })
    );
    res.status(200).send({ data: matchDtos });
  } catch (error) {
    console.error("api.ts ERROR: ", error, typeof error);
    res.status(500).send({});
  }
}
