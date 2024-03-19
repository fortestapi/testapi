import express, { response } from "express";
import { queryDatabase } from "../utils/functions.js";

const usersRouter = express.Router();

usersRouter.get("/", async (req, res) => {
  try {
   res.send('users')
  } catch (err) {
    res.send(err.message);
  }
});

export default usersRouter;
