import express, { response } from "express";
import { queryDatabase } from "../utils/functions.js";

const usersRouter = express.Router();

usersRouter.get("/", async (req, res) => {
  try {
    const sql_query = `SELECT * FROM users`;
    const results = await queryDatabase(sql_query);
    res.send(results);
  } catch (err) {
    res.send(err.message);
  }
});

export default usersRouter;
