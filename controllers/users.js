import express from "express";
import { queryDatabase } from "../utils/functions.js";

const usersRouter = express.Router();

usersRouter.delete("/delete", async (req, res) => {
  const { email } = req.body;
  const deleteQuerry = `DELETE FROM users WHERE email =?`;
  await queryDatabase(deleteQuerry, [email]);
  res.send("succesfull");
});

usersRouter.get("/transactions", async (req, res) => {
  const { email } = req.body;
  try {
    const sql_query = `SELECT * FROM transactions WHERE user_email=?`;
    const results = await queryDatabase(sql_query, [email]);
    res.send(results);
  } catch (err) {
    res.send(err.message);
  }
});

usersRouter.get("/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const sql_query = `SELECT * FROM users WHERE token = ?`;
    const data = await queryDatabase(sql_query, [token]);
     if (data[0]) {
       const {email} = data[0]
       const transactionsQuerry = `SELECT date,status,amount,trasaction_info FROM transactions WHERE user_email=?`;
       const transactions = await queryDatabase(transactionsQuerry, [email]);
       console.log(transactions);
         const response={userData:data,
          transactions:transactions
         }
      res.send(response);
     } else {
       res.send("user not found");
     }
  } catch (err) {
    res.send(err.message);
  }
});

usersRouter.get("/", async (req, res) => {
  const { token } = req.params;
  try {
    const sql_query = `SELECT * FROM users`;
    const result = await queryDatabase(sql_query);
    if (result[0]) {
      res.send(result);
    } else {
      res.send("user not found");
    }
  } catch (err) {
    res.send(err.message);
  }
});

export default usersRouter;
