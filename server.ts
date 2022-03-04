import express from "express";
import createServer from "next";
import router from "./api";

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

    server.get("/test", (req, res) => {
      res.send("test");
    });

    server.get("*", (req, res) => {
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
