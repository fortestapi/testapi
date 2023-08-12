import express from "express";
import { conection } from "../index.js";
import { VALIDATION_PASSWORD } from "../utils/config.js";

const casesRouter = express.Router();

casesRouter.get("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    conection.query("SELECT * FROM cases", (err, result) => {
      if (err) res.send(err.message);
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

casesRouter.get("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    conection.query(
      `SELECT * FROM cases WHERE id = ${req.params.id}`,
      (err, result) => {
        if (err) res.send(err.message);
        res.send(result);
      }
    );
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

casesRouter.post("/", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const { name, description, cost, items } = req.body;
    const sql_query = `INSERT INTO cases (name, description, cost, items) VALUES ('${name}', '${description}', '${cost}', '${items}');`;
    conection.query(sql_query, (err, result) => {
      if (err) res.send(err.message);
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

casesRouter.put("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const { name, description, cost, items } = req.body;
    const sql_query = `UPDATE cases set name="${name}", description="${description}", cost="${cost}", items="${items}"  WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

casesRouter.delete("/:id", async (req, res) => {
  if (VALIDATION_PASSWORD == req.headers.authorization) {
    const sql_query = `DELETE FROM cases WHERE id = ${req.params.id}`;
    conection.query(sql_query, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  } else {
    res.status(401).send("you have no permission to this address");
  }
});

export default casesRouter;
