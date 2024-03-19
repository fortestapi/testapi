import express from "express";
import { queryDatabase } from "../utils/functions.js";

const questionsRouter = express.Router();

questionsRouter.get("/active", async (req, res) => {
  const getActiveQuestionQuerry = `SELECT * FROM questions WHERE active = ?`;
  const result = await queryDatabase(getActiveQuestionQuerry, [1]);
  res.send(result);
});

export default questionsRouter;
