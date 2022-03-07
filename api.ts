import { RiotAPI, RiotAPITypes, PlatformId } from "@fightmegg/riot-api";
import express from "express";

const router = express.Router();

router.get("/hours/:region/:id", async function (req, res) {
  try {
    const rAPI = new RiotAPI(process.env.RIOT_API_KEY!);

    const summoner: RiotAPITypes.Summoner.SummonerDTO =
      await rAPI.summoner.getBySummonerName({
        region: PlatformId[req.params.region],
        summonerName: req.params.id,
      });
    const matches: string[] = await rAPI.matchV5.getIdsbyPuuid({
      cluster: PlatformId.AMERICAS,
      puuid: summoner.puuid,
      params: {
        // count: 100,
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
    res.send(matchDtos);
  } catch (error) {
    console.error("api.ts ERROR: ", error, typeof error);
    res.status(500).send(error);
  }
});

export default router;
