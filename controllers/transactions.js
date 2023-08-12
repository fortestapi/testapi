import express from "express";
import { VALIDATION_PASSWORD } from "../utils/config.js";
import { conection } from "../index.js";

const transactionsRouter = express.Router();

transactionsRouter.get("/", async (req, res) => {
  const sql_query = `SELECT * FROM transactions`;
  conection.query(sql_query, (err, result) => {
    if (err) res.send(err.message);
    res.send(result);
  });
});

transactionsRouter.get("/:id", async (req, res) => {
  const sql_query = `SELECT * FROM transactions WHERE id = ${req.params.id}`;
  conection.query(sql_query, (err, result) => {
    if (err) res.send(err.message);
    res.send(result);
  });
});

transactionsRouter.post("/", async (req, res) => {
   const { userId, type, amount, timestamp } = req.body;
   const sql_query = `INSERT INTO transactions (userId, type, amount, timestamp) VALUES ('${userId}', '${type}', '${amount}', '${timestamp}');`;
   conection.query(sql_query, (err, result) => {
     if (err) res.send(err.message);
     res.send(result);
   });
});

transactionsRouter.put("/:id", async (req, res) => {
 const { userId, type, amount, timestamp } = req.body;
 const sql_query = `UPDATE transactions set userId="${userId}", type="${type}", amount="${amount}", timestamp="${timestamp}"  WHERE id = ${req.params.id}`;
 conection.query(sql_query, (err, result) => {
   if (err) throw err;
   res.send(result);
 });
});

transactionsRouter.delete("/:id", async (req, res) => {
   const sql_query = `DELETE FROM transactions WHERE id = ${req.params.id}`;
   conection.query(sql_query, (err, result) => {
     if (err) throw err;
     res.send(result);
   });
});

export default transactionsRouter;
