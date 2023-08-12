import express from "express";
import { conection } from "../index.js";

const casesRouter = express.Router();

casesRouter.get("/", async (req, res) => {
  const sql_query = `SELECT * FROM cases`;
  conection.query(sql_query, (err, result) => {
    if (err) res.send(err.message);
    res.send(result);
  });
});

casesRouter.get("/:id", async (req, res) => {
  const sql_query = `SELECT * FROM cases WHERE id = ${req.params.id}`;
  conection.query(sql_query, (err, result) => {
    if (err) res.send(err.message);
    res.send(result);
  });
});

casesRouter.post("/", async (req, res) => {
  const { name, description, cost, items } = req.body;
  const sql_query = `INSERT INTO cases (name, description, cost, items) VALUES ('${name}', '${description}', '${cost}', '${items}');`;
  conection.query(sql_query, (err, result) => {
    if (err) res.send(err.message);
    res.send(result);
  });
});

casesRouter.put("/:id", async (req, res) => {
  const { name, description, cost, items } = req.body;
  const sql_query = `UPDATE cases set name="${name}", description="${description}", cost="${cost}", items="${items}"  WHERE id = ${req.params.id}`;
  conection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

casesRouter.delete("/:id", async (req, res) => {
  const sql_query = `DELETE FROM cases WHERE id = ${req.params.id}`;
  conection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

export default casesRouter;
