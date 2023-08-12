import express from "express";
import { conection } from "../index.js";
import { VALIDATION_PASSWORD } from "../utils/config.js";

const transactionsRouter = express.Router();

transactionsRouter.get("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const sql_query = `SELECT * FROM transactions`;
    conection.query(sql_query, (err, result) => {
      if (err) res.send(err.message);
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

transactionsRouter.get("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const sql_query = `SELECT * FROM transactions WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      if (err) res.send(err.message);
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

transactionsRouter.post("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const { userId, type, amount, timestamp } = req.body;
    const sql_query = `INSERT INTO transactions (userId, type, amount, timestamp) VALUES ('${userId}', '${type}', '${amount}', '${timestamp}');`;
    conection.query(sql_query, (err, result) => {
      if (err) res.send(err.message);
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

transactionsRouter.put("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const { userId, type, amount, timestamp } = req.body;
    const sql_query = `UPDATE transactions set userId="${userId}", type="${type}", amount="${amount}", timestamp="${timestamp}"  WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

transactionsRouter.delete("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const sql_query = `DELETE FROM transactions WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

export default transactionsRouter;
