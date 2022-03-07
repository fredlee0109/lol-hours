import "dotenv/config";
import express from "express";
import createServer from "next";
import router from "./api";

const dev = process.env.NODE_ENV !== "production";
const app = createServer({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    server.use("/api", router);

    server.get("/p/:id", (req, res) => {
      const actualPage = "/post";
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(process.env.PORT || 3000, () => {
      console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error(error.stack);
    throw error;
  });
