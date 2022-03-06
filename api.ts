import express from "express";

const router = express.Router();

router.get("/hello", function (req, res) {
  res.send("hello");
});

router.get("/hello/:id", function (req, res) {
  res.send("hello " + req.params.id);
});

export default router;
