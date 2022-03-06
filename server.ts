import "dotenv/config";
import express from "express";
import createServer from "next";
import router from "./api";
import { RiotAPI, RiotAPITypes, PlatformId } from "@fightmegg/riot-api";

const dev = process.env.NODE_ENV !== "production";
const nextServer = createServer({ dev });
const requestHandler = nextServer.getRequestHandler();

nextServer
  .prepare()
  .then(() => {
    const server = express();

    server.use("/api", router);

    server.get("/p/:id", (req, res) => {
      const actualPage = "/post";
      const queryParams = { id: req.params.id };

      nextServer.render(req, res, actualPage, queryParams);
    });

    server.get("/test", async (req, res) => {
      try {
        const rAPI = new RiotAPI(process.env.RIOT_API_KEY!);

        const summoner: RiotAPITypes.Summoner.SummonerDTO =
          await rAPI.summoner.getBySummonerName({
            region: PlatformId.NA1,
            summonerName: "rnuji",
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
        console.error("ERROR: ", error, typeof error);
        res.status(500).send(error);
      }
    });

    server.get("*", (req, res) => {
      console.log("FRED server.get(*)");
      return requestHandler(req, res);
    });

    server.listen(process.env.PORT || 3000, () => {
      console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch((ex: any) => {
    console.error(ex.stack);
    process.exit(1);
  });
